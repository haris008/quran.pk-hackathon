const STREAK_KEY = 'bilingual_radio_streak';

interface StreakData {
  count: number;
  lastActiveDate: string; /* ISO date string YYYY-MM-DD */
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getStreak(): number {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw) as StreakData;
    /* If last active was yesterday or today, streak is still alive */
    if (data.lastActiveDate === todayISO() || data.lastActiveDate === yesterdayISO()) {
      return data.count;
    }
    return 0;
  } catch {
    return 0;
  }
}

export function recordSessionToday(): number {
  const today = todayISO();
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) {
      const data = JSON.parse(raw) as StreakData;
      if (data.lastActiveDate === today) {
        return data.count; /* Already counted today */
      }
      const newCount =
        data.lastActiveDate === yesterdayISO() ? data.count + 1 : 1;
      const next: StreakData = { count: newCount, lastActiveDate: today };
      localStorage.setItem(STREAK_KEY, JSON.stringify(next));
      return newCount;
    }
  } catch {
    /* ignore */
  }

  const fresh: StreakData = { count: 1, lastActiveDate: today };
  localStorage.setItem(STREAK_KEY, JSON.stringify(fresh));
  return 1;
}
