'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Pause, Play, StopCircle, Coffee, Utensils, Toilet, AlertTriangle } from 'lucide-react';
import { getActiveSession, saveActiveSession, clearActiveSession } from '@/lib/storage';
import { SUBJECT_CONFIG } from '@/lib/data';
import type { ActiveSession, PomodoroPhase } from '@/lib/types';

const POMODORO_WORK_SECS = 25 * 60;
const POMODORO_SHORT_BREAK_SECS = 5 * 60;
const POMODORO_LONG_BREAK_SECS = 15 * 60;

function getPhaseDuration(phase: PomodoroPhase): number {
  if (phase === 'work') return POMODORO_WORK_SECS;
  if (phase === 'short-break') return POMODORO_SHORT_BREAK_SECS;
  return POMODORO_LONG_BREAK_SECS;
}

function formatTime(secs: number): string {
  const m = Math.floor(Math.abs(secs) / 60).toString().padStart(2, '0');
  const s = (Math.abs(secs) % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function CircularTimer({ progress, timeDisplay, phase, timerMethod }: {
  progress: number; timeDisplay: string; phase: PomodoroPhase; timerMethod: string;
}) {
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));
  const phaseColor = timerMethod === 'pomodoro' ? (phase === 'work' ? '#f97316' : '#22c55e') : '#f97316';
  const phaseGlow = timerMethod === 'pomodoro' ? (phase === 'work' ? 'rgba(249,115,22,0.3)' : 'rgba(34,197,94,0.3)') : 'rgba(249,115,22,0.3)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
      <div className="absolute rounded-full transition-all duration-1000"
        style={{ width: 220, height: 220, background: phaseGlow, filter: 'blur(40px)', opacity: 0.6 }} />
      <svg width={280} height={280} className="absolute" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={140} cy={140} r={radius} fill="none" stroke="var(--border)" strokeWidth={10} />
        <circle cx={140} cy={140} r={radius} fill="none" stroke={phaseColor} strokeWidth={10}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }} />
      </svg>
      <div className="relative text-center z-10">
        <p className="font-mono font-bold" style={{ fontSize: 52, lineHeight: 1, letterSpacing: '-2px', color: 'var(--foreground)' }}>{timeDisplay}</p>
        {timerMethod === 'pomodoro' && (
          <p className="text-sm mt-1 font-medium capitalize" style={{ color: phaseColor }}>
            {phase === 'work' ? '🍅 Focus' : phase === 'short-break' ? '☕ Short Break' : '🌿 Long Break'}
          </p>
        )}
      </div>
    </div>
  );
}

const PAUSE_REASONS = [
  { icon: Toilet, label: 'Restroom' },
  { icon: Utensils, label: 'Eating' },
  { icon: Coffee, label: 'Drink' },
  { icon: AlertTriangle, label: 'Emergency' },
];

export default function ActiveSessionPage() {
  const router = useRouter();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [now, setNow] = useState(Date.now());
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [phaseComplete, setPhaseComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const s = getActiveSession();
    if (!s) { router.push('/session/new'); return; }
    setSession(s);
  }, [router]);

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(Date.now()), 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const isPaused = session?.pausedAt != null;

  const getElapsedInPhase = useCallback(() => {
    if (!session) return 0;
    const pauseOffset = isPaused ? now - session.pausedAt! + session.totalPausedMs : session.totalPausedMs;
    return Math.floor((now - session.phaseStartTime - pauseOffset) / 1000);
  }, [session, now, isPaused]);

  const getPhaseInfo = useCallback(() => {
    if (!session) return { remaining: 0, progress: 0, totalSecs: 0 };
    if (session.timerMethod === 'pomodoro') {
      const totalSecs = getPhaseDuration(session.pomodoroPhase);
      const elapsed = getElapsedInPhase();
      return { remaining: totalSecs - elapsed, progress: 1 - elapsed / totalSecs, totalSecs };
    } else {
      const totalSecs = (session.timerMethod === 'deep-work' ? 90 : session.customDuration) * 60;
      const elapsed = getElapsedInPhase();
      return { remaining: totalSecs - elapsed, progress: 1 - elapsed / totalSecs, totalSecs };
    }
  }, [session, getElapsedInPhase]);

  useEffect(() => {
    if (!session || isPaused) return;
    const { remaining } = getPhaseInfo();
    if (remaining <= 0 && !phaseComplete) {
      setPhaseComplete(true);
      if (session.timerMethod === 'pomodoro') {
        setTimeout(() => {
          setSession(prev => {
            if (!prev) return prev;
            let nextPhase: PomodoroPhase;
            let nextRound = prev.pomodoroRound;
            if (prev.pomodoroPhase === 'work') {
              nextPhase = prev.pomodoroRound >= 4 ? 'long-break' : 'short-break';
              if (prev.pomodoroRound >= 4) nextRound = 1;
            } else {
              nextPhase = 'work';
              if (prev.pomodoroPhase === 'short-break') nextRound = prev.pomodoroRound + 1;
            }
            const updated: ActiveSession = { ...prev, pomodoroPhase: nextPhase, pomodoroRound: nextRound, phaseStartTime: Date.now(), totalPausedMs: 0 };
            saveActiveSession(updated);
            return updated;
          });
          setPhaseComplete(false);
        }, 2000);
      } else {
        setTimeout(() => router.push('/session/review'), 1500);
      }
    }
  }, [session, isPaused, getPhaseInfo, phaseComplete, router]);

  const handlePause = () => {
    if (!session) return;
    const updated = { ...session, pausedAt: Date.now() };
    saveActiveSession(updated);
    setSession(updated);
    setShowPauseModal(false);
  };

  const handleResume = () => {
    if (!session || !session.pausedAt) return;
    const updated = { ...session, pausedAt: null, totalPausedMs: session.totalPausedMs + (Date.now() - session.pausedAt) };
    saveActiveSession(updated);
    setSession(updated);
  };

  if (!session) return null;

  const { remaining, progress } = getPhaseInfo();
  const subjectCfg = SUBJECT_CONFIG[session.subject];
  const totalPausedOffset = isPaused ? now - session.pausedAt! + session.totalPausedMs : session.totalPausedMs;
  const totalElapsedMins = Math.floor((now - session.startTime - totalPausedOffset) / 60000);
  const pomodoroRounds = session.timerMethod === 'pomodoro' ? Array.from({ length: 4 }, (_, i) => i + 1) : [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-8 px-4 relative overflow-hidden"
      style={{ background: 'var(--background)' }}>
      <div className="absolute inset-0 opacity-5"
        style={{ background: `radial-gradient(circle at 50% 30%, ${subjectCfg.color}, transparent 60%)` }} />

      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{subjectCfg.icon}</span>
            <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{session.name || 'Focus Session'}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full px-3 py-1" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{totalElapsedMins}m elapsed</span>
          </div>
        </div>
        {session.timerMethod === 'pomodoro' && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1.5">
              {pomodoroRounds.map(r => (
                <div key={r} className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: r < session.pomodoroRound || (r === session.pomodoroRound && session.pomodoroPhase === 'work') ? '#f97316' : 'var(--border)',
                    border: r === session.pomodoroRound ? '1.5px solid #f97316' : '1.5px solid var(--secondary)',
                  }} />
              ))}
            </div>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Round {session.pomodoroRound}/4</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-6">
        <CircularTimer progress={progress} timeDisplay={formatTime(Math.max(0, remaining))}
          phase={session.pomodoroPhase} timerMethod={session.timerMethod} />
        {phaseComplete && (
          <div className="text-center animate-bounce">
            <p className="text-green-400 font-bold text-lg">
              {session.timerMethod === 'pomodoro' ? '🎉 Phase Complete!' : '🎉 Session Done!'}
            </p>
          </div>
        )}
        {isPaused && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-4 py-2 text-center">
            <p className="text-yellow-400 text-sm font-medium">⏸ Session paused</p>
            <p className="text-yellow-400/60 text-xs">Emergency break — come back soon!</p>
          </div>
        )}
      </div>

      {session.goals.length > 0 && (
        <div className="w-full max-w-sm">
          <p className="text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Your Goals</p>
          <div className="flex flex-col gap-1.5">
            {session.goals.map(g => (
              <div key={g.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="w-4 h-4 rounded-full border flex-shrink-0" style={{ borderColor: 'var(--muted-foreground)' }} />
                <span className="text-sm" style={{ color: 'var(--foreground)' }}>{g.text}</span>
              </div>
            ))}
          </div>
          {session.dare && (
            <div className="mt-2 px-3 py-2 rounded-xl border border-purple-500/30 bg-purple-500/5">
              <p className="text-purple-400 text-xs">😈 Dare: {session.dare}</p>
            </div>
          )}
        </div>
      )}

      <div className="w-full max-w-sm flex flex-col gap-3">
        {isPaused ? (
          <button onClick={handleResume}
            className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
            <Play className="w-5 h-5" fill="white" />
            Resume Session
          </button>
        ) : (
          <button onClick={() => setShowPauseModal(true)}
            className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all text-yellow-400"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <Pause className="w-5 h-5" />
            Emergency Pause
          </button>
        )}
        <button onClick={() => setShowStopModal(true)}
          className="w-full py-3 rounded-2xl font-medium flex items-center justify-center gap-2 cursor-pointer transition-all border border-transparent hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400"
          style={{ color: 'var(--muted-foreground)' }}>
          <StopCircle className="w-4 h-4" />
          End Session
        </button>
      </div>

      {showPauseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--foreground)' }}>Emergency Pause</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>Only pause for real emergencies. What do you need?</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PAUSE_REASONS.map(({ icon: Icon, label }) => (
                <button key={label} onClick={handlePause}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer transition-all hover:opacity-80"
                  style={{ background: 'var(--secondary)' }}>
                  <Icon className="w-6 h-6 text-yellow-400" />
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>{label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowPauseModal(false)}
              className="w-full py-3 rounded-xl cursor-pointer transition-colors hover:opacity-80"
              style={{ color: 'var(--muted-foreground)' }}>
              Cancel — stay focused!
            </button>
          </div>
        </div>
      )}

      {showStopModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="text-center mb-5">
              <span className="text-4xl block mb-2">⚠️</span>
              <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--foreground)' }}>End Session Early?</h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>You&apos;ll still review your goals and mark what you completed.</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => router.push('/session/review')}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-medium transition-all cursor-pointer">
                End & Review Goals
              </button>
              <button onClick={() => { clearActiveSession(); router.push('/'); }}
                className="w-full py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all cursor-pointer text-sm">
                Abandon (no review)
              </button>
              <button onClick={() => setShowStopModal(false)}
                className="w-full py-3 rounded-xl cursor-pointer transition-colors hover:opacity-80"
                style={{ color: 'var(--muted-foreground)' }}>
                Keep going!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
