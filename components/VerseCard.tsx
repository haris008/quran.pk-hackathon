'use client';

import type { PlayerTrack, Verse } from '@/types/quran';

interface VerseCardProps {
  verse: Verse;
  index: number;
  active: boolean;
  track: PlayerTrack;
  completed: boolean;
  isBookmarked?: boolean;
  activeWordIndex?: number;
  onBookmark: (verse: Verse) => void;
  onSelect: (index: number) => void;
}

function getStateClasses(active: boolean, track: PlayerTrack, completed: boolean): string {
  if (completed) return 'opacity-40';
  if (!active || track === 'idle' || track === 'gap') return '';
  if (track === 'arabic') return 'bg-[rgba(56,193,140,0.06)] border-l-[3px] border-l-teal pl-[25px]';
  return 'bg-[rgba(74,144,217,0.06)] border-l-[3px] border-l-blue-active pl-[25px]';
}

export function VerseCard({
  verse,
  index,
  active,
  track,
  completed,
  isBookmarked,
  activeWordIndex,
  onBookmark,
  onSelect,
}: VerseCardProps) {
  const isArabicPlaying = active && track === 'arabic';
  const isTranslationPlaying = active && track === 'translation';

  return (
    <article
      id={`verse-${index}`}
      className={`border-b border-border px-6 py-6 transition-all ${getStateClasses(active, track, completed)}`}
    >
      {/* ── Toolbar row ── */}
      <div className="mb-5 flex items-center gap-2">
        {/* Verse number badge */}
        <span className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-bg-elevated px-2 text-[11px] font-medium text-text-muted">
          {verse.verseKey}
        </span>

        {/* Play button */}
        <button
          type="button"
          aria-label="Play from this verse"
          onClick={() => onSelect(index)}
          title="Play from this verse"
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] transition ${
            isArabicPlaying
              ? 'border-teal-border bg-teal-dim text-teal'
              : isTranslationPlaying
                ? 'border-blue-border bg-blue-dim text-blue-active'
                : 'border-border text-text-secondary hover:border-border-hover hover:bg-bg-hover hover:text-text-primary'
          }`}
        >
          ▶
        </button>

        {/* Bookmark button */}
        <button
          type="button"
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark verse'}
          onClick={() => onBookmark(verse)}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-[12px] transition active:scale-125 ${
            isBookmarked
              ? 'border-teal-border bg-teal-dim text-teal scale-110'
              : 'border-border text-text-secondary hover:border-border-hover hover:bg-bg-hover hover:text-text-primary'
          }`}
        >
          🔖
        </button>

        {/* Playing indicator */}
        {isArabicPlaying && (
          <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-teal">
            <span className="h-1.5 w-1.5 rounded-full bg-teal animate-blink" />
            Arabic
          </span>
        )}
        {isTranslationPlaying && (
          <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-blue-active">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-active animate-blink" />
            English
          </span>
        )}
      </div>

      {/* ── Arabic text ── */}
      <p
        dir="rtl"
        className={`font-arabic mb-4 ${
          isArabicPlaying
            ? 'text-white'
            : isTranslationPlaying
              ? 'text-text-secondary'
              : 'text-white'
        }`}
      >
        {verse.arabicText}
      </p>

      {/* ── Translation text ── */}
      {verse.englishText ? (
        <p
          className={`text-[15px] leading-[1.8] ${
            isTranslationPlaying
              ? 'text-[#c5ddf5]'
              : 'font-light text-text-secondary'
          }`}
        >
          {isTranslationPlaying && activeWordIndex !== undefined && activeWordIndex >= 0
            ? (() => {
                const words = verse.englishText.split(/\s+/);
                return words.map((word, wi) => (
                  <span
                    key={wi}
                    className={
                      wi === activeWordIndex
                        ? 'rounded bg-[rgba(74,144,217,0.25)] px-0.5 text-white transition-colors'
                        : ''
                    }
                  >
                    {word}
                    {wi < words.length - 1 ? ' ' : ''}
                  </span>
                ));
              })()
            : verse.englishText}
        </p>
      ) : null}
    </article>
  );
}
