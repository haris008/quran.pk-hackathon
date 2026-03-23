'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { SurahGrid } from '@/components/SurahGrid';
import { useSurahData } from '@/hooks/useSurahData';
import { getStreak } from '@/lib/streak';

const LAST_POSITION_KEY = 'bilingual_radio_last_position';

interface LastPosition {
  surahId: number;
  verseIndex: number;
}

export default function HomePage() {
  const router = useRouter();
  const { chapters, isLoadingChapters, error } = useSurahData();

  const [lastPosition, setLastPosition] = useState<LastPosition | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStreak(getStreak());

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

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <header className="sticky top-0 z-50 h-[52px] border-b border-border bg-bg-surface px-5">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between">
          <div className="text-lg font-semibold tracking-[-0.01em] text-text-primary">
            Quran<span className="text-teal">.</span>com
          </div>

          <div className="flex items-center gap-3">
            {streak > 0 ? (
              <span className="flex items-center gap-1 rounded-full border border-teal-border bg-teal-dim px-3 py-1 text-[12px] text-teal">
                🔥 {streak} day streak
              </span>
            ) : null}
            <Link
              href="/about"
              className="text-[13px] text-text-secondary hover:text-white transition-colors"
            >
              Why trust us?
            </Link>
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
