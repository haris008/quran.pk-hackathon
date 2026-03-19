export interface Chapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  revelation_place: 'makkah' | 'madinah';
}

export interface Verse {
  verseKey: string;
  verseNumber: number;
  arabicText: string;
  englishText: string;
  arabicAudioUrl: string;
  translationAudioUrl: string;
}

export type PlayMode = 'both' | 'arabic_only' | 'translation_only';
export type PlayerTrack = 'arabic' | 'translation' | 'gap' | 'idle';

export interface RecitationOption {
  id: number;
  reciter_name: string;
  style?: string;
}

export interface Translation {
  id: number;
  name: string;
  author_name: string;
  language_name: string;
  slug: string;
}

export interface RawVerse {
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
  translations?: Array<{ text: string }>;
}

export interface RawArabicAudioFile {
  verse_key: string;
  url: string;
}
