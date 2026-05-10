'use client';

import { useState } from 'react';
import { Flame, Users, TrendingUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getWeeklyMinutes, getStreak, getCompletedSessions } from '@/lib/storage';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getInitials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function ChallengeCard() {
  const [joined, setJoined] = useState(false);
  return (
    <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 mb-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-purple-400 font-semibold text-sm">😈 Weekly Dare Challenge</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Top 3 this week earn the &quot;Week Warrior&quot; badge
          </p>
        </div>
        <span className="text-2xl">🏆</span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
          <div className="h-full bg-purple-500 rounded-full" style={{ width: '52%' }} />
        </div>
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>3d left</span>
      </div>
      <button
        onClick={() => setJoined(v => !v)}
        className="w-full py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer"
        style={{
          background: joined ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.1)',
          color: '#a855f7',
          border: `1px solid ${joined ? 'rgba(168,85,247,0.5)' : 'rgba(168,85,247,0.2)'}`,
        }}
      >
        {joined ? "✅ You're in! Keep grinding." : 'Join the challenge'}
      </button>
    </div>
  );
}

type Period = 'week' | 'month' | 'all';

export default function Leaderboard() {
  const { data: session } = useSession();
  const [period, setPeriod] = useState<Period>('week');

  const weeklyMinutes = getWeeklyMinutes();
  const streak = getStreak();
  const totalSessions = getCompletedSessions().length;
  const userName = session?.user?.name ?? 'You';
  const initials = getInitials(session?.user?.name);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-bold text-2xl mb-1" style={{ color: 'var(--foreground)' }}>Compete</h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>This week&apos;s focus leaderboard</p>
      </div>

      {/* Your stats card */}
      <div
        className="flex items-center gap-3 p-4 rounded-2xl border mb-6"
        style={{ background: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.3)' }}
      >
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center font-bold text-orange-400 text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--foreground)' }}>{userName}</p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {totalSessions === 0 ? 'No sessions yet — start your first!' : `${totalSessions} session${totalSessions === 1 ? '' : 's'} completed`}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-orange-400 font-bold text-lg">{formatDuration(weeklyMinutes)}</p>
          {streak > 0 && (
            <div className="flex items-center gap-1 justify-end">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-orange-400 text-xs">{streak}d</span>
            </div>
          )}
        </div>
      </div>

      {/* Period tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {(['week', 'month', 'all'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer capitalize"
            style={{
              background: period === p ? '#f97316' : 'transparent',
              color: period === p ? 'white' : 'var(--muted-foreground)',
            }}
          >
            {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
          </button>
        ))}
      </div>

      <ChallengeCard />

      {/* Empty leaderboard state */}
      <div
        className="rounded-2xl p-8 flex flex-col items-center gap-4 text-center"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}
        >
          <Users className="w-8 h-8 text-orange-400 opacity-60" />
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
            You&apos;re the only one here
          </p>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            The leaderboard fills up as more users join.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <TrendingUp className="w-4 h-4 text-orange-400" />
          <span className="text-sm text-orange-400 font-medium">
            {weeklyMinutes > 0 ? `You've logged ${formatDuration(weeklyMinutes)} this week` : 'Start a session to get on the board'}
          </span>
        </div>
      </div>
    </div>
  );
}
