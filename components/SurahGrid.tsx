'use client';

import { useMemo, useState } from 'react';

import type { Chapter } from '@/types/quran';

interface SurahGridProps {
  chapters: Chapter[];
  selectedChapterId?: number | null;
  onSelect: (chapterId: number) => void;
}

export function SurahGrid({ chapters, selectedChapterId, onSelect }: SurahGridProps) {
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
                <p className="mt-1 text-xs text-text-secondary">{chapter.verses_count} verses</p>
              </button>
            );
          })}
        </div>

        {filteredChapters.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-secondary">No surah found for “{query}”.</p>
        ) : null}
      </div>
    </section>
  );
}
