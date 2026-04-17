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
import { toggleBookmark, getBookmarks, clearBookmarks, syncBookmarksFromAPI } from '@/lib/bookmarks';
import { recordActivityForVerse } from '@/lib/streak';
import { loginWithPKCE, clearSession, getSession, getUserToken } from '@/lib/auth';
import type { Verse } from '@/types/quran';

const LAST_POSITION_KEY = 'bilingual_radio_last_position';
const AUTOPLAY_KEY     = 'bilingual_radio_autoplay';
const SESSION_EXPIRED_EVENT = 'qf-session-expired';

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

  // Load auth session on mount; restore bookmarks from API if logged in
  useEffect(() => {
    const session = getSession();
    setUserEmail(session?.email ?? null);
    if (session?.accessToken) {
      void syncBookmarksFromAPI(session.accessToken).then((keys) => {
        setBookmarkedVerseKeys(keys);
      });
    } else {
      setBookmarkedVerseKeys(getBookmarks());
    }
  }, []);

  useEffect(() => {
    const onSessionExpired = () => {
      clearBookmarks();
      setBookmarkedVerseKeys([]);
      setUserEmail(null);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, []);

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
    if (token) {
      void fetch('/api/user/reading-sessions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-token': token },
        body: JSON.stringify({ chapterNumber: surahId, verseNumber: verses.length }),
      }).catch(() => {});
    }

    setSurahCompleteOpen(true);
  }, [canLoadSurah, surahId, verses.length]);

  const {
    currentVerseIndex,
    isPlaying,
    playMode,
    currentTrack,
    pauseGapMs,
    playbackSpeed,
    activeWordIndex,
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
      void fetch('/api/user/reading-sessions', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-user-token': token } : {}),
        },
        body: JSON.stringify({
          chapterNumber: surahId,
          verseNumber:   verse.verseNumber,
        }),
      }).catch(() => {});

      // Activity Days powers streak progression.
      void recordActivityForVerse(verse.verseKey);
    },
    onSurahComplete,
  });

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

  /* Restore last verse position; autoplay if navigated from a bookmark */
  useEffect(() => {
    if (!canLoadSurah || verses.length === 0) return;

    const raw = localStorage.getItem(LAST_POSITION_KEY);
    if (raw) {
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
    }

    const wantsAutoplay = localStorage.getItem(AUTOPLAY_KEY) === '1';
    if (wantsAutoplay) {
      localStorage.removeItem(AUTOPLAY_KEY);
      // Small delay so seekToVerse state update settles before play() runs
      const t = window.setTimeout(() => { play(); }, 150);
      return () => window.clearTimeout(t);
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
    void toggleBookmark(verse.verseKey)
      .then((keys) => {
        setBookmarkedVerseKeys(keys);
        setError(null);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Could not update bookmark.';
        setError(message);
      });
  }, [setError]);

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

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/about"
              className="inline-flex rounded-md border border-border px-2 py-0.5 text-[10px] text-text-secondary transition-colors hover:text-white sm:border-0 sm:px-0 sm:py-0 sm:text-[13px]"
            >
              <span className="sm:hidden">Why trust us?</span>
              <span className="hidden sm:inline">Why trust us?</span>
            </Link>
          {/* Auth button */}
          {userEmail ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="hidden h-7 w-7 items-center justify-center rounded-full bg-teal text-black sm:flex">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
              </span>
              <button
                type="button"
                onClick={() => { clearSession(); clearBookmarks(); setBookmarkedVerseKeys([]); setUserEmail(null); }}
                className="text-[11px] text-text-muted transition hover:text-text-secondary sm:text-xs"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void loginWithPKCE()}
              className="rounded-md border border-border px-2 py-0.5 text-[11px] text-text-secondary transition hover:border-teal hover:text-teal sm:px-3 sm:py-1 sm:text-xs"
            >
              Login
            </button>
          )}
          </div>
        </div>
      </header>

      {/* ── Surah sub-nav ── */}
      <section className="sticky top-[52px] z-[90] h-[44px] border-b border-border bg-bg-surface px-5">
        <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/')}
            title="Browse all surahs"
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
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted select-none">
            Listen
          </span>

          <div className="mx-1 h-3.5 w-px bg-border" />

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
      <main className="pb-[185px]">
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
          <section className="px-5 py-8 text-center text-sm text-text-secondary animate-pulse">
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
                isPlaying={isPlaying}
                isBookmarked={bookmarkedVerseKeys.includes(verse.verseKey)}
                activeWordIndex={index === currentVerseIndex ? activeWordIndex : -1}
                onBookmark={onBookmark}
                onPause={pause}
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
