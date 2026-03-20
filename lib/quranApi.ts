import { getArabicAudioUrl, getTranslationAudioUrl, SUPPORTED_RECITER_IDS } from '@/lib/audioUtils';
import type {
  Chapter,
  RawArabicAudioFile,
  RawVerse,
  RecitationOption,
  Translation,
  Verse,
} from '@/types/quran';

/*
 * /api/qf  → Quran Foundation Content API (prelive) — Arabic text, chapters, recitations, translations
 * /api/v4  → api.qurancdn.com/api/v4 — audio files (no auth needed)
 */
const API       = '/api/qf';
const AUDIO_API = '/api/v4';

/* English translations — IDs from api.qurancdn.com/api/v4/resources/translations, matching quran.com */
const STATIC_TRANSLATIONS: Translation[] = [
  { id: 85,  name: 'M.A.S. Abdel Haleem',         author_name: 'Abdul Haleem',              language_name: 'english', slug: 'en-haleem' },
  { id: 84,  name: 'T. Usmani',                   author_name: 'Mufti Taqi Usmani',         language_name: 'english', slug: 'en-taqi-usmani' },
  { id: 95,  name: 'A. Maududi (Tafhim)',          author_name: 'Sayyid Abul Ala Maududi',   language_name: 'english', slug: 'en-al-maududi' },
  { id: 20,  name: 'Saheeh International',         author_name: 'Saheeh International',      language_name: 'english', slug: 'en-sahih-international' },
  { id: 19,  name: 'M. Pickthall',                 author_name: 'Mohammed Pickthall',        language_name: 'english', slug: 'quran.en.pickthall' },
  { id: 22,  name: 'A. Yusuf Ali',                 author_name: 'Abdullah Yusuf Ali',        language_name: 'english', slug: 'quran.en.yusufali' },
  { id: 203, name: 'Al-Hilali & Khan',             author_name: 'Al-Hilali & Khan',          language_name: 'english', slug: '' },
  { id: 149, name: "Bridges' Translation",         author_name: 'Fadel Soliman',             language_name: 'english', slug: 'bridges-translation' },
];

/* Module-level cache — survives client-side navigations */
const chapterCache = new Map<string, Chapter[]>();
const verseCache   = new Map<string, RawVerse[]>();
const audioCache   = new Map<string, RawArabicAudioFile[]>();

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${url}`);
  }

  return response.json() as Promise<T>;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, '').trim();
}

export async function fetchChapters(language = 'en'): Promise<Chapter[]> {
  const key = `chapters-${language}`;
  const hit = chapterCache.get(key);
  if (hit) return hit;

  const data = await fetchJson<{ chapters: Chapter[] }>(
    `${API}/chapters?language=${language}`
  );
  chapterCache.set(key, data.chapters);
  return data.chapters;
}

export async function fetchRecitations(language = 'en'): Promise<RecitationOption[]> {
  const data = await fetchJson<{ recitations: RecitationOption[] }>(
    `${API}/resources/recitations?language=${language}`
  );
  return data.recitations.filter((r) =>
    SUPPORTED_RECITER_IDS.includes(r.id as (typeof SUPPORTED_RECITER_IDS)[number])
  );
}

export async function fetchTranslations(): Promise<Translation[]> {
  return STATIC_TRANSLATIONS;
}

export async function fetchVersesByChapter(
  chapterId: number,
  translationId = 20
): Promise<RawVerse[]> {
  const key = `verses-${chapterId}-${translationId}`;
  const hit = verseCache.get(key);
  if (hit) return hit;

  // api.qurancdn.com is Quran Foundation's own production CDN (quran.com API)
  // The prelive environment has no translation data, so we use production CDN for content
  const params = new URLSearchParams({
    translations: String(translationId),
    fields:       'text_uthmani',
    per_page:     '300',
  });
  const data = await fetchJson<{ verses: RawVerse[] }>(
    `${AUDIO_API}/verses/by_chapter/${chapterId}?${params}`
  );
  verseCache.set(key, data.verses ?? []);
  return data.verses ?? [];
}

export async function fetchArabicAudioByChapter(
  chapterId: number,
  recitationId: number
): Promise<RawArabicAudioFile[]> {
  const key = `audio-${chapterId}-${recitationId}`;
  const hit = audioCache.get(key);
  if (hit) return hit;

  const params = new URLSearchParams({ per_page: '300' });

  const data = await fetchJson<{ audio_files: RawArabicAudioFile[] }>(
    `${AUDIO_API}/recitations/${recitationId}/by_chapter/${chapterId}?${params}`
  );
  audioCache.set(key, data.audio_files ?? []);
  return data.audio_files ?? [];
}

export async function loadBilingualSurah(
  chapterId: number,
  recitationId: number,
  translationId = 20
): Promise<Verse[]> {
  const [verses, audioFiles] = await Promise.all([
    fetchVersesByChapter(chapterId, translationId),
    fetchArabicAudioByChapter(chapterId, recitationId),
  ]);

  const audioByKey = new Map(audioFiles.map((a) => [a.verse_key, a]));

  return verses.map((verse) => {
    const matched = audioByKey.get(verse.verse_key);
    const rawTranslation = verse.translations?.[0]?.text ?? '';

    return {
      verseKey:            verse.verse_key,
      verseNumber:         verse.verse_number,
      arabicText:          verse.text_uthmani,
      englishText:         stripHtml(rawTranslation),
      arabicAudioUrl:      matched ? getArabicAudioUrl(matched.url) : '',
      translationAudioUrl: getTranslationAudioUrl(chapterId, verse.verse_number),
    };
  });
}
