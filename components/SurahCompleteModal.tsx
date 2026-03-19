'use client';

import { useEffect, useState } from 'react';

interface SurahCompleteModalProps {
  surahName:     string;
  nextSurahName: string | null;
  onContinue:    () => void;
  onRestart:     () => void;
  onBrowse:      () => void;
}

const COUNTDOWN_SECONDS = 5;

export function SurahCompleteModal({
  surahName,
  nextSurahName,
  onContinue,
  onRestart,
  onBrowse,
}: SurahCompleteModalProps) {
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (seconds <= 0) {
      if (nextSurahName) onContinue();
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, nextSurahName, onContinue]);

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onBrowse}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-sm rounded-t-2xl sm:rounded-2xl border border-border bg-bg-surface px-6 py-7 shadow-2xl">
        {/* Check icon */}
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-teal-dim">
          <span className="text-lg text-teal">✓</span>
        </div>

        <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-text-secondary">
          Surah Complete
        </p>
        <h2 className="mt-1 text-[22px] font-semibold text-text-primary">
          {surahName}
        </h2>

        {nextSurahName ? (
          <p className="mt-2 text-[14px] text-text-secondary">
            Continue to <span className="text-text-primary">{nextSurahName}</span>?
            {' '}Auto-advancing in{' '}
            <span className="font-semibold text-teal">{seconds}s…</span>
          </p>
        ) : (
          <p className="mt-2 text-[14px] text-text-secondary">
            You've reached the end of the Quran.
          </p>
        )}

        {/* Progress bar */}
        {nextSurahName && (
          <div className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-bg-elevated">
            <div
              className="h-full bg-teal transition-all duration-1000 ease-linear"
              style={{ width: `${((COUNTDOWN_SECONDS - seconds) / COUNTDOWN_SECONDS) * 100}%` }}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="mt-5 flex gap-2">
          {nextSurahName && (
            <button
              type="button"
              onClick={onContinue}
              className="flex-1 rounded-lg bg-teal px-4 py-2.5 text-[13px] font-semibold text-black transition hover:opacity-90"
            >
              Continue
            </button>
          )}
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-[13px] text-text-secondary transition hover:border-border-hover hover:text-text-primary"
          >
            Restart
          </button>
          <button
            type="button"
            onClick={onBrowse}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-[13px] text-text-secondary transition hover:border-border-hover hover:text-text-primary"
          >
            Browse
          </button>
        </div>
      </div>
    </div>
  );
}
