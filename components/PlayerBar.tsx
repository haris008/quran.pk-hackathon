'use client';

import { useEffect } from 'react';
import { loadQcfFont, qcfFontFamily } from '@/lib/qcfFont';
import type { PlayMode, PlayerTrack, Verse } from '@/types/quran';

interface PlayerBarProps {
  verse: Verse | null;
  currentVerseIndex: number;
  totalVerses: number;
  isPlaying: boolean;
  playMode: PlayMode;
  currentTrack: PlayerTrack;
  pauseGapMs: number;
  playbackSpeed: number;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRestart: () => void;
  onSeek: (index: number) => void;
  onPauseGapChange: (pauseGapMs: number) => void;
  onSpeedCycle: () => void;
  onOpenSettings: () => void;
}

const GAP_STEPS = [0, 500, 1000, 2000, 3000];

export function PlayerBar({
  verse,
  currentVerseIndex,
  totalVerses,
  isPlaying,
  playMode,
  currentTrack,
  pauseGapMs,
  playbackSpeed,
  onPlayPause,
  onPrevious,
  onNext,
  onRestart,
  onSeek,
  onPauseGapChange,
  onSpeedCycle,
  onOpenSettings
}: PlayerBarProps) {
  useEffect(() => {
    if (verse?.pageNumber) loadQcfFont(verse.pageNumber);
  }, [verse?.pageNumber]);

  const displayedVerseNumber =
    totalVerses === 0
      ? 0
      : Math.min(Math.max(verse?.verseNumber ?? (currentVerseIndex + 1), 1), totalVerses);

  const progress = totalVerses === 0 ? 0 : (displayedVerseNumber / totalVerses) * 100;
  const progressColor = currentTrack === 'translation' ? 'var(--blue-active)' : 'var(--teal)';

  const activeTagClass = currentTrack === 'translation'
    ? 'border border-blue-border bg-blue-dim text-blue-active'
    : 'border border-teal-border bg-teal-dim text-teal';

  const activeDotClass = currentTrack === 'translation' ? 'bg-blue-active' : 'bg-teal';

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg-surface">
      <div
        role="button"
        tabIndex={0}
        onClick={(event) => {
          if (totalVerses <= 1) {
            return;
          }

          const bounds = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
          const ratio = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
          onSeek(Math.round((totalVerses - 1) * ratio));
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSeek(currentVerseIndex);
          }
        }}
        className="h-[3px] cursor-pointer bg-bg-elevated"
      >
        <div className="h-full transition-all" style={{ width: `${progress}%`, backgroundColor: progressColor }} />
      </div>

      <div className="flex items-center gap-4 px-5 pb-4 pt-2">
        {/* Verse info */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <p
            dir="rtl"
            className="text-ellipsis whitespace-nowrap text-text-primary leading-[2.2] py-1"
            style={
              verse?.qpcText && verse?.pageNumber
                ? { fontFamily: qcfFontFamily(verse.pageNumber), fontSize: '1.55rem' }
                : { fontFamily: 'var(--font-arabic)', fontSize: '0.9375rem' }
            }
          >
            {verse?.qpcText ?? verse?.arabicText ?? ''}
          </p>
          <p className="hidden sm:block overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-text-secondary">{verse?.englishText ?? ''}</p>
          <span className={`mt-1 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] ${activeTagClass}`}>
            <span className={`h-1.5 w-1.5 rounded-full animate-blink ${activeDotClass}`} />
            {verse?.verseKey ?? '--'} · {currentTrack === 'translation' ? 'English' : 'Arabic'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button type="button" onClick={onOpenSettings} className="h-9 w-9 rounded-md border border-border text-sm text-text-secondary transition hover:border-border-hover hover:bg-bg-hover hover:text-text-primary">⚙</button>
          <button type="button" onClick={onRestart} title="Restart surah" className="h-9 w-9 rounded-full text-sm text-text-secondary transition hover:bg-bg-hover hover:text-text-primary">⏮</button>
          <button type="button" onClick={onPrevious} title="Previous verse" className="h-9 w-9 rounded-full text-xl leading-none text-text-secondary transition hover:bg-bg-hover hover:text-text-primary">‹</button>
          <button type="button" onClick={onPlayPause} className="h-[42px] w-[42px] rounded-full bg-teal text-sm text-[#0a1a14] transition hover:scale-[1.04] hover:bg-[#3dd9b3]">{isPlaying ? '⏸' : '▶'}</button>
          <button type="button" onClick={onNext} title="Next verse" className="h-9 w-9 rounded-full text-xl leading-none text-text-secondary transition hover:bg-bg-hover hover:text-text-primary">›</button>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>{displayedVerseNumber}/{totalVerses || 0}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] text-text-muted sm:inline">Gap</span>
          <input
            type="range"
            min={0}
            max={GAP_STEPS.length - 1}
            step={1}
            value={Math.max(GAP_STEPS.indexOf(pauseGapMs), 0)}
            onChange={(event) => {
              const value = GAP_STEPS[Number(event.target.value)] ?? 1000;
              onPauseGapChange(value);
            }}
            className="h-[3px] w-16 cursor-pointer accent-teal"
          />
          <span className="w-8 text-[11px] text-text-secondary">{pauseGapMs / 1000}s</span>
          <button
            type="button"
            onClick={onSpeedCycle}
            className="rounded border border-border bg-bg-elevated px-2 py-1 text-[11px] text-text-secondary transition hover:border-border-hover hover:text-text-primary"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>

      <div className="sr-only">Mode: {playMode}</div>
    </div>
  );
}
