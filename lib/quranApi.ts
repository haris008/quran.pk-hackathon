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
 * /api/qf      → Quran Foundation authenticated API (prelive) — Arabic text, chapters, recitations
 * /api/v4      → qurancdn.com audio files — no auth needed
 * /api/alquran → alquran.cloud open mirror — English translation text
 *
 * NOTE: The QF prelive test environment has no translation data populated.
 * alquran.cloud serves the identical Saheeh International text as quran.com production.
 */
const API       = '/api/qf';
const AUDIO_API = '/api/v4';
const ALQURAN   = '/api/alquran';

/* Maps translation ID → alquran.cloud edition */
const ALQURAN_EDITION: Record<number, string> = {
  131: 'en.sahih',
  20:  'en.pickthall',
  85:  'en.yusufali',
  17:  'en.hilali',
  22:  'en.asad',
  45:  'en.maududi',
  57:  'en.sahih',
  203: 'en.ahmedali',
  95:  'en.wahiduddin',
};

/* Static translation list — QF prelive has incomplete data */
const STATIC_TRANSLATIONS: Translation[] = [
  { id: 131, name: 'Saheeh International',  author_name: 'Saheeh International',  language_name: 'english', slug: 'en-sahih-international' },
  { id: 20,  name: 'M. Pickthall',          author_name: 'Pickthall',             language_name: 'english', slug: 'en-pickthall' },
  { id: 85,  name: 'A. Yusuf Ali',          author_name: 'Yusuf Ali',             language_name: 'english', slug: 'en-yusuf-ali' },
  { id: 17,  name: 'Al-Hilali & Khan',      author_name: 'Hilali & Khan',         language_name: 'english', slug: 'en-hilali-khan' },
  { id: 22,  name: 'Muhammad Asad',         author_name: 'Muhammad Asad',         language_name: 'english', slug: 'en-muhammad-asad' },
  { id: 45,  name: 'Abul Ala Maududi',      author_name: 'Maududi',               language_name: 'english', slug: 'en-maududi' },
  { id: 203, name: 'Ahmed Ali',             author_name: 'Ahmed Ali',             language_name: 'english', slug: 'en-ahmed-ali' },
  { id: 95,  name: 'Wahiduddin Khan',       author_name: 'Wahiduddin Khan',       language_name: 'english', slug: 'en-wahiduddin-khan' },
];

/* Module-level cache — survives client-side navigations */
const chapterCache = new Map<string, Chapter[]>();
const verseCache   = new Map<string, RawVerse[]>();
const audioCache   = new Map<string, RawArabicAudioFile[]>();
const alquranCache = new Map<string, Map<number, string>>();

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

export async function fetchVersesByChapter(chapterId: number): Promise<RawVerse[]> {
  const key = `verses-${chapterId}`;
  const hit = verseCache.get(key);
  if (hit) return hit;

  const params = new URLSearchParams({
    fields:   'text_uthmani',
    per_page: '300',
  });

  const data = await fetchJson<{ verses: RawVerse[] }>(
    `${API}/verses/by_chapter/${chapterId}?${params}`
  );
  verseCache.set(key, data.verses ?? []);
  return data.verses ?? [];
}

async function fetchAlquranTranslation(
  chapterId: number,
  translationId: number,
): Promise<Map<number, string>> {
  const edition = ALQURAN_EDITION[translationId] ?? 'en.sahih';
  const key = `alquran-${chapterId}-${edition}`;
  const hit = alquranCache.get(key);
  if (hit) return hit;

  const data = await fetchJson<{
    data: { ayahs: Array<{ numberInSurah: number; text: string }> };
  }>(`${ALQURAN}/surah/${chapterId}/${edition}`);

  const map = new Map<number, string>();
  for (const ayah of data.data.ayahs) {
    map.set(ayah.numberInSurah, stripHtml(ayah.text));
  }
  alquranCache.set(key, map);
  return map;
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
  translationId = 131
): Promise<Verse[]> {
  const [verses, audioFiles, translationMap] = await Promise.all([
    fetchVersesByChapter(chapterId),
    fetchArabicAudioByChapter(chapterId, recitationId),
    fetchAlquranTranslation(chapterId, translationId).catch(() => new Map<number, string>()),
  ]);

  const audioByKey = new Map(audioFiles.map((a) => [a.verse_key, a]));

  return verses.map((verse) => {
    const matched = audioByKey.get(verse.verse_key);

    return {
      verseKey:            verse.verse_key,
      verseNumber:         verse.verse_number,
      arabicText:          verse.text_uthmani,
      englishText:         translationMap.get(verse.verse_number) ?? '',
      arabicAudioUrl:      matched ? getArabicAudioUrl(matched.url) : '',
      translationAudioUrl: getTranslationAudioUrl(chapterId, verse.verse_number),
    };
  });
}
