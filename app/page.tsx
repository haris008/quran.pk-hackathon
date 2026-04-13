'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { SurahGrid } from '@/components/SurahGrid';
import { useSurahData } from '@/hooks/useSurahData';
import { fetchStreakFromAPI } from '@/lib/streak';
import { getBookmarks, clearBookmarks, clearAllBookmarksFromAPI, syncBookmarksFromAPI } from '@/lib/bookmarks';
import { getSession, clearSession, loginWithPKCE } from '@/lib/auth';

const LAST_POSITION_KEY = 'bilingual_radio_last_position';
const SESSION_EXPIRED_EVENT = 'qf-session-expired';

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
  const [bookmarkKeys, setBookmarkKeys] = useState<string[]>([]);
  const [bookmarkChips, setBookmarkChips] = useState<BookmarkChip[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const applyLoggedOutState = useCallback(() => {
    setUserEmail(null);
    setStreak(0);
    clearBookmarks();
    setBookmarkKeys([]);
    setBookmarkChips([]);
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
    applyLoggedOutState();
  }, [applyLoggedOutState]);

  useEffect(() => {
    const session = getSession();
    setUserEmail(session?.email ?? null);
    setBookmarkKeys(getBookmarks());
    // Restore bookmarks from API if logged in
    if (session?.accessToken) {
      void syncBookmarksFromAPI(session.accessToken).then((keys) => {
        setBookmarkKeys(keys);
      });
    }
    setStreak(0);

    // API-only streak source
    if (session?.accessToken) {
      void fetchStreakFromAPI(session.accessToken)
        .then((count) => setStreak(count))
        .catch((err) => {
          if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
            applyLoggedOutState();
          }
        });
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
  }, [applyLoggedOutState]);

  useEffect(() => {
    const onSessionExpired = () => {
      applyLoggedOutState();
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, [applyLoggedOutState]);

  // Reconcile streak from API whenever tab regains focus or becomes visible.
  useEffect(() => {
    const refreshStreak = () => {
      const token = getSession()?.accessToken;
      if (!token) {
        setStreak(0);
        return;
      }
      void fetchStreakFromAPI(token)
        .then((count) => setStreak(count))
        .catch((err) => {
          if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
            applyLoggedOutState();
          }
        });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshStreak();
    };

    window.addEventListener('focus', refreshStreak);
    window.addEventListener('pageshow', refreshStreak);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('focus', refreshStreak);
      window.removeEventListener('pageshow', refreshStreak);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [applyLoggedOutState]);

  // Build bookmark chips whenever chapters or bookmark keys change
  useEffect(() => {
    if (!chapters.length) return;

    if (!bookmarkKeys.length) {
      setBookmarkChips([]);
      return;
    }

    const chips: BookmarkChip[] = bookmarkKeys
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
  }, [bookmarkKeys, chapters]);

  function clearAllBookmarks() {
    const token = getSession()?.accessToken;
    if (!token) return;

    void clearAllBookmarksFromAPI(token)
      .then(() => {
        setBookmarkKeys([]);
        setBookmarkChips([]);
      })
      .catch(() => {});
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <header className="sticky top-0 z-50 h-[52px] border-b border-border bg-bg-surface px-5">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between">
          <div className="text-lg font-semibold tracking-[-0.01em] text-text-primary">
            Quran<span className="text-teal">.</span>com
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {streak > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-teal-border bg-teal-dim px-2 py-0.5 text-[10px] text-teal sm:px-3 sm:py-1 sm:text-[12px]">
                <span aria-hidden>🔥</span>
                <span className="sm:hidden">{streak}</span>
                <span className="hidden sm:inline">{streak} day streak</span>
              </span>
            ) : null}
            <Link
              href="/about"
              className="inline-flex rounded-md border border-border px-2 py-0.5 text-[10px] text-text-secondary transition-colors hover:text-white sm:border-0 sm:px-0 sm:py-0 sm:text-[13px]"
            >
              <span className="sm:hidden">Why trust us?</span>
              <span className="hidden sm:inline">Why trust us?</span>
            </Link>
            {userEmail ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="hidden h-7 w-7 items-center justify-center rounded-full bg-teal text-black sm:flex">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
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
