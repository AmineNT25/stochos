'use client';

import { useRouter } from 'next/navigation';
import { Flame, Clock, Target, Trophy, Zap, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { getCompletedSessions, getStreak, getTotalMinutes, getWeeklyMinutes, getUserName } from '@/lib/storage';
import { SUBJECT_CONFIG } from '@/lib/data';
import type { CompletedSession } from '@/lib/types';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function SessionCard({ session }: { session: CompletedSession }) {
  const cfg = SUBJECT_CONFIG[session.subject];
  const completionRate = session.goals.length > 0
    ? session.completedGoalIds.length / session.goals.length
    : 1;

  return (
    <div
      className="rounded-2xl p-4 transition-all hover:opacity-90"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: cfg.bg }}>
            {cfg.icon}
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{session.name}</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{cfg.label} · {timeAgo(session.date)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{formatDuration(session.durationMinutes)}</p>
          {session.timerMethod === 'pomodoro' && session.pomodorosCompleted > 0 && (
            <p className="text-orange-400 text-xs">🍅 ×{session.pomodorosCompleted}</p>
          )}
        </div>
      </div>

      {session.goals.length > 0 && (
        <div className="mb-3">
          <div className="flex gap-1 mb-1.5">
            {session.goals.map(g => (
              <div
                key={g.id}
                className="flex-1 h-1.5 rounded-full"
                style={{ background: session.completedGoalIds.includes(g.id) ? '#f97316' : 'var(--secondary)' }}
              />
            ))}
          </div>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {session.completedGoalIds.length}/{session.goals.length} goals completed
          </p>
        </div>
      )}

      {session.dare && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
            background: session.dareCompleted ? 'rgba(168,85,247,0.15)' : 'rgba(239,68,68,0.15)',
            color: session.dareCompleted ? '#a855f7' : '#ef4444',
          }}>
            {session.dareCompleted ? '😈 Dare completed!' : '💀 Dare missed'}
          </span>
        </div>
      )}

      {session.punishment && session.completedGoalIds.length < session.goals.length && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
          <XCircle className="w-3 h-3" />
          <span className="truncate">{session.punishment}</span>
        </div>
      )}

      {completionRate === 1 && session.goals.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-green-400">
          <CheckCircle2 className="w-3 h-3" />
          <span>Perfect session!</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const sessions = getCompletedSessions();
  const streak = getStreak();
  const totalMinutes = getTotalMinutes();
  const weeklyMinutes = getWeeklyMinutes();
  const userName = getUserName();

  const displayName = userName === 'You' ? 'Champion' : userName;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label: 'Current Streak', value: `${streak}d`, icon: Flame, color: '#ef4444' },
    { label: 'This Week', value: formatDuration(weeklyMinutes), icon: Clock, color: '#3b82f6' },
    { label: 'Total Hours', value: formatDuration(totalMinutes), icon: Target, color: '#22c55e' },
    { label: 'Sessions', value: sessions.length.toString(), icon: Trophy, color: '#f59e0b' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{greeting},</p>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{displayName} 👋</h1>
          </div>
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-bold">{streak} day streak</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push('/session/new')}
        className="w-full rounded-2xl p-5 mb-8 relative overflow-hidden group cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
      >
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all rounded-2xl" />
        <div className="relative flex items-center justify-between">
          <div className="text-left">
            <p className="text-white/80 text-sm mb-0.5">Ready to focus?</p>
            <p className="text-white font-bold text-xl">Start a Session</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" fill="white" />
          </div>
        </div>
      </button>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>Recent Sessions</h2>
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-1 text-orange-400 text-sm hover:text-orange-300 transition-colors"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
            <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No sessions yet. Start your first focus session!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.slice(0, 4).map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
