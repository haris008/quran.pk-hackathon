import { getUserToken } from '@/lib/auth';

const BOOKMARKS_KEY = 'bilingual_radio_bookmarks';

export function getBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

export function toggleBookmark(verseKey: string): string[] {
  const current      = getBookmarks();
  const isBookmarked = current.includes(verseKey);
  const next         = isBookmarked
    ? current.filter((k) => k !== verseKey)
    : [...current, verseKey];

  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
  } catch {
    /* ignore storage errors */
  }

  // Sync to Quran Foundation User API (fire-and-forget, silent on failure)
  // verseKey format: "2:5" → surahNumber=2, verseNumber=5
  const [surahStr, verseStr] = verseKey.split(':');
  const token = getUserToken();
  if (token) {
    if (!isBookmarked) {
      void fetch('/api/user/bookmarks', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-token': token },
        body: JSON.stringify({
          key:         Number(surahStr),
          type:        'ayah',
          verseNumber: Number(verseStr),
          mushaf:      1,
        }),
      }).catch(() => {});
    } else {
      // Remove bookmark from server
      void fetch(`/api/user/bookmarks/${Number(surahStr)}/${Number(verseStr)}`, {
        method:  'DELETE',
        headers: { 'x-user-token': token },
      }).catch(() => {});
    }
  }

  return next;
}

export function isBookmarked(verseKey: string): boolean {
  return getBookmarks().includes(verseKey);
}
