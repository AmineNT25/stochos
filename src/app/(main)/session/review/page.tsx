'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Trophy, Zap, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getActiveSession, clearActiveSession, addCompletedSession,
  checkAndUnlockBadges, updateStreak, getBadges,
} from '@/lib/storage';
import { SUBJECT_CONFIG } from '@/lib/data';
import type { ActiveSession, CompletedSession, Badge } from '@/lib/types';

function generateId(): string { return Math.random().toString(36).slice(2, 11); }

export default function SessionReview() {
  const router = useRouter();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [checkedGoals, setCheckedGoals] = useState<Set<string>>(new Set());
  const [dareCompleted, setDareCompleted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [punishmentRevealed, setPunishmentRevealed] = useState(false);
  const confettiRef = useRef(false);

  useEffect(() => {
    const s = getActiveSession();
    if (!s) { router.push('/'); return; }
    setSession(s);
  }, [router]);

  const toggleGoal = (id: string) => {
    if (submitted) return;
    setCheckedGoals(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!session) return;
    const completedGoalIds = Array.from(checkedGoals);
    const rate = session.goals.length > 0 ? completedGoalIds.length / session.goals.length : 1;
    setCompletionRate(rate);
    const durationMs = Date.now() - session.startTime - session.totalPausedMs;
    const durationMinutes = Math.max(1, Math.floor(durationMs / 60000));
    const pomodoroCount = session.timerMethod === 'pomodoro'
      ? session.pomodoroRound - 1 + (session.pomodoroPhase !== 'work' ? 1 : 0) : 0;

    const completed: CompletedSession = {
      id: generateId(), name: session.name, subject: session.subject, timerMethod: session.timerMethod,
      durationMinutes, goals: session.goals, completedGoalIds,
      dare: session.dare, punishment: rate < 1 ? session.punishment : null,
      dareCompleted, date: new Date().toISOString(), pomodorosCompleted: pomodoroCount,
    };

    addCompletedSession(completed);
    updateStreak();
    const unlockedIds = checkAndUnlockBadges(completed);
    clearActiveSession();
    const allBadges = getBadges();
    setNewBadges(allBadges.filter(b => unlockedIds.includes(b.id)));
    setSubmitted(true);

    if (rate >= 0.8 && !confettiRef.current) {
      confettiRef.current = true;
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#f97316', '#ef4444', '#f59e0b', '#22c55e'] });
    }
    if (rate < 1 && session.punishment) setTimeout(() => setPunishmentRevealed(true), 500);
  };

  if (!session) return null;
  const subjectCfg = SUBJECT_CONFIG[session.subject];

  if (submitted) {
    const failed = completionRate < 1 && session.goals.length > 0;
    return (
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col items-center">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {completionRate === 1 ? '🏆' : completionRate >= 0.5 ? '💪' : '😤'}
          </div>
          <h1 className="font-bold text-2xl mb-1" style={{ color: 'var(--foreground)' }}>
            {completionRate === 1 ? 'Perfect Session!' : completionRate >= 0.5 ? 'Good Effort!' : 'Keep Pushing!'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {checkedGoals.size}/{session.goals.length} goals completed · {Math.round(completionRate * 100)}% completion rate
          </p>
        </div>

        <div className="relative mb-8">
          <svg width={160} height={160} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={80} cy={80} r={65} fill="none" stroke="var(--border)" strokeWidth={12} />
            <circle cx={80} cy={80} r={65} fill="none"
              stroke={completionRate === 1 ? '#f97316' : completionRate >= 0.5 ? '#f59e0b' : '#ef4444'}
              strokeWidth={12} strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 65}
              strokeDashoffset={2 * Math.PI * 65 * (1 - completionRate)}
              style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-2xl" style={{ color: 'var(--foreground)' }}>{Math.round(completionRate * 100)}%</span>
          </div>
        </div>

        {newBadges.length > 0 && (
          <div className="w-full mb-6">
            <p className="text-center text-yellow-400 font-semibold text-sm mb-3 uppercase tracking-wider">🎉 New Badges Unlocked!</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {newBadges.map(badge => (
                <div key={badge.id} className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border"
                  style={{ background: `${badge.color}15`, borderColor: `${badge.color}40` }}>
                  <span className="text-3xl">{badge.emoji}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {session.dare && (
          <div className="w-full mb-4 p-4 rounded-2xl border"
            style={{ background: dareCompleted ? 'rgba(168,85,247,0.1)' : 'rgba(239,68,68,0.1)', borderColor: dareCompleted ? 'rgba(168,85,247,0.3)' : 'rgba(239,68,68,0.3)' }}>
            <p className="text-sm font-medium" style={{ color: dareCompleted ? '#a855f7' : '#ef4444' }}>
              {dareCompleted ? '😈 Dare completed! Respect.' : '💀 Dare missed'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{session.dare}</p>
          </div>
        )}

        {failed && session.punishment && punishmentRevealed && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
            <p className="text-red-400 font-semibold text-sm mb-1">⚠️ Punishment Time</p>
            <p className="text-sm" style={{ color: 'var(--foreground)' }}>{session.punishment}</p>
            <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>Be honest with yourself. That&apos;s how you grow! 💪</p>
          </div>
        )}

        <div className="w-full mb-8 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
          <p className="text-blue-400 text-sm font-medium mb-1">🤝 Honesty is the game</p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>On Stochos, you&apos;re competing on real effort. No one is judging — only you know what you actually did.</p>
        </div>

        <div className="w-full flex flex-col gap-2">
          <button onClick={() => router.push('/session/new')}
            className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
            <Zap className="w-5 h-5" fill="white" />
            Start Another Session
          </button>
          <button onClick={() => router.push('/')}
            className="w-full py-3 rounded-2xl font-medium flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: 'var(--muted-foreground)' }}>
            <Home className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">✅</span>
        <h1 className="font-bold text-2xl mb-1" style={{ color: 'var(--foreground)' }}>Session Complete!</h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Honestly check off what you actually finished.</p>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-yellow-400/80 text-xs">
          <span>🤝</span>
          <span>Stochos runs on honesty — no cheating yourself</span>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-2xl mb-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: subjectCfg.bg }}>{subjectCfg.icon}</div>
        <div>
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{session.name || 'Focus Session'}</p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{subjectCfg.label} · {session.timerMethod}</p>
        </div>
      </div>

      {session.goals.length > 0 && (
        <div className="mb-6">
          <p className="text-sm mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Did you complete these goals?</p>
          <div className="flex flex-col gap-2">
            {session.goals.map(goal => {
              const checked = checkedGoals.has(goal.id);
              return (
                <button key={goal.id} onClick={() => toggleGoal(goal.id)}
                  className="flex items-center gap-3 p-4 rounded-2xl border transition-all text-left cursor-pointer"
                  style={{ background: checked ? 'rgba(34,197,94,0.08)' : 'var(--card)', borderColor: checked ? 'rgba(34,197,94,0.4)' : 'var(--border)' }}>
                  {checked ? <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" /> : <Circle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />}
                  <span className={`text-sm ${checked ? 'line-through text-green-300' : ''}`} style={{ color: checked ? '' : 'var(--foreground)' }}>{goal.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {session.dare && (
        <div className="mb-6">
          <p className="text-sm mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Dare</p>
          <button onClick={() => setDareCompleted(prev => !prev)}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left cursor-pointer"
            style={{ background: dareCompleted ? 'rgba(168,85,247,0.1)' : 'var(--card)', borderColor: dareCompleted ? 'rgba(168,85,247,0.4)' : 'var(--border)' }}>
            {dareCompleted ? <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" /> : <Circle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />}
            <div>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{session.dare}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Did you complete your dare?</p>
            </div>
          </button>
        </div>
      )}

      {session.punishment && session.goals.length > 0 && checkedGoals.size < session.goals.length && (
        <div className="mb-6 p-3 rounded-xl bg-red-500/5 border border-red-500/20 flex items-start gap-2">
          <span className="text-red-400 mt-0.5">⚠️</span>
          <p className="text-red-400 text-xs">Not all goals completed — your punishment will be revealed when you submit.</p>
        </div>
      )}

      <button onClick={handleSubmit}
        className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-all"
        style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
        <Trophy className="w-5 h-5" />
        Submit Results
      </button>
    </div>
  );
}
