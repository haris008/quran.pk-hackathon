import { getUserToken } from '@/lib/auth';

type BookmarkItem = {
  id?: string;
  key?: number;
  verseNumber?: number;
};

type BookmarkMutation = {
  resource?: unknown;
  resourceId?: unknown;
  type?: unknown;
  timestamp?: unknown;
  data?: unknown;
};

type ApiErrorLike = {
  message?: unknown;
  error?: unknown;
  type?: unknown;
};

let bookmarkKeysCache: string[] = [];
const bookmarkIdByVerseKey = new Map<string, string>();
let lastMutationAtCache: number | null = null;

export function getBookmarks(): string[] {
  return [...bookmarkKeysCache];
}

function toVerseKey(item: BookmarkItem): string | null {
  if (typeof item.key !== 'number' || typeof item.verseNumber !== 'number') {
    return null;
  }
  return `${item.key}:${item.verseNumber}`;
}

function updateCacheFromItems(items: BookmarkItem[]): string[] {
  bookmarkIdByVerseKey.clear();

  const keys: string[] = [];
  for (const item of items) {
    const verseKey = toVerseKey(item);
    if (!verseKey) continue;
    keys.push(verseKey);
    if (item.id) {
      bookmarkIdByVerseKey.set(verseKey, item.id);
    }
  }

  bookmarkKeysCache = keys;
  return [...bookmarkKeysCache];
}

function extractErrorMessage(value: unknown): string {
  const data = value as ApiErrorLike;
  if (typeof data?.message === 'string') return data.message;
  if (Array.isArray(data?.message)) {
    return data.message.map((v) => String(v)).join(', ');
  }
  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.type === 'string') return data.type;
  return 'Request failed.';
}

function parseMutationAtHeader(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getMutationCursor(): number {
  return lastMutationAtCache ?? -1;
}

function updateMutationCursor(next: number | null): void {
  if (next === null) return;
  if (!Number.isFinite(next)) return;
  lastMutationAtCache = next;
}

async function tryAddBookmark(
  token: string,
  payload: Record<string, unknown>,
  lastMutationAt: number
): Promise<{ ok: boolean; status: number; data: unknown; mutationAt: number | null }> {
  const res = await fetch(`/api/user/bookmarks?lastMutationAt=${encodeURIComponent(String(lastMutationAt))}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-token': token },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  const mutationAt = parseMutationAtHeader(res.headers.get('x-mutation-at'));
  return { ok: res.ok, status: res.status, data, mutationAt };
}

export async function toggleBookmark(verseKey: string): Promise<string[]> {
  const token = getUserToken();
  if (!token) {
    throw new Error('Please login to manage bookmarks.');
  }

  const isBookmarked = bookmarkKeysCache.includes(verseKey);
  const [surahStr, verseStr] = verseKey.split(':');
  const key = Number(surahStr);
  const verseNumber = Number(verseStr);
  if (!Number.isFinite(key) || !Number.isFinite(verseNumber)) {
    throw new Error('Invalid verse key.');
  }

  if (!isBookmarked) {
    const attempts: Array<Record<string, unknown>> = [
      { key, type: 'ayah', verseNumber, mushaf: 1 },
    ];

    let lastError = 'Failed to add bookmark.';
    for (const payload of attempts) {
      const result = await tryAddBookmark(token, payload, getMutationCursor());
      const data = result.data as { data?: { id?: string } };
      updateMutationCursor(result.mutationAt);

      if (result.ok) {
        if (!bookmarkKeysCache.includes(verseKey)) {
          bookmarkKeysCache = [...bookmarkKeysCache, verseKey];
        }
        if (data?.data?.id) {
          bookmarkIdByVerseKey.set(verseKey, data.data.id);
        }
        return [...bookmarkKeysCache];
      }

      lastError = extractErrorMessage(result.data);
      // For non-validation failures, stop retrying and surface immediately.
      if (result.status !== 422 && result.status !== 400) {
        throw new Error(lastError);
      }
    }

    throw new Error(lastError);
  }

  let bookmarkId = bookmarkIdByVerseKey.get(verseKey);
  if (!bookmarkId) {
    await syncBookmarksFromAPI(token);
    bookmarkId = bookmarkIdByVerseKey.get(verseKey);
    if (!bookmarkId) {
      throw new Error('Could not find bookmark id for deletion.');
    }
  }

  const res = await fetch(
    `/api/user/bookmarks/${encodeURIComponent(bookmarkId)}?lastMutationAt=${encodeURIComponent(String(getMutationCursor()))}`,
    {
    method: 'DELETE',
    headers: { 'x-user-token': token },
      // Pre-live contract: mutation cursor is required for write operations.
      cache: 'no-store',
    }
  );
  const data = await res.json().catch(() => ({}));
  updateMutationCursor(parseMutationAtHeader(res.headers.get('x-mutation-at')));
  if (!res.ok) {
    throw new Error(extractErrorMessage(data) ?? 'Failed to delete bookmark.');
  }

  bookmarkIdByVerseKey.delete(verseKey);
  bookmarkKeysCache = bookmarkKeysCache.filter((k) => k !== verseKey);
  return [...bookmarkKeysCache];
}

export function isBookmarked(verseKey: string): boolean {
  return bookmarkKeysCache.includes(verseKey);
}

export function clearBookmarks(): void {
  bookmarkKeysCache = [];
  bookmarkIdByVerseKey.clear();
  lastMutationAtCache = null;
}

export async function clearAllBookmarksFromAPI(token: string): Promise<string[]> {
  await syncBookmarksFromAPI(token);

  const ids = Array.from(bookmarkIdByVerseKey.values());
  for (const bookmarkId of ids) {
    try {
      const res = await fetch(
        `/api/user/bookmarks/${encodeURIComponent(bookmarkId)}?lastMutationAt=${encodeURIComponent(String(getMutationCursor()))}`,
        {
          method: 'DELETE',
          headers: { 'x-user-token': token },
        }
      );
      updateMutationCursor(parseMutationAtHeader(res.headers.get('x-mutation-at')));
    } catch {
      // Best-effort delete while clearing all.
    }
  }

  return syncBookmarksFromAPI(token);
}

async function syncBookmarksViaMutations(token: string): Promise<string[] | null> {
  const collectedMutations: BookmarkMutation[] = [];
  let page = 1;
  let latestMutationAt: number | null = null;

  for (let i = 0; i < 20; i += 1) {
    const query = new URLSearchParams({
      mutationsSince: '-1',
      resources: 'BOOKMARK',
      limit: '1000',
      page: String(page),
    });

    const res = await fetch(`/api/user/sync?${query.toString()}`, {
      headers: { 'x-user-token': token },
      cache: 'no-store',
    });
    if (!res.ok) {
      // Avoid falling back to the flaky bookmarks list endpoint for auth/scope issues.
      if (res.status < 500) {
        return getBookmarks();
      }
      return null;
    }

    updateMutationCursor(parseMutationAtHeader(res.headers.get('x-mutation-at')));

    const payload = await res.json().catch(() => null);
    if (!isRecord(payload)) return null;
    if (payload.success === false) return null;

    const data = isRecord(payload.data) ? payload.data : null;
    if (!data) return null;

    const bodyMutationAt = parseFiniteNumber(data.lastMutationAt);
    if (bodyMutationAt !== null) {
      latestMutationAt = bodyMutationAt;
    }

    if (Array.isArray(data.mutations)) {
      for (const mutation of data.mutations) {
        if (!isRecord(mutation)) continue;
        if (mutation.resource !== 'BOOKMARK') continue;
        collectedMutations.push(mutation as BookmarkMutation);
      }
    }

    if (data.hasMore !== true) {
      break;
    }
    page += 1;
  }

  if (latestMutationAt !== null) {
    updateMutationCursor(latestMutationAt);
  }

  const sorted = [...collectedMutations].sort((a, b) => {
    const aTimestamp = parseFiniteNumber(a.timestamp) ?? 0;
    const bTimestamp = parseFiniteNumber(b.timestamp) ?? 0;
    return aTimestamp - bTimestamp;
  });

  const byId = new Map<string, BookmarkItem>();
  for (const mutation of sorted) {
    const resourceId = typeof mutation.resourceId === 'string' ? mutation.resourceId : null;
    if (!resourceId) continue;

    const mutationType = typeof mutation.type === 'string' ? mutation.type.toUpperCase() : '';
    if (mutationType === 'DELETE') {
      byId.delete(resourceId);
      continue;
    }

    if (!isRecord(mutation.data)) continue;

    const key = parseFiniteNumber(mutation.data.key);
    const verseNumber = parseFiniteNumber(mutation.data.verseNumber);
    if (key === null || verseNumber === null) continue;

    const bookmarkType =
      typeof mutation.data.bookmarkType === 'string'
        ? mutation.data.bookmarkType
        : null;
    if (bookmarkType && bookmarkType !== 'ayah') continue;

    byId.set(resourceId, { id: resourceId, key, verseNumber });
  }

  return updateCacheFromItems(Array.from(byId.values()));
}

/** Fetch bookmarks from the QF User API and refresh in-memory cache. */
export async function syncBookmarksFromAPI(token: string): Promise<string[]> {
  try {
    const syncedFromMutations = await syncBookmarksViaMutations(token);
    if (syncedFromMutations !== null) {
      return syncedFromMutations;
    }

    const fallback = await fetch('/api/user/bookmarks?mushafId=1&type=ayah&first=20', {
      headers: { 'x-user-token': token },
      cache: 'no-store',
    });
    if (!fallback.ok) return getBookmarks();

    updateMutationCursor(parseMutationAtHeader(fallback.headers.get('x-mutation-at')));

    const data = await fallback.json().catch(() => ({})) as unknown;
    const items = Array.isArray((data as { data?: unknown[] }).data)
      ? (data as { data: unknown[] }).data
      : Array.isArray(data)
        ? data
        : [];
    return updateCacheFromItems(items as BookmarkItem[]);
  } catch {
    return getBookmarks();
  }
}
