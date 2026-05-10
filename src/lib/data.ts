import type { Badge } from './types';

export const BADGE_DEFINITIONS: Badge[] = [
  { id: 'first_session', name: 'First Focus', description: 'Complete your very first session', emoji: '🎯', color: '#f97316', earned: false },
  { id: 'perfect_session', name: 'Perfect Session', description: 'Complete 100% of your goals', emoji: '⭐', color: '#f59e0b', earned: false },
  { id: 'dare_devil', name: 'Dare Devil', description: 'Complete a session with a dare enabled', emoji: '😈', color: '#a855f7', earned: false },
  { id: 'streak_3', name: 'On Fire', description: 'Maintain a 3-day streak', emoji: '🔥', color: '#ef4444', earned: false },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', emoji: '⚡', color: '#eab308', earned: false },
  { id: 'pomodoro_pro', name: 'Pomodoro Pro', description: 'Complete 10 Pomodoro sessions', emoji: '🍅', color: '#ef4444', earned: false },
  { id: 'deep_worker', name: 'Deep Worker', description: 'Complete a 90-minute deep work session', emoji: '🧠', color: '#3b82f6', earned: false },
  { id: 'early_bird', name: 'Early Bird', description: 'Start a session before 8 AM', emoji: '🌅', color: '#f97316', earned: false },
  { id: 'night_owl', name: 'Night Owl', description: 'Complete a session after 10 PM', emoji: '🦉', color: '#6366f1', earned: false },
  { id: 'marathon', name: 'Marathon', description: 'Accumulate 4+ hours in a single day', emoji: '🏆', color: '#22c55e', earned: false },
  { id: 'comeback', name: 'Comeback Kid', description: 'Return after a 3-day gap', emoji: '💪', color: '#06b6d4', earned: false },
  { id: 'social', name: 'Social Hustler', description: 'Have at least 3 friends on Stochos', emoji: '🤝', color: '#84cc16', earned: false },
];

export const DARES = [
  'No phone allowed — not even to check the time',
  'Work from a new location you\'ve never tried before',
  'No coffee or tea until session ends',
  'Do a set of 10 push-ups before each break',
  'Write down your distracting thoughts on paper only — no typing',
  'Keep your desk completely clean before starting',
  'No headphones — work in ambient silence',
  'Share your goal list publicly before starting',
];

export const PUNISHMENTS = [
  '💪 Do 20 push-ups right now',
  '🚿 Cold shower within the hour',
  '📵 No social media for the next 3 hours',
  '🌅 Wake up 30 minutes earlier tomorrow',
  '📣 Tell your accountability partner you failed',
  '🏃 Go for a 10-minute run or walk immediately',
  '🥗 Skip dessert for today',
  '📝 Write a 5-sentence reflection on why you missed your goals',
];


export const SUBJECT_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  work: { label: 'Work', icon: '💼', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  study: { label: 'Study', icon: '📚', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  creative: { label: 'Creative', icon: '🎨', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  fitness: { label: 'Fitness', icon: '💪', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
};

export const TIMER_METHOD_CONFIG: Record<string, { label: string; description: string; minutes: number }> = {
  pomodoro: { label: 'Pomodoro', description: '25 min focus + 5 min break', minutes: 25 },
  'deep-work': { label: 'Deep Work', description: '90 min uninterrupted flow', minutes: 90 },
  custom: { label: 'Custom', description: 'Set your own duration', minutes: 30 },
};
