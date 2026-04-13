'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  fetchChapters,
  fetchRecitations,
  fetchTranslations,
  loadBilingualSurah,
} from '@/lib/quranApi';
import type { Chapter, RecitationOption, Translation, Verse } from '@/types/quran';

const FALLBACK_RECITATIONS: RecitationOption[] = [
  { id: 7,  reciter_name: 'Mishari Rashid al-`Afasy' },
  { id: 1,  reciter_name: 'AbdulBaset AbdulSamad', style: 'Mujawwad' },
  { id: 3,  reciter_name: 'Abdur-Rahman as-Sudais' },
  { id: 9,  reciter_name: 'Mohamed Siddiq al-Minshawi', style: 'Murattal' },
  { id: 12, reciter_name: 'Mahmoud Khalil Al-Husary', style: 'Muallim' },
];

export function useSurahData() {
  const [chapters,      setChapters]      = useState<Chapter[]>([]);
  const [recitations,   setRecitations]   = useState<RecitationOption[]>(FALLBACK_RECITATIONS);
  const [translations,  setTranslations]  = useState<Translation[]>([]);
  const [verses,        setVerses]        = useState<Verse[]>([]);
  const [translationId, setTranslationId] = useState(20); /* Saheeh International */

  const [isLoadingChapters, setIsLoadingChapters] = useState(true);
  const [isLoadingSurah,    setIsLoadingSurah]    = useState(false);
  const [error,             setError]             = useState<string | null>(null);

  const surahCacheRef = useRef<Map<string, Verse[]>>(new Map());

  /* Load chapters, translations, and recitations once on mount */
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsLoadingChapters(true);
        const [chapterList, translationList] = await Promise.all([
          fetchChapters('en'),
          fetchTranslations(),
        ]);

        if (cancelled) return;
        setChapters(chapterList);
        setTranslations(translationList);
        setError(null);

        try {
          const recitationList = await fetchRecitations('en');
          // Only replace the fallback if the API returned at least as many reciters.
          if (!cancelled && recitationList.length >= FALLBACK_RECITATIONS.length) {
            setRecitations(recitationList);
          }
        } catch {
          /* Keep fallback list */
        }
      } catch (err) {
        if (!cancelled) {
          setError('Could not load chapters. Please check your connection.');
          console.error('[useSurahData] initial load failed:', err);
        }
      } finally {
        if (!cancelled) setIsLoadingChapters(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const loadSurah = useCallback(
    async (surahId: number, recitationId: number, txId?: number) => {
      const tid      = txId ?? translationId;
      const cacheKey = `${surahId}-${recitationId}-${tid}`;
      const cached   = surahCacheRef.current.get(cacheKey);

      if (cached) {
        setVerses(cached);
        setError(null);
        return cached;
      }

      setIsLoadingSurah(true);
      setError(null);

      try {
        let loaded = await loadBilingualSurah(surahId, recitationId, tid);

        // If translation is missing (cold-start / transient network failure),
        // wait briefly and retry once before showing empty English text.
        if (!loaded.some((v) => v.englishText)) {
          await new Promise((r) => setTimeout(r, 1200));
          loaded = await loadBilingualSurah(surahId, recitationId, tid);
        }

        // Only cache when translation text is present so a failure doesn't
        // permanently cache verses with empty English text.
        if (loaded.some((v) => v.englishText)) {
          surahCacheRef.current.set(cacheKey, loaded);
        }
        setVerses(loaded);
        return loaded;
      } catch (err) {
        const msg = 'Could not load Surah. Please check your connection.';
        setError(msg);
        console.error('[useSurahData] loadSurah failed:', err);
        throw new Error(msg);
      } finally {
        setIsLoadingSurah(false);
      }
    },
    [translationId]
  );

  const featuredChapters = useMemo(
    () => chapters.filter((c) => [1, 18, 36, 67].includes(c.id)),
    [chapters]
  );

  const clearSurahCache = useCallback(() => {
    surahCacheRef.current.clear();
  }, []);

  return {
    chapters,
    recitations,
    translations,
    translationId,
    setTranslationId,
    verses,
    featuredChapters,
    isLoadingChapters,
    isLoadingSurah,
    error,
    loadSurah,
    clearSurahCache,
    setError,
    setVerses,
  };
}
