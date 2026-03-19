'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { clampIndex, sleep } from '@/lib/audioUtils';
import type { PlayMode, PlayerTrack, Verse } from '@/types/quran';

/* Maps language_name (from the API) → BCP-47 tag for Web Speech API */
const LANG_BCP47: Record<string, string> = {
  english: 'en-US', arabic: 'ar-SA', urdu: 'ur-PK', french: 'fr-FR',
  german: 'de-DE', spanish: 'es-ES', turkish: 'tr-TR', indonesian: 'id-ID',
  bengali: 'bn-BD', russian: 'ru-RU', chinese: 'zh-CN', persian: 'fa-IR',
  malay: 'ms-MY', bosnian: 'bs-BA', dutch: 'nl-NL', italian: 'it-IT',
  portuguese: 'pt-PT', somali: 'so-SO', tamil: 'ta-IN', hausa: 'ha-NG',
  swahili: 'sw-KE', amharic: 'am-ET', pashto: 'ps-AF', thai: 'th-TH',
  japanese: 'ja-JP', korean: 'ko-KR', vietnamese: 'vi-VN', kazakh: 'kk-KZ',
  azerbaijani: 'az-AZ', swedish: 'sv-SE', norwegian: 'nb-NO', danish: 'da-DK',
  finnish: 'fi-FI', czech: 'cs-CZ', hungarian: 'hu-HU', polish: 'pl-PL',
  romanian: 'ro-RO', ukrainian: 'uk-UA', bulgarian: 'bg-BG', greek: 'el-GR',
  hebrew: 'he-IL', albanian: 'sq-AL', tagalog: 'fil-PH', malayalam: 'ml-IN',
  telugu: 'te-IN', gujarati: 'gu-IN', punjabi: 'pa-IN', sindhi: 'sd-PK',
};

interface UsePlayerOptions {
  verses: Verse[];
  translationLang?: string;
  onVerseChange?: (index: number) => void;
  onVerseCompleted?: (verse: Verse) => void;
  onSurahComplete?: () => void;
  onSessionStart?: () => void;
}

type AudioWaitStatus = 'ended' | 'error' | 'interrupted';

export function usePlayer({ verses, translationLang = 'english', onVerseChange, onVerseCompleted, onSurahComplete, onSessionStart }: UsePlayerOptions) {
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>('both');
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack>('idle');
  const [pauseGapMs, setPauseGapMs] = useState(1000);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [completedVerseIndexes, setCompletedVerseIndexes] = useState<number[]>([]);

  const arabicAudioRef = useRef<HTMLAudioElement | null>(null);
  const translationAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsVoicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const runIdRef = useRef(0);
  const isPlayingRef = useRef(false);
  const playModeRef = useRef<PlayMode>('both');
  const pauseGapMsRef = useRef(1000);
  const playbackSpeedRef = useRef(1);
  const versesRef = useRef(verses);
  const currentVerseIndexRef = useRef(0);

  useEffect(() => {
    arabicAudioRef.current = new Audio();
    translationAudioRef.current = new Audio();

    return () => {
      runIdRef.current += 1;
      const arabicAudio = arabicAudioRef.current;
      const translationAudio = translationAudioRef.current;

      if (arabicAudio) {
        arabicAudio.pause();
        arabicAudio.src = '';
      }

      if (translationAudio) {
        translationAudio.pause();
        translationAudio.src = '';
      }
    };
  }, []);

  /* Pre-load TTS voices — getVoices() is empty on first call until
     the browser fires voiceschanged (async). Cache them in a ref so
     the first utterance already has the correct male voice. */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const load = () => {
      ttsVoicesRef.current = window.speechSynthesis.getVoices();
    };

    load(); /* may already be populated on some browsers */
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  useEffect(() => {
    versesRef.current = verses;
    runIdRef.current += 1;
    isPlayingRef.current = false;
    setIsPlaying(false);
    setCurrentTrack('idle');
    setCurrentVerseIndex(0);
    currentVerseIndexRef.current = 0;
    setCompletedVerseIndexes([]);

    const arabicAudio = arabicAudioRef.current;
    const translationAudio = translationAudioRef.current;

    if (arabicAudio) {
      arabicAudio.pause();
      arabicAudio.currentTime = 0;
    }

    if (translationAudio) {
      translationAudio.pause();
      translationAudio.currentTime = 0;
    }
  }, [verses]);

  useEffect(() => {
    playModeRef.current = playMode;
  }, [playMode]);

  useEffect(() => {
    pauseGapMsRef.current = pauseGapMs;
  }, [pauseGapMs]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
    const arabicAudio = arabicAudioRef.current;
    const translationAudio = translationAudioRef.current;

    if (arabicAudio) {
      arabicAudio.playbackRate = playbackSpeed;
    }

    if (translationAudio) {
      translationAudio.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const waitForAudioEnd = useCallback((audio: HTMLAudioElement, runId: number): Promise<AudioWaitStatus> => {
    return new Promise((resolve) => {
      let settled = false;

      const cleanup = () => {
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
        window.clearInterval(watchdog);
      };

      const finish = (status: AudioWaitStatus) => {
        if (settled) {
          return;
        }

        settled = true;
        cleanup();
        resolve(status);
      };

      const onEnded = () => finish('ended');
      const onError = () => finish('error');

      audio.addEventListener('ended', onEnded, { once: true });
      audio.addEventListener('error', onError, { once: true });

      const watchdog = window.setInterval(() => {
        if (runIdRef.current !== runId || !isPlayingRef.current) {
          finish('interrupted');
        }
      }, 100);
    });
  }, []);

  const playAudio = useCallback(
    async (audio: HTMLAudioElement, src: string, runId: number, label: 'arabic' | 'translation'): Promise<boolean> => {
      if (!src) {
        console.warn(`Skipping ${label} audio because URL was empty.`);
        return true;
      }

      try {
        audio.src = src;
        audio.preload = 'auto';
        audio.playbackRate = playbackSpeedRef.current;
        await audio.play();
      } catch (error) {
        console.warn(`Failed to play ${label} audio, skipping this track.`, error);
        return true;
      }

      const status = await waitForAudioEnd(audio, runId);
      if (status === 'error') {
        console.warn(`Audio error for ${label} track: ${src}`);
      }

      return status !== 'interrupted';
    },
    [waitForAudioEnd]
  );

  const sleepForGap = useCallback(async (ms: number, runId: number): Promise<boolean> => {
    await sleep(ms);
    return runIdRef.current === runId && isPlayingRef.current;
  }, []);

  const speakTranslation = useCallback(
    (text: string, runId: number): Promise<boolean> => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
          resolve(true);
          return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = playbackSpeedRef.current;
        utterance.lang = 'en-US';

        /* Strict male English voice — use pre-loaded ref (never empty) */
        const enVoices = ttsVoicesRef.current.filter((v) => v.lang.startsWith('en'));
        const MALE_RE = /\b(male|david|alex|tom|daniel|mark|james|george|fred|junior|bruce|aaron|oliver|arthur|rishi|lee|richard|peter|gordon)\b/i;
        const FEMALE_RE = /\b(female|samantha|victoria|karen|susan|fiona|moira|veena|tessa|nicky|alice|kate|zoe|ava|siri|serena|helena|laura)\b/i;
        const maleVoice = enVoices.find((v) => MALE_RE.test(v.name) && !FEMALE_RE.test(v.name));
        /* Only set voice if we found a confirmed male — otherwise let the browser
           use whatever is configured (user can set system default to a male voice) */
        if (maleVoice) utterance.voice = maleVoice;

        const watchdog = window.setInterval(() => {
          if (runIdRef.current !== runId || !isPlayingRef.current) {
            window.speechSynthesis.cancel();
            window.clearInterval(watchdog);
            resolve(false);
          }
        }, 100);

        utterance.onend = () => {
          window.clearInterval(watchdog);
          resolve(runIdRef.current === runId && isPlayingRef.current);
        };
        utterance.onerror = () => {
          window.clearInterval(watchdog);
          resolve(true); /* skip on error, don't block playback */
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [playbackSpeedRef]
  );

  const preloadNextVerse = useCallback((index: number) => {
    const nextVerse = versesRef.current[index + 1];
    if (!nextVerse) {
      return;
    }

    if (playModeRef.current !== 'translation_only' && nextVerse.arabicAudioUrl) {
      const preloader = new Audio();
      preloader.preload = 'auto';
      preloader.src = nextVerse.arabicAudioUrl;
    }

    if (playModeRef.current !== 'arabic_only' && nextVerse.translationAudioUrl) {
      const preloader = new Audio();
      preloader.preload = 'auto';
      preloader.src = nextVerse.translationAudioUrl;
    }
  }, []);

  const runPlaybackLoop = useCallback(
    async (startIndex: number, runId: number) => {
      const arabicAudio = arabicAudioRef.current;
      const translationAudio = translationAudioRef.current;

      if (!arabicAudio || !translationAudio) {
        return;
      }

      let completedSurah = true;

      for (let index = startIndex; index < versesRef.current.length; index += 1) {
        if (runIdRef.current !== runId || !isPlayingRef.current) {
          completedSurah = false;
          break;
        }

        const verse = versesRef.current[index];
        setCurrentVerseIndex(index);
        currentVerseIndexRef.current = index;
        onVerseChange?.(index);
        preloadNextVerse(index);

        if (playModeRef.current !== 'translation_only') {
          setCurrentTrack('arabic');
          const didCompleteArabic = await playAudio(arabicAudio, verse.arabicAudioUrl, runId, 'arabic');
          if (!didCompleteArabic) {
            completedSurah = false;
            break;
          }
        }

        if (playModeRef.current === 'both') {
          setCurrentTrack('gap');
          const stillActive = await sleepForGap(pauseGapMsRef.current, runId);
          if (!stillActive) {
            completedSurah = false;
            break;
          }
        }

        if (playModeRef.current !== 'arabic_only') {
          setCurrentTrack('translation');

          if (verse.translationAudioUrl) {
            const didCompleteTranslation = await playAudio(
              translationAudio,
              verse.translationAudioUrl,
              runId,
              'translation'
            );
            if (!didCompleteTranslation) {
              completedSurah = false;
              break;
            }
          } else if (verse.englishText) {
            /* No audio file — use browser TTS to read the translation aloud */
            const stillActive = await speakTranslation(verse.englishText, runId);
            if (!stillActive) {
              completedSurah = false;
              break;
            }
          }
        }

        setCompletedVerseIndexes((prev) => {
          if (prev.includes(index)) {
            return prev;
          }
          return [...prev, index];
        });

        onVerseCompleted?.(verse);

        if (index < versesRef.current.length - 1) {
          const stillActive = await sleepForGap(300, runId);
          if (!stillActive) {
            completedSurah = false;
            break;
          }
        }
      }

      if (runIdRef.current !== runId) {
        return;
      }

      isPlayingRef.current = false;
      setIsPlaying(false);
      setCurrentTrack('idle');

      if (completedSurah && versesRef.current.length > 0) {
        onSurahComplete?.();
      }
    },
    [onSurahComplete, onVerseChange, playAudio, preloadNextVerse, sleepForGap, speakTranslation]
  );

  const startFrom = useCallback(
    (index: number) => {
      if (versesRef.current.length === 0) {
        return;
      }

      const nextIndex = clampIndex(index, versesRef.current.length);
      runIdRef.current += 1;
      const runId = runIdRef.current;

      isPlayingRef.current = true;
      setIsPlaying(true);
      setCurrentVerseIndex(nextIndex);
      currentVerseIndexRef.current = nextIndex;
      onVerseChange?.(nextIndex);
      onSessionStart?.();

      void runPlaybackLoop(nextIndex, runId);
    },
    [onSessionStart, onVerseChange, runPlaybackLoop]
  );

  const pause = useCallback(() => {
    runIdRef.current += 1;
    isPlayingRef.current = false;
    setIsPlaying(false);
    setCurrentTrack('idle');

    const arabicAudio = arabicAudioRef.current;
    const translationAudio = translationAudioRef.current;

    if (arabicAudio) arabicAudio.pause();
    if (translationAudio) translationAudio.pause();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const play = useCallback(() => {
    if (isPlayingRef.current || versesRef.current.length === 0) {
      return;
    }

    startFrom(currentVerseIndexRef.current);
  }, [startFrom]);

  const resume = useCallback(() => {
    if (versesRef.current.length === 0) {
      return;
    }

    startFrom(currentVerseIndexRef.current);
  }, [startFrom]);

  const seekToVerse = useCallback(
    (index: number) => {
      const nextIndex = clampIndex(index, versesRef.current.length);
      setCurrentVerseIndex(nextIndex);
      currentVerseIndexRef.current = nextIndex;
      onVerseChange?.(nextIndex);

      if (isPlayingRef.current) {
        startFrom(nextIndex);
      }
    },
    [onVerseChange, startFrom]
  );

  const nextVerse = useCallback(() => {
    seekToVerse(currentVerseIndexRef.current + 1);
  }, [seekToVerse]);

  const previousVerse = useCallback(() => {
    seekToVerse(currentVerseIndexRef.current - 1);
  }, [seekToVerse]);

  const restartSurah = useCallback(() => {
    setCompletedVerseIndexes([]);

    if (isPlayingRef.current) {
      startFrom(0);
      return;
    }

    setCurrentVerseIndex(0);
    currentVerseIndexRef.current = 0;
    onVerseChange?.(0);
  }, [onVerseChange, startFrom]);

  const playerState = useMemo(
    () => ({
      currentVerseIndex,
      isPlaying,
      playMode,
      currentTrack,
      pauseGapMs,
      playbackSpeed
    }),
    [currentTrack, currentVerseIndex, isPlaying, pauseGapMs, playMode, playbackSpeed]
  );

  return {
    ...playerState,
    completedVerseIndexes,
    setPlayMode,
    setPauseGapMs,
    setPlaybackSpeed,
    play,
    pause,
    resume,
    seekToVerse,
    nextVerse,
    previousVerse,
    restartSurah
  };
}
