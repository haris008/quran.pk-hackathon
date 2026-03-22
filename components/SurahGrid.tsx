'use client';

import { useMemo, useState } from 'react';

import type { Chapter } from '@/types/quran';

interface SurahGridProps {
  chapters: Chapter[];
  selectedChapterId?: number | null;
  isLoading?: boolean;
  onSelect: (chapterId: number) => void;
}

export function SurahGrid({ chapters, selectedChapterId, isLoading, onSelect }: SurahGridProps) {
  const [query, setQuery] = useState('');

  const filteredChapters = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return chapters;
    }

    return chapters.filter((chapter) => {
      const englishMatch = chapter.name_simple.toLowerCase().includes(term);
      const numberMatch = String(chapter.id).includes(term);
      const arabicMatch = chapter.name_arabic.includes(query);

      return englishMatch || numberMatch || arabicMatch;
    });
  }, [chapters, query]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-8">
      <div className="rounded-lg border border-border bg-bg-surface p-4 md:p-5">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by Surah name or number"
          className="mb-4 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-text-primary outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/30"
        />

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-border bg-bg-elevated p-3 h-[108px]">
                <div className="mb-2 flex items-center justify-between">
                  <div className="h-3 w-4 rounded bg-bg-hover" />
                  <div className="h-3 w-12 rounded bg-bg-hover" />
                </div>
                <div className="h-7 w-20 rounded bg-bg-hover mb-2" />
                <div className="h-3 w-16 rounded bg-bg-hover mb-1" />
                <div className="h-3 w-10 rounded bg-bg-hover" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {filteredChapters.map((chapter) => {
                const selected = chapter.id === selectedChapterId;

                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => onSelect(chapter.id)}
                    className={`rounded-lg border p-3 text-left transition ${
                      selected
                        ? 'border-teal-border bg-teal-dim'
                        : 'border-border bg-bg-surface hover:border-border-hover hover:bg-bg-elevated'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between text-[11px] text-text-muted">
                      <span>{chapter.id}</span>
                      <span className="rounded border border-border px-2 py-0.5 capitalize">{chapter.revelation_place}</span>
                    </div>

                    <p className="font-arabic text-[22px] text-teal">{chapter.name_arabic}</p>
                    <p className="mt-1 text-sm font-medium text-text-primary">{chapter.name_simple}</p>
                    <p className="mt-1 text-xs text-text-secondary">{chapter.verses_count} {chapter.verses_count === 1 ? 'verse' : 'verses'}</p>
                  </button>
                );
              })}
            </div>

            {filteredChapters.length === 0 ? (
              <p className="py-10 text-center text-sm text-text-secondary">No surah found for &ldquo;{query}&rdquo;.</p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
