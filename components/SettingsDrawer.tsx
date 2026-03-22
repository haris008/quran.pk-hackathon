'use client';

import { useMemo, useState } from 'react';

import type { PlayMode, RecitationOption, Translation } from '@/types/quran';

interface SettingsDrawerProps {
  isOpen: boolean;
  recitations: RecitationOption[];
  translations: Translation[];
  recitationId: number;
  translationId: number;
  playMode: PlayMode;
  playbackSpeed: number;
  onClose: () => void;
  onRecitationChange: (id: number) => void;
  onTranslationChange: (id: number) => void;
  onPlayModeChange: (mode: PlayMode) => void;
  onPlaybackSpeedChange: (speed: number) => void;
}

const MODE_OPTIONS: Array<{ value: PlayMode; label: string }> = [
  { value: 'both',             label: 'Arabic → Translation' },
  { value: 'arabic_only',      label: 'Arabic only' },
  { value: 'translation_only', label: 'Translation only' },
];

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];

const LANG_FLAG: Record<string, string> = {
  english: '🇺🇸', arabic: '🇸🇦', urdu: '🇵🇰', french: '🇫🇷',
  german: '🇩🇪', spanish: '🇪🇸', turkish: '🇹🇷', indonesian: '🇮🇩',
  bengali: '🇧🇩', russian: '🇷🇺', chinese: '🇨🇳', persian: '🇮🇷',
  malay: '🇲🇾', bosnian: '🇧🇦', dutch: '🇳🇱', italian: '🇮🇹',
  portuguese: '🇵🇹', somali: '🇸🇴', tamil: '🇱🇰', hausa: '🇳🇬',
  swahili: '🇰🇪', amharic: '🇪🇹', pashto: '🇦🇫', thai: '🇹🇭',
  japanese: '🇯🇵', korean: '🇰🇷', vietnamese: '🇻🇳', kazakh: '🇰🇿',
  azerbaijani: '🇦🇿', swedish: '🇸🇪', norwegian: '🇳🇴', danish: '🇩🇰',
  finnish: '🇫🇮', czech: '🇨🇿', hungarian: '🇭🇺', polish: '🇵🇱',
  romanian: '🇷🇴', ukrainian: '🇺🇦', bulgarian: '🇧🇬', greek: '🇬🇷',
  hebrew: '🇮🇱', albanian: '🇦🇱', tagalog: '🇵🇭', malayalam: '🇮🇳',
  telugu: '🇮🇳', gujarati: '🇮🇳', punjabi: '🇮🇳', sindhi: '🇵🇰',
};

function langFlag(lang: string): string {
  return LANG_FLAG[lang.toLowerCase()] ?? '🌐';
}

export function SettingsDrawer({
  isOpen,
  recitations,
  translations,
  recitationId,
  translationId,
  playMode,
  playbackSpeed,
  onClose,
  onRecitationChange,
  onTranslationChange,
  onPlayModeChange,
  onPlaybackSpeedChange,
}: SettingsDrawerProps) {
  const [txQuery, setTxQuery] = useState('');

  const englishTranslations = useMemo(
    () => translations.filter((t) => t.language_name.toLowerCase() === 'english'),
    [translations]
  );

  const filteredTranslations = useMemo(() => {
    const q = txQuery.trim().toLowerCase();
    if (!q) return englishTranslations;
    return englishTranslations.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.author_name.toLowerCase().includes(q)
    );
  }, [englishTranslations, txQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end bg-black/50"
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-[540px] rounded-t-2xl border border-border border-b-0 bg-bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-[3px] w-9 rounded bg-border-hover" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-text-primary">Settings</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition hover:bg-bg-hover hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        {/* ── Reciter ── */}
        <section className="mb-4">
          <p className="mb-2 text-[11px] uppercase tracking-[0.08em] text-text-muted">Reciter</p>
          <div className="flex flex-wrap gap-1.5">
            {recitations.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onRecitationChange(r.id)}
                className={`rounded-md border px-3 py-1.5 text-[12px] transition ${
                  recitationId === r.id
                    ? 'border-teal-border bg-teal-dim text-teal'
                    : 'border-border bg-transparent text-text-secondary hover:border-border-hover hover:text-text-primary'
                }`}
              >
                {r.reciter_name}
              </button>
            ))}
          </div>
        </section>

        {/* ── Translation picker ── */}
        <section className="mb-4">
          <p className="mb-2 text-[11px] uppercase tracking-[0.08em] text-text-muted">
            Translation
            <span className="ml-2 normal-case font-normal text-text-muted">
              ({englishTranslations.length} English)
            </span>
          </p>

          <input
            type="search"
            value={txQuery}
            onChange={(e) => setTxQuery(e.target.value)}
            placeholder="Search by name or author…"
            className="mb-2 w-full rounded-md border border-border bg-transparent px-3 py-1.5 text-[12px] text-text-primary outline-none transition focus:border-teal focus:ring-1 focus:ring-teal/30 placeholder:text-text-muted"
          />

          <div className="max-h-48 overflow-y-auto rounded-md border border-border">
            {filteredTranslations.length === 0 ? (
              <p className="p-3 text-center text-[12px] text-text-muted">No results</p>
            ) : (
              filteredTranslations.map((tx) => (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => onTranslationChange(tx.id)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition hover:bg-bg-hover ${
                    translationId === tx.id ? 'text-teal' : 'text-text-secondary'
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {tx.name}
                    {tx.author_name && tx.author_name !== tx.name
                      ? ` — ${tx.author_name}`
                      : ''}
                  </span>
                  {translationId === tx.id && (
                    <span className="shrink-0 text-teal">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </section>

        {/* ── Playback Mode ── */}
        <section className="mb-4">
          <p className="mb-2 text-[11px] uppercase tracking-[0.08em] text-text-muted">Playback Mode</p>
          <div className="flex flex-wrap gap-1.5">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onPlayModeChange(opt.value)}
                className={`rounded-md border px-3 py-1.5 text-[12px] transition ${
                  playMode === opt.value
                    ? 'border-teal-border bg-teal-dim text-teal'
                    : 'border-border bg-transparent text-text-secondary hover:border-border-hover hover:text-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Speed ── */}
        <section>
          <p className="mb-2 text-[11px] uppercase tracking-[0.08em] text-text-muted">Speed</p>
          <div className="flex flex-wrap gap-1.5">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onPlaybackSpeedChange(s)}
                className={`rounded-md border px-3.5 py-1.5 text-[12px] transition ${
                  playbackSpeed === s
                    ? 'border-teal-border bg-teal-dim text-teal'
                    : 'border-border bg-transparent text-text-secondary hover:border-border-hover hover:text-text-primary'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
