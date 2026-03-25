'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { SurahGrid } from '@/components/SurahGrid';
import { useSurahData } from '@/hooks/useSurahData';
import { getStreak } from '@/lib/streak';
import { getBookmarks, BOOKMARKS_KEY, clearBookmarks, syncBookmarksFromAPI } from '@/lib/bookmarks';
import { getSession, clearSession, loginWithPKCE } from '@/lib/auth';

const LAST_POSITION_KEY = 'bilingual_radio_last_position';

interface LastPosition {
  surahId: number;
  verseIndex: number;
}

interface BookmarkChip {
  verseKey: string;
  surahId: number;
  verseNumber: number;
  surahName: string;
}

export default function HomePage() {
  const router = useRouter();
  const { chapters, isLoadingChapters, error } = useSurahData();

  const [lastPosition, setLastPosition] = useState<LastPosition | null>(null);
  const [streak, setStreak] = useState(0);
  const [bookmarkChips, setBookmarkChips] = useState<BookmarkChip[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    setUserEmail(session?.email ?? null);
    // Restore bookmarks from API if logged in
    if (session?.accessToken) {
      void syncBookmarksFromAPI(session.accessToken);
    }
    // local streak as baseline
    setStreak(getStreak());

    // If logged in, reconcile streak with API
    if (session?.accessToken) {
      fetch('/api/user/streaks?first=10', {
        headers: { 'x-user-token': session.accessToken },
      })
        .then((r) => r.json())
        .then((data) => {
          // Response: { success: true, data: [{ streak_count, ... }], ... }
          const items = (data as { data?: { streak_count?: number }[] })?.data ?? [];
          const apiCount = items[0]?.streak_count ?? 0;
          if (apiCount > 0) setStreak(apiCount);
        })
        .catch(() => {});
    }

    const raw = localStorage.getItem(LAST_POSITION_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as LastPosition;
      if (parsed?.surahId) {
        setLastPosition(parsed);
      }
    } catch {
      localStorage.removeItem(LAST_POSITION_KEY);
    }
  }, []);

  // Build bookmark chips whenever chapters or localStorage changes
  useEffect(() => {
    if (!chapters.length) return;

    const keys = getBookmarks();
    if (!keys.length) {
      setBookmarkChips([]);
      return;
    }

    const chips: BookmarkChip[] = keys
      .map((verseKey) => {
        const [surahIdStr, verseNumStr] = verseKey.split(':');
        const surahId = parseInt(surahIdStr, 10);
        const verseNumber = parseInt(verseNumStr, 10);
        const chapter = chapters.find((c) => c.id === surahId);
        if (!chapter) return null;
        return { verseKey, surahId, verseNumber, surahName: chapter.name_simple };
      })
      .filter((c): c is BookmarkChip => c !== null);
    setBookmarkChips(chips);
  }, [chapters]);

  function clearAllBookmarks() {
    localStorage.removeItem(BOOKMARKS_KEY);
    setBookmarkChips([]);
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <header className="sticky top-0 z-50 h-[52px] border-b border-border bg-bg-surface px-5">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between">
          <div className="text-lg font-semibold tracking-[-0.01em] text-text-primary">
            Quran<span className="text-teal">.</span>com
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {streak > 0 ? (
              <span className="hidden sm:flex items-center gap-1 rounded-full border border-teal-border bg-teal-dim px-3 py-1 text-[12px] text-teal">
                🔥 {streak} day streak
              </span>
            ) : null}
            <Link
              href="/about"
              className="hidden sm:block text-[13px] text-text-secondary hover:text-white transition-colors"
            >
              Why trust us?
            </Link>
            {userEmail ? (
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
                </span>
                <button
                  type="button"
                  onClick={() => { clearSession(); clearBookmarks(); setUserEmail(null); setBookmarkChips([]); }}
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
        </div>
      </header>

      <main className="pb-10 pt-5">
        {lastPosition ? (
          <section className="mx-auto mb-4 w-full max-w-6xl px-4">
            <div className="flex items-center justify-between rounded-lg border border-teal-border bg-teal-dim p-3 text-sm text-text-primary">
              <span>
                Resume Surah {lastPosition.surahId}, verse {lastPosition.verseIndex + 1}
              </span>
              <button
                type="button"
                onClick={() => router.push(`/player/${lastPosition.surahId}`)}
                className="rounded border border-teal-border px-3 py-1 text-xs text-teal transition hover:bg-teal-dim"
              >
                Resume →
              </button>
            </div>
          </section>
        ) : null}

        {bookmarkChips.length > 0 && (
          <section className="mx-auto mb-4 w-full max-w-6xl px-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
              Bookmarks
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {bookmarkChips.map((chip) => (
                <button
                  key={chip.verseKey}
                  onClick={() => {
                    localStorage.setItem(
                      LAST_POSITION_KEY,
                      JSON.stringify({ surahId: chip.surahId, verseIndex: chip.verseNumber - 1 }),
                    );
                    router.push(`/player/${chip.surahId}`);
                  }}
                  className="shrink-0 rounded-full border border-teal-border bg-teal-dim px-3 py-1 text-[12px] text-teal hover:bg-teal transition whitespace-nowrap hover:text-bg"
                >
                  {chip.surahName} · {chip.verseKey}
                </button>
              ))}
              <button
                onClick={clearAllBookmarks}
                className="shrink-0 ml-1 text-[11px] text-text-muted hover:text-text-secondary transition"
              >
                Clear all
              </button>
            </div>
          </section>
        )}

        {error ? (
          <section className="mx-auto mb-4 w-full max-w-6xl px-4">
            <div className="rounded-lg border border-[rgba(239,68,68,0.4)] bg-[rgba(127,29,29,0.2)] p-3 text-sm text-[#fca5a5]">
              {error}
            </div>
          </section>
        ) : null}

        <SurahGrid
          chapters={chapters}
          isLoading={isLoadingChapters}
          onSelect={(id) => router.push(`/player/${id}`)}
        />
      </main>
    </div>
  );
}
