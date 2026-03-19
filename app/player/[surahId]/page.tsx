'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { PlayerBar } from '@/components/PlayerBar';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { SurahCompleteModal } from '@/components/SurahCompleteModal';
import { VerseCard } from '@/components/VerseCard';
import { usePlayer } from '@/hooks/usePlayer';
import { useSurahData } from '@/hooks/useSurahData';
import { toggleBookmark, getBookmarks } from '@/lib/bookmarks';
import { recordSessionToday } from '@/lib/streak';
import { loginWithPKCE, clearSession, getSession, getUserToken } from '@/lib/auth';
import type { Verse } from '@/types/quran';

const LAST_POSITION_KEY = 'bilingual_radio_last_position';

interface LastPosition {
  surahId: number;
  verseIndex: number;
}

export default function PlayerPage() {
  const router = useRouter();
  const params = useParams<{ surahId: string }>();
  const surahId = Number(params?.surahId);

  const {
    chapters,
    recitations,
    translations,
    translationId,
    setTranslationId,
    verses,
    isLoadingSurah,
    error,
    setError,
    loadSurah,
    clearSurahCache,
  } = useSurahData();

  const [recitationId,        setRecitationId]       = useState(7);
  const [settingsOpen,        setSettingsOpen]       = useState(false);
  const [surahCompleteOpen,   setSurahCompleteOpen]  = useState(false);
  const [bookmarkedVerseKeys, setBookmarkedVerseKeys] = useState<string[]>([]);
  const [userEmail,           setUserEmail]          = useState<string | null>(null);

  // Load auth session on mount
  useEffect(() => {
    setUserEmail(getSession()?.email ?? null);
  }, []);

  const sessionTrackedRef = useRef(false);

  const selectedChapter = useMemo(
    () => chapters.find((c) => c.id === surahId),
    [chapters, surahId]
  );

  const selectedReciter = useMemo(
    () => recitations.find((r) => r.id === recitationId),
    [recitations, recitationId]
  );

  const selectedTranslation = useMemo(
    () => translations.find((t) => t.id === translationId),
    [translations, translationId]
  );

  const nextChapter = useMemo(
    () => chapters.find((c) => c.id === surahId + 1),
    [chapters, surahId]
  );

  const canLoadSurah =
    Number.isFinite(surahId) && surahId >= 1 && surahId <= 114;

  const onSurahComplete = useCallback(() => {
    if (!canLoadSurah) return;

    // Log completed reading session to Quran Foundation User API (fire-and-forget)
    const token = getUserToken();
    void fetch('/api/qdc/reading_sessions', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'x-user-token': token } : {}),
      },
      body:    JSON.stringify({ chapter_number: surahId, verses_count: verses.length }),
    }).catch(() => {});

    setSurahCompleteOpen(true);
  }, [canLoadSurah, surahId, verses.length]);

  const onSessionStart = useCallback(() => {
    if (sessionTrackedRef.current) return;
    sessionTrackedRef.current = true;
    recordSessionToday();
  }, []);

  const {
    currentVerseIndex,
    isPlaying,
    playMode,
    currentTrack,
    pauseGapMs,
    playbackSpeed,
    completedVerseIndexes,
    setPlayMode,
    setPauseGapMs,
    setPlaybackSpeed,
    play,
    pause,
    seekToVerse,
    nextVerse,
    previousVerse,
    restartSurah,
  } = usePlayer({
    verses,
    translationLang: selectedTranslation?.language_name,
    onVerseCompleted: (verse) => {
      // Log each verse completion to Quran Foundation User API (fire-and-forget)
      const token = getUserToken();
      void fetch('/api/qdc/reading_sessions', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-user-token': token } : {}),
        },
        body:    JSON.stringify({
          chapter_number: surahId,
          verse_number:   verse.verseNumber,
          verse_key:      verse.verseKey,
        }),
      }).catch(() => {});
    },
    onSurahComplete,
    onSessionStart,
  });

  /* Reset session tracker when surah changes */
  useEffect(() => {
    sessionTrackedRef.current = false;
  }, [surahId, recitationId]);

  /* Load surah verses + audio whenever surah, reciter, or translation changes */
  useEffect(() => {
    if (!canLoadSurah) return;

    let ignore = false;

    void (async () => {
      try {
        await loadSurah(surahId, recitationId, translationId);
        if (!ignore) setError(null);
      } catch {
        if (!ignore)
          setError('Could not load Surah. Please check your connection.');
      }
    })();

    return () => {
      ignore = true;
    };
  }, [canLoadSurah, loadSurah, recitationId, setError, surahId, translationId]);

  /* Restore last verse position */
  useEffect(() => {
    if (!canLoadSurah || verses.length === 0) return;

    const raw = localStorage.getItem(LAST_POSITION_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as LastPosition;
      if (
        parsed.surahId === surahId &&
        parsed.verseIndex >= 0 &&
        parsed.verseIndex < verses.length
      ) {
        seekToVerse(parsed.verseIndex);
      }
    } catch {
      localStorage.removeItem(LAST_POSITION_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoadSurah, surahId, verses.length]);

  /* Persist current position */
  useEffect(() => {
    if (!canLoadSurah || verses.length === 0) return;

    localStorage.setItem(
      LAST_POSITION_KEY,
      JSON.stringify({ surahId, verseIndex: currentVerseIndex })
    );
  }, [canLoadSurah, currentVerseIndex, surahId, verses.length]);

  /* Load bookmarks from localStorage */
  useEffect(() => {
    setBookmarkedVerseKeys(getBookmarks());
  }, []);

  /* Auto-scroll active verse into view */
  useEffect(() => {
    document
      .getElementById(`verse-${currentVerseIndex}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentTrack, currentVerseIndex]);

  /* Keyboard shortcuts */
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input,textarea,select')) return;

      if (event.code === 'Space') {
        event.preventDefault();
        isPlaying ? pause() : play();
      } else if (event.code === 'ArrowRight') {
        event.preventDefault();
        nextVerse();
      } else if (event.code === 'ArrowLeft') {
        event.preventDefault();
        previousVerse();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlaying, nextVerse, pause, play, previousVerse]);

  /* Media Session API */
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator))
      return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: selectedChapter
        ? `Surah ${selectedChapter.name_simple}`
        : 'Bilingual Quran Radio',
      artist: selectedReciter?.reciter_name ?? 'Quran.com',
      album: 'Bilingual Quran Radio',
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    navigator.mediaSession.setActionHandler('play', play);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('nexttrack', nextVerse);
    navigator.mediaSession.setActionHandler('previoustrack', previousVerse);
  }, [
    isPlaying,
    nextVerse,
    pause,
    play,
    previousVerse,
    selectedChapter,
    selectedReciter,
  ]);

  const onBookmark = useCallback((verse: Verse) => {
    setBookmarkedVerseKeys(toggleBookmark(verse.verseKey));
  }, []);

  const onRetry = useCallback(() => {
    if (!canLoadSurah) return;
    void loadSurah(surahId, recitationId, translationId).catch(() => {
      setError('Could not load Surah. Please check your connection.');
    });
  }, [canLoadSurah, loadSurah, recitationId, setError, surahId, translationId]);

  const onSpeedCycle = useCallback(() => {
    const options = [0.75, 1, 1.25, 1.5];
    const idx = options.indexOf(playbackSpeed);
    setPlaybackSpeed(options[(idx + 1) % options.length] ?? 1);
  }, [playbackSpeed, setPlaybackSpeed]);

  const currentVerse = verses[currentVerseIndex] ?? null;

  if (!canLoadSurah) {
    return (
      <section className="mx-auto mt-8 max-w-xl rounded-lg border border-[rgba(239,68,68,0.4)] bg-[rgba(127,29,29,0.2)] p-4 text-sm text-[#fca5a5]">
        Invalid Surah ID. Please go back and choose a Surah from 1 to 114.
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* ── Top nav ── */}
      <header className="sticky top-0 z-[100] h-[52px] border-b border-border bg-bg-surface px-5">
        <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-[-0.01em] text-text-primary"
          >
            Quran<span className="text-teal">.</span>com
          </Link>

          {/* Auth button */}
          {userEmail ? (
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-[11px] font-bold text-black">
                {userEmail[0]?.toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => { clearSession(); setUserEmail(null); }}
                className="text-xs text-text-muted hover:text-text-secondary transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void loginWithPKCE()}
              className="rounded-md border border-border px-3 py-1 text-xs text-text-secondary transition hover:border-teal hover:text-teal"
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* ── Surah sub-nav ── */}
      <section className="sticky top-[52px] z-[90] h-[44px] border-b border-border bg-bg-surface px-5">
        <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium text-text-primary transition hover:bg-bg-hover"
          >
            {selectedChapter
              ? `${surahId}. ${selectedChapter.name_simple}`
              : `Surah ${surahId}`}
            <span className="text-text-muted">▾</span>
          </button>

          <div className="text-xs text-text-secondary">
            {selectedChapter?.verses_count ?? verses.length} verses
          </div>

        </div>
      </section>

      {/* ── Controls toolbar ── */}
      <section className="sticky top-24 z-[80] h-10 border-b border-border bg-bg-surface px-5">
        <div className="mx-auto flex h-full w-full max-w-[1400px] items-center gap-2.5">
          <button
            type="button"
            onClick={() => { if (!isPlaying) play(); }}
            className="rounded-md border border-border px-3 py-1 text-xs text-text-secondary transition hover:border-border-hover hover:text-text-primary"
          >
            Listen
          </button>

          <button
            type="button"
            onClick={() => setPlayMode('arabic_only')}
            className={`rounded-md border px-3 py-1 text-xs transition ${
              playMode === 'arabic_only'
                ? 'border-teal-border bg-teal-dim text-teal'
                : 'border-border text-text-secondary hover:border-border-hover hover:text-text-primary'
            }`}
          >
            Arabic
          </button>

          <button
            type="button"
            onClick={() => setPlayMode('both')}
            className={`rounded-md border px-3 py-1 text-xs transition ${
              playMode === 'both'
                ? 'border-teal-border bg-teal-dim text-teal'
                : 'border-border text-text-secondary hover:border-border-hover hover:text-text-primary'
            }`}
          >
            Both
          </button>

          <button
            type="button"
            onClick={() => setPlayMode('translation_only')}
            className={`rounded-md border px-3 py-1 text-xs transition ${
              playMode === 'translation_only'
                ? 'border-blue-border bg-blue-dim text-blue'
                : 'border-border text-text-secondary hover:border-border-hover hover:text-text-primary'
            }`}
          >
            English
          </button>

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="ml-auto flex items-center gap-1.5 rounded-md border border-border px-3 py-1 text-xs text-text-secondary transition hover:border-border-hover hover:text-text-primary"
          >
            Settings ▾
          </button>
        </div>
      </section>

      {/* ── Main content ── */}
      <main className="pb-[170px]">
        {/* Surah header */}
        <section className="border-b border-border px-5 py-8 text-center">
          <p className="font-surah-name text-[64px] leading-[1.2] text-text-primary">
            {selectedChapter?.name_arabic ?? ''}
          </p>
          <p className="mt-2 flex items-center justify-center gap-2 text-[22px] font-medium text-text-primary">
            {selectedChapter?.name_simple ?? `Surah ${surahId}`}
            <span className="rounded border border-teal-border bg-teal-dim px-2 py-0.5 text-[11px] text-teal capitalize">
              {selectedChapter?.revelation_place ?? '-'}
            </span>
          </p>
          <p className="mt-1 text-[13px] text-text-secondary">
            {selectedChapter?.verses_count ?? verses.length} verses
          </p>

          {/* Surah 1: Bismillah is verse 1:1. Surah 9: no Bismillah. */}
          {surahId !== 1 && surahId !== 9 ? (
            <>
              <p className="font-arabic mt-5 text-3xl text-text-primary">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                In the name of Allah, the Entirely Merciful, the Especially
                Merciful.
              </p>
            </>
          ) : null}
        </section>

        {/* Error */}
        {error ? (
          <section className="mx-5 mt-4 rounded-lg border border-[rgba(239,68,68,0.4)] bg-[rgba(127,29,29,0.2)] p-3 text-sm text-[#fca5a5]">
            {error}
            <button
              type="button"
              onClick={onRetry}
              className="ml-3 rounded border border-[rgba(252,165,165,0.5)] px-2 py-1 text-xs text-[#fecaca] transition hover:bg-[rgba(252,165,165,0.08)]"
            >
              Retry
            </button>
          </section>
        ) : null}

        {/* Loading / Verse list */}
        {isLoadingSurah ? (
          <section className="px-5 py-8 text-center text-sm text-text-secondary">
            Loading verses and audio tracks…
          </section>
        ) : (
          <section>
            {verses.map((verse, index) => (
              <VerseCard
                key={verse.verseKey}
                verse={verse}
                index={index}
                active={index === currentVerseIndex}
                track={index === currentVerseIndex ? currentTrack : 'idle'}
                completed={completedVerseIndexes.includes(index)}
                isBookmarked={bookmarkedVerseKeys.includes(verse.verseKey)}
                onBookmark={onBookmark}
                onSelect={(index) => {
                  seekToVerse(index);
                  if (!isPlaying) play();
                }}
              />
            ))}
          </section>
        )}
      </main>

      <PlayerBar
        verse={currentVerse}
        currentVerseIndex={currentVerseIndex}
        totalVerses={verses.length}
        isPlaying={isPlaying}
        playMode={playMode}
        currentTrack={currentTrack}
        pauseGapMs={pauseGapMs}
        playbackSpeed={playbackSpeed}
        onPlayPause={() => (isPlaying ? pause() : play())}
        onPrevious={previousVerse}
        onNext={nextVerse}
        onRestart={restartSurah}
        onSeek={seekToVerse}
        onPauseGapChange={setPauseGapMs}
        onSpeedCycle={onSpeedCycle}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {surahCompleteOpen && (
        <SurahCompleteModal
          surahName={selectedChapter?.name_simple ?? `Surah ${surahId}`}
          nextSurahName={nextChapter?.name_simple ?? null}
          onContinue={() => {
            setSurahCompleteOpen(false);
            router.push(`/player/${surahId + 1}`);
          }}
          onRestart={() => {
            setSurahCompleteOpen(false);
            restartSurah();
          }}
          onBrowse={() => {
            setSurahCompleteOpen(false);
            router.push('/');
          }}
        />
      )}

      <SettingsDrawer
        isOpen={settingsOpen}
        recitations={recitations}
        translations={translations}
        recitationId={recitationId}
        translationId={translationId}
        playMode={playMode}
        playbackSpeed={playbackSpeed}
        onClose={() => setSettingsOpen(false)}
        onRecitationChange={(id) => {
          setRecitationId(id);
          setSettingsOpen(false);
        }}
        onTranslationChange={(id) => {
          clearSurahCache();
          setTranslationId(id);
          setSettingsOpen(false);
        }}
        onPlayModeChange={setPlayMode}
        onPlaybackSpeedChange={setPlaybackSpeed}
      />
    </div>
  );
}
