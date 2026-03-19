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
  void fetch('/api/qdc/bookmarks', {
    method:  isBookmarked ? 'DELETE' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ verse_key: verseKey }),
  }).catch(() => {});

  return next;
}

export function isBookmarked(verseKey: string): boolean {
  return getBookmarks().includes(verseKey);
}
