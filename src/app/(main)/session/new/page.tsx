'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Dices, Zap, Clock } from 'lucide-react';
import { saveActiveSession } from '@/lib/storage';
import { DARES, PUNISHMENTS, SUBJECT_CONFIG, TIMER_METHOD_CONFIG } from '@/lib/data';
import type { SubjectType, TimerMethod, Goal, ActiveSession } from '@/lib/types';

function generateId(): string { return Math.random().toString(36).slice(2, 11); }
function getRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export default function SessionSetup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState<SubjectType>('work');
  const [timerMethod, setTimerMethod] = useState<TimerMethod>('pomodoro');
  const [customDuration, setCustomDuration] = useState(30);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [withDare, setWithDare] = useState(false);
  const [dare, setDare] = useState<string | null>(null);
  const [punishment, setPunishment] = useState<string | null>(null);
  const [goalInput, setGoalInput] = useState('');

  const handleAddGoal = () => {
    if (goalInput.trim()) {
      setGoals(prev => [...prev, { id: generateId(), text: goalInput.trim() }]);
      setGoalInput('');
    }
  };

  const handleToggleDare = () => {
    if (!withDare) { setDare(getRandom(DARES)); setPunishment(getRandom(PUNISHMENTS)); }
    else { setDare(null); setPunishment(null); }
    setWithDare(prev => !prev);
  };

  const handleStart = () => {
    const now = Date.now();
    const session: ActiveSession = {
      id: generateId(), name: name.trim() || 'Focus Session', subject, timerMethod,
      customDuration, goals: goals.filter(g => g.text.trim()), dare, punishment,
      startTime: now, pausedAt: null, totalPausedMs: 0,
      pomodoroPhase: 'work', pomodoroRound: 1, phaseStartTime: now,
    };
    saveActiveSession(session);
    router.push('/session/active');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.push('/')}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
        </button>
        <div>
          <h1 className="font-bold text-xl" style={{ color: 'var(--foreground)' }}>New Session</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Set your goals & get focused</p>
        </div>
      </div>

      {/* Session Name */}
      <div className="mb-6">
        <label className="text-sm block mb-2" style={{ color: 'var(--muted-foreground)' }}>Session Name</label>
        <input
          type="text"
          placeholder="e.g. Morning Grind, Study Blitz..."
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          onFocus={e => (e.target.style.borderColor = 'rgba(249,115,22,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      {/* Subject */}
      <div className="mb-6">
        <label className="text-sm block mb-2" style={{ color: 'var(--muted-foreground)' }}>Subject</label>
        <div className="grid grid-cols-4 gap-2">
          {(Object.entries(SUBJECT_CONFIG) as [SubjectType, typeof SUBJECT_CONFIG[string]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setSubject(key)}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all cursor-pointer"
              style={{
                background: subject === key ? cfg.bg : 'var(--card)',
                borderColor: subject === key ? cfg.color : 'var(--border)',
              }}
            >
              <span className="text-xl">{cfg.icon}</span>
              <span className="text-xs font-medium" style={{ color: subject === key ? cfg.color : 'var(--muted-foreground)' }}>
                {cfg.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Timer Method */}
      <div className="mb-6">
        <label className="text-sm block mb-2" style={{ color: 'var(--muted-foreground)' }}>Timer Method</label>
        <div className="flex flex-col gap-2">
          {(Object.entries(TIMER_METHOD_CONFIG) as [TimerMethod, typeof TIMER_METHOD_CONFIG[string]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setTimerMethod(key)}
              className="flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer"
              style={{
                background: timerMethod === key ? 'rgba(249,115,22,0.1)' : 'var(--card)',
                borderColor: timerMethod === key ? '#f97316' : 'var(--border)',
              }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: timerMethod === key ? 'rgba(249,115,22,0.2)' : 'var(--secondary)' }}>
                {key === 'pomodoro' ? '🍅' : key === 'deep-work' ? '🧠' : <Clock className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{cfg.label}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{cfg.description}</p>
              </div>
              <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all"
                style={{ borderColor: timerMethod === key ? '#f97316' : 'var(--border)', background: timerMethod === key ? '#f97316' : 'transparent' }} />
            </button>
          ))}
        </div>

        {timerMethod === 'custom' && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Duration</label>
              <span className="text-orange-400 font-bold text-sm">{customDuration} min</span>
            </div>
            <input type="range" min={5} max={180} step={5} value={customDuration}
              onChange={e => setCustomDuration(Number(e.target.value))}
              className="w-full accent-orange-500" />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              <span>5m</span><span>1h</span><span>3h</span>
            </div>
          </div>
        )}
      </div>

      {/* Goals */}
      <div className="mb-6">
        <label className="text-sm block mb-2" style={{ color: 'var(--muted-foreground)' }}>
          Goals <span style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>(what will you get done?)</span>
        </label>
        <div className="flex flex-col gap-2 mb-3">
          {goals.map((g, i) => (
            <div key={g.id} className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="w-5 h-5 rounded-full border border-orange-500/50 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-500 text-xs">{i + 1}</span>
              </div>
              <span className="text-sm flex-1 truncate" style={{ color: 'var(--foreground)' }}>{g.text}</span>
              <button onClick={() => setGoals(prev => prev.filter(x => x.id !== g.id))}
                className="hover:text-red-400 transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a goal..."
            value={goalInput}
            onChange={e => setGoalInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(249,115,22,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          <button onClick={handleAddGoal} disabled={!goalInput.trim()}
            className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center disabled:opacity-40 hover:bg-orange-400 transition-colors cursor-pointer">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Dare Toggle */}
      <div className="mb-8">
        <label className="text-sm block mb-2" style={{ color: 'var(--muted-foreground)' }}>
          Dares & Punishments <span style={{ opacity: 0.6 }}>(optional)</span>
        </label>
        <button onClick={handleToggleDare}
          className="w-full p-4 rounded-xl border transition-all text-left cursor-pointer"
          style={{ background: withDare ? 'rgba(168,85,247,0.1)' : 'var(--card)', borderColor: withDare ? '#a855f7' : 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">😈</span>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Enable Dare Mode</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Get a random dare + punishment if you fail</p>
              </div>
            </div>
            <div className="w-10 h-6 rounded-full transition-all flex items-center px-1"
              style={{ background: withDare ? '#a855f7' : 'var(--secondary)' }}>
              <div className="w-4 h-4 rounded-full bg-white transition-all"
                style={{ transform: withDare ? 'translateX(16px)' : 'translateX(0)' }} />
            </div>
          </div>
        </button>

        {withDare && dare && punishment && (
          <div className="mt-3 flex flex-col gap-2">
            <div className="p-3 rounded-xl border border-purple-500/30" style={{ background: 'rgba(100,0,160,0.1)' }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-purple-400 text-xs font-medium mb-1">🎯 YOUR DARE</p>
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>{dare}</p>
                </div>
                <button onClick={() => { setDare(getRandom(DARES)); setPunishment(getRandom(PUNISHMENTS)); }}
                  className="hover:text-purple-400 transition-colors flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                  <Dices className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-3 rounded-xl border border-red-500/30" style={{ background: 'rgba(160,0,0,0.1)' }}>
              <p className="text-red-400 text-xs font-medium mb-1">⚠️ PUNISHMENT IF YOU FAIL</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{punishment}</p>
            </div>
          </div>
        )}
      </div>

      <button onClick={handleStart}
        className="w-full py-4 rounded-2xl font-bold text-white transition-all cursor-pointer hover:opacity-90 flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
        <Zap className="w-5 h-5" fill="white" />
        Start Session
      </button>
    </div>
  );
}
