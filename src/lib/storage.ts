import type { ActiveSession, CompletedSession, Badge } from './types';
import { BADGE_DEFINITIONS } from './data';

const KEYS = {
  ACTIVE_SESSION: 'stochos_active_session',
  COMPLETED_SESSIONS: 'stochos_completed_sessions',
  BADGES: 'stochos_badges',
  STREAK: 'stochos_streak',
  LAST_SESSION_DATE: 'stochos_last_session_date',
  USER_NAME: 'stochos_user_name',
};

function getJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getActiveSession(): ActiveSession | null {
  return getJSON<ActiveSession | null>(KEYS.ACTIVE_SESSION, null);
}

export function saveActiveSession(session: ActiveSession): void {
  setJSON(KEYS.ACTIVE_SESSION, session);
}

export function clearActiveSession(): void {
  localStorage.removeItem(KEYS.ACTIVE_SESSION);
}

export function getCompletedSessions(): CompletedSession[] {
  return getJSON<CompletedSession[]>(KEYS.COMPLETED_SESSIONS, []);
}

export function addCompletedSession(session: CompletedSession): void {
  const sessions = getCompletedSessions();
  sessions.unshift(session);
  setJSON(KEYS.COMPLETED_SESSIONS, sessions);
}

export function getBadges(): Badge[] {
  return getJSON<Badge[]>(KEYS.BADGES, BADGE_DEFINITIONS);
}

export function saveBadges(badges: Badge[]): void {
  setJSON(KEYS.BADGES, badges);
}

export function unlockBadge(id: string): Badge | null {
  const badges = getBadges();
  const badge = badges.find(b => b.id === id);
  if (!badge || badge.earned) return null;
  badge.earned = true;
  badge.earnedDate = new Date().toISOString();
  saveBadges(badges);
  return badge;
}

export function getStreak(): number {
  return getJSON<number>(KEYS.STREAK, 0);
}

export function updateStreak(): number {
  const lastDate = localStorage.getItem(KEYS.LAST_SESSION_DATE);
  const today = new Date().toDateString();
  if (lastDate === today) return getStreak();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let streak = getStreak();
  if (lastDate === yesterday) streak += 1;
  else if (!lastDate) streak = 1;
  else streak = 1;
  setJSON(KEYS.STREAK, streak);
  localStorage.setItem(KEYS.LAST_SESSION_DATE, today);
  return streak;
}

export function getUserName(): string {
  return getJSON<string>(KEYS.USER_NAME, 'You');
}

export function setUserName(name: string): void {
  setJSON(KEYS.USER_NAME, name);
}

export function getTotalMinutes(): number {
  return getCompletedSessions().reduce((acc, s) => acc + s.durationMinutes, 0);
}

export function getWeeklyMinutes(): number {
  const weekAgo = Date.now() - 7 * 86400000;
  return getCompletedSessions()
    .filter(s => new Date(s.date).getTime() > weekAgo)
    .reduce((acc, s) => acc + s.durationMinutes, 0);
}

export function checkAndUnlockBadges(session: CompletedSession): string[] {
  const unlockedIds: string[] = [];
  const sessions = getCompletedSessions();

  if (sessions.length === 1) { if (unlockBadge('first_session')) unlockedIds.push('first_session'); }
  if (session.completedGoalIds.length === session.goals.length && session.goals.length > 0) {
    if (unlockBadge('perfect_session')) unlockedIds.push('perfect_session');
  }
  if (session.dare && session.dareCompleted) { if (unlockBadge('dare_devil')) unlockedIds.push('dare_devil'); }
  const streak = getStreak();
  if (streak >= 3) { if (unlockBadge('streak_3')) unlockedIds.push('streak_3'); }
  if (streak >= 7) { if (unlockBadge('streak_7')) unlockedIds.push('streak_7'); }
  if (session.timerMethod === 'deep-work') { if (unlockBadge('deep_worker')) unlockedIds.push('deep_worker'); }
  if (sessions.filter(s => s.timerMethod === 'pomodoro').length >= 10) {
    if (unlockBadge('pomodoro_pro')) unlockedIds.push('pomodoro_pro');
  }
  const hour = new Date(session.date).getHours();
  if (hour < 8) { if (unlockBadge('early_bird')) unlockedIds.push('early_bird'); }
  if (hour >= 22) { if (unlockBadge('night_owl')) unlockedIds.push('night_owl'); }

  return unlockedIds;
}
