import { clearSession, getUserToken } from '@/lib/auth';

interface StreakApiItem {
  id?: string;
  startDate?: string;
  endDate?: string;
  status?: 'ACTIVE' | 'BROKEN' | string;
  days?: number | string;
  streak_count?: number;
}

interface StreakApiResponse {
  data?: StreakApiItem[];
}

type VerseReference = {
  surahId: number;
  verseNumber: number;
};

type ApiErrorLike = {
  message?: unknown;
  error?: unknown;
  type?: unknown;
};

const SESSION_EXPIRED_ERROR = 'SESSION_EXPIRED';
const SESSION_EXPIRED_EVENT = 'qf-session-expired';

export async function fetchStreakFromAPI(token: string): Promise<number> {
  try {
    const query = new URLSearchParams({
      first: '10',
      type: 'QURAN',
      status: 'ACTIVE',
      orderBy: 'days',
      sortOrder: 'desc',
    });
    const res = await fetch(`/api/user/streaks?${query.toString()}`, {
      headers: { 'x-user-token': token },
      cache: 'no-store',
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      const type = isRecord(payload) && typeof payload.type === 'string' ? payload.type : '';
      if (type === 'invalid_token') {
        handleSessionExpired();
        throw new Error(SESSION_EXPIRED_ERROR);
      }
      return 0;
    }

    const payload = await res.json().catch(() => ({})) as StreakApiResponse;
    const items = Array.isArray(payload.data) ? payload.data : [];

    // New schema: each streak has `days` + `status`.
    const active = items.find((item) => item?.status === 'ACTIVE');
    const activeDays = parseFiniteNumber(active?.days);
    if (activeDays !== null) {
      return activeDays;
    }

    // Legacy fallback used in older experiments.
    const legacy = parseFiniteNumber(items[0]?.streak_count);
    if (legacy !== null) {
      return legacy;
    }

    // If status filter is ignored upstream, use max days from returned streaks.
    const maxDays = items.reduce((max, item) => {
      const days = parseFiniteNumber(item?.days);
      return days !== null && days > max ? days : max;
    }, 0);
    if (maxDays > 0) {
      return maxDays;
    }

    return 0;
  } catch (error) {
    if (error instanceof Error && error.message === SESSION_EXPIRED_ERROR) {
      throw error;
    }
    return 0;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function parseFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function handleSessionExpired(): void {
  clearSession();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
}

function parseVerseKey(verseKey: string): VerseReference | null {
  const [surahStr, verseStr] = verseKey.split(':');
  const surahId = Number(surahStr);
  const verseNumber = Number(verseStr);
  if (!Number.isFinite(surahId) || !Number.isFinite(verseNumber)) {
    return null;
  }
  if (surahId <= 0 || verseNumber <= 0) {
    return null;
  }
  return { surahId, verseNumber };
}

function getCurrentTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz || 'UTC';
  } catch {
    return 'UTC';
  }
}

function extractErrorMessage(value: unknown): string {
  const data = value as ApiErrorLike;
  if (typeof data?.message === 'string') return data.message;
  if (Array.isArray(data?.message)) {
    return data.message.map((item) => String(item)).join(', ');
  }
  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.type === 'string') return data.type;
  return 'Request failed.';
}

/**
 * Record Quran reading activity so streaks can be progressed by the Activity Days API.
 * Returns true only when the upstream call is accepted.
 */
export async function recordActivityForVerse(verseKey: string, seconds = 5): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const token = getUserToken();
  if (!token) return false;

  const verse = parseVerseKey(verseKey);
  if (!verse) return false;

  const safeSeconds = Math.max(1, Math.round(seconds));
  const ayahRange = `${verse.surahId}:${verse.verseNumber}-${verse.surahId}:${verse.verseNumber}`;

  try {
    const res = await fetch('/api/user/activity-days', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-token': token,
        'x-timezone': getCurrentTimezone(),
      },
      body: JSON.stringify({
        type: 'QURAN',
        seconds: safeSeconds,
        ranges: [ayahRange],
        mushafId: 1,
      }),
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return true;
    }

    const type = isRecord(data) && typeof data.type === 'string' ? data.type : '';
    if (type === 'invalid_token') {
      handleSessionExpired();
      return false;
    }

    console.warn('[streak] activity-day write failed:', extractErrorMessage(data));
    return false;
  } catch {
    return false;
  }
}
