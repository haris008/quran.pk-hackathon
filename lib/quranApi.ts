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
 * All content fetched from QF authenticated Content API (apis.quran.foundation)
 * via the /api/qf server-side proxy which adds x-auth-token + x-client-id headers.
 * Audio mp3 files are served from audio.qurancdn.com CDN (unavoidable — it's QF's own media CDN).
 */
const API = '/api/qf';

/* Module-level cache — survives client-side navigations */
const chapterCache  = new Map<string, Chapter[]>();
const verseCache    = new Map<string, RawVerse[]>();
const audioCache    = new Map<string, RawArabicAudioFile[]>();
const txListCache   = new Map<string, Translation[]>();

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`API error ${response.status}: ${url}`);
  return response.json() as Promise<T>;
}

function stripHtml(value: string): string {
  // Remove <sup> footnote markers entirely (including their content)
  return value.replace(/<sup[^>]*>.*?<\/sup>/gi, '').replace(/<[^>]+>/g, '').trim();
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
  const key = 'translations-english';
  const hit = txListCache.get(key);
  if (hit) return hit;

  const data = await fetchJson<{ translations: Translation[] }>(
    `${API}/resources/translations?language=en`
  );
  // Filter English only, exclude Transliteration (romanized pronunciation, not a translation)
  const english = (data.translations ?? []).filter(
    (t) => t.language_name === 'english' && t.id !== 57
  );
  txListCache.set(key, english);
  return english;
}

export async function fetchVersesByChapter(
  chapterId: number,
  translationId = 20
): Promise<RawVerse[]> {
  const key = `verses-${chapterId}-${translationId}`;
  const hit = verseCache.get(key);
  if (hit) return hit;

  const params = new URLSearchParams({
    translations: String(translationId),
    fields:       'text_uthmani,text_qpc_hafs,page_number',
    per_page:     '300',
  });
  const data = await fetchJson<{ verses: RawVerse[] }>(
    `${API}/verses/by_chapter/${chapterId}?${params}`
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

  const data = await fetchJson<{ audio_files: RawArabicAudioFile[] }>(
    `${API}/recitations/${recitationId}/by_chapter/${chapterId}?per_page=300`
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
    const matched        = audioByKey.get(verse.verse_key);
    const rawTranslation = verse.translations?.[0]?.text ?? '';

    return {
      verseKey:            verse.verse_key,
      verseNumber:         verse.verse_number,
      arabicText:          verse.text_uthmani,
      qpcText:             verse.text_qpc_hafs,
      pageNumber:          verse.page_number,
      englishText:         stripHtml(rawTranslation),
      arabicAudioUrl:      matched ? getArabicAudioUrl(matched.url) : '',
      translationAudioUrl: getTranslationAudioUrl(chapterId, verse.verse_number),
    };
  });
}
