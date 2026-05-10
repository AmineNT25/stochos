export type SubjectType = 'work' | 'study' | 'creative' | 'fitness';
export type TimerMethod = 'pomodoro' | 'custom' | 'deep-work';
export type PomodoroPhase = 'work' | 'short-break' | 'long-break';

export interface Goal {
  id: string;
  text: string;
}

export interface ActiveSession {
  id: string;
  name: string;
  subject: SubjectType;
  timerMethod: TimerMethod;
  customDuration: number;
  goals: Goal[];
  dare: string | null;
  punishment: string | null;
  startTime: number;
  pausedAt: number | null;
  totalPausedMs: number;
  pomodoroPhase: PomodoroPhase;
  pomodoroRound: number;
  phaseStartTime: number;
}

export interface CompletedSession {
  id: string;
  name: string;
  subject: SubjectType;
  timerMethod: TimerMethod;
  durationMinutes: number;
  goals: Goal[];
  completedGoalIds: string[];
  dare: string | null;
  punishment: string | null;
  dareCompleted: boolean;
  date: string;
  pomodorosCompleted: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  earned: boolean;
  earnedDate?: string;
}

export interface Friend {
  id: string;
  name: string;
  username: string;
  avatarColor: string;
  initials: string;
  weeklyMinutes: number;
  streak: number;
  recentActivity: string;
  totalSessions: number;
  isYou?: boolean;
}
