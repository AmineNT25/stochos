'use client';

import { useState, useRef } from 'react';
import { Flame, Clock, Target, Award, TrendingUp, Pencil, X, Check, KeyRound, Camera, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getCompletedSessions, getBadges, getStreak, getTotalMinutes, getWeeklyMinutes } from '@/lib/storage';
import { SUBJECT_CONFIG } from '@/lib/data';
import type { Badge, CompletedSession } from '@/lib/types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

function getWeekData(sessions: CompletedSession[]) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    const dayMinutes = sessions
      .filter(s => new Date(s.date).toDateString() === dateStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    return { day: days[d.getDay()], minutes: dayMinutes, isToday: i === 6 };
  });
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div
      className="flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all"
      style={{
        background: badge.earned ? `${badge.color}10` : 'var(--card)',
        borderColor: badge.earned ? `${badge.color}40` : 'var(--border)',
        opacity: badge.earned ? 1 : 0.4,
      }}
    >
      <span className="text-2xl">{badge.emoji}</span>
      <div className="text-center">
        <p className="text-xs font-medium" style={{ color: badge.earned ? badge.color : 'var(--muted-foreground)' }}>
          {badge.name}
        </p>
        {badge.earned && badge.earnedDate && (
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {new Date(badge.earnedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );
}

function SessionHistoryItem({ session }: { session: CompletedSession }) {
  const cfg = SUBJECT_CONFIG[session.subject];
  const completionRate = session.goals.length > 0 ? session.completedGoalIds.length / session.goals.length : 1;
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: cfg.bg }}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{session.name}</p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{formatDuration(session.durationMinutes)}</p>
        <p className="text-xs" style={{ color: completionRate === 1 ? '#22c55e' : completionRate >= 0.5 ? '#f59e0b' : '#ef4444' }}>
          {Math.round(completionRate * 100)}%
        </p>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl px-3 py-2" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{formatDuration(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

function EditProfilePanel({ onClose }: { onClose: () => void }) {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const inputStyle = {
    background: 'var(--secondary)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const body: Record<string, string> = {};
    if (name.trim() !== session?.user?.name) body.name = name.trim();
    if (newPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword; }

    if (Object.keys(body).length === 0) {
      setMessage({ text: 'Nothing changed.', ok: true });
      setSaving(false);
      return;
    }

    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage({ text: data.error ?? 'Something went wrong.', ok: false });
    } else {
      if (body.name) await update({ name: body.name });
      setCurrentPassword('');
      setNewPassword('');
      setMessage({ text: 'Profile updated!', ok: true });
    }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl p-5 mb-6 flex flex-col gap-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Edit Profile</p>
        <button onClick={onClose} className="p-1 rounded-lg transition-colors hover:bg-white/10">
          <X className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
        </button>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Display name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
          style={inputStyle}
        />
      </div>

      {/* Email (read-only) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Email</label>
        <input
          type="email"
          value={session?.user?.email ?? ''}
          readOnly
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none opacity-50 cursor-not-allowed"
          style={inputStyle}
        />
      </div>

      {/* Change password toggle */}
      <button
        type="button"
        onClick={() => setShowPassword(p => !p)}
        className="flex items-center gap-2 text-xs font-medium transition-colors w-fit"
        style={{ color: showPassword ? '#f97316' : 'var(--muted-foreground)' }}
      >
        <KeyRound className="w-3.5 h-3.5" />
        {showPassword ? 'Hide password change' : 'Change password'}
      </button>

      {showPassword && (
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {message && (
        <p className="text-xs px-3 py-2 rounded-lg" style={{
          background: message.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          color: message.ok ? '#22c55e' : '#f87171',
          border: `1px solid ${message.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}>
          {message.text}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
      >
        <Check className="w-4 h-4" />
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const SIZE = 256;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d')!;
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function AvatarUpload({ initials }: { initials: string }) {
  const { data: session, update } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const base64 = await compressImage(file);
      const res = await fetch('/api/user/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Upload failed'); return; }
      await update({ image: base64 });
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const avatar = session?.user?.image;

  return (
    <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => !uploading && inputRef.current?.click()}>
      <div
        className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-xl"
        style={{
          background: avatar ? undefined : 'rgba(249,115,22,0.2)',
          border: '2px solid #f97316',
        }}
      >
        {avatar
          ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          : <span className="text-orange-400">{initials}</span>
        }
      </div>

      {/* Hover overlay */}
      <div
        className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'rgba(0,0,0,0.5)' }}
      >
        {uploading
          ? <Loader2 className="w-5 h-5 text-white animate-spin" />
          : <Camera className="w-5 h-5 text-white" />
        }
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {error && (
        <p className="absolute top-full mt-1 left-0 text-xs whitespace-nowrap" style={{ color: '#f87171' }}>{error}</p>
      )}
    </div>
  );
}

export default function Profile() {
  const { data: session } = useSession();
  const sessions = getCompletedSessions();
  const badges = getBadges();
  const streak = getStreak();
  const totalMinutes = getTotalMinutes();
  const weeklyMinutes = getWeeklyMinutes();
  const weekData = getWeekData(sessions);
  const earnedBadges = badges.filter(b => b.earned);
  const avgCompletion = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => {
        const r = s.goals.length > 0 ? s.completedGoalIds.length / s.goals.length : 1;
        return acc + r;
      }, 0) / sessions.length * 100)
    : 0;

  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'history'>('overview');
  const [editing, setEditing] = useState(false);

  const userName = session?.user?.name ?? 'User';
  const userEmail = session?.user?.email ?? '';
  const initials = getInitials(session?.user?.name);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6">
        <AvatarUpload initials={initials} />
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-xl truncate" style={{ color: 'var(--foreground)' }}>{userName}</h1>
          <p className="text-sm truncate" style={{ color: 'var(--muted-foreground)' }}>{userEmail}</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-orange-400 text-xs font-medium">{streak}d streak</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-medium">{earnedBadges.length} badges</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setEditing(e => !e)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95"
          style={{
            background: editing ? 'rgba(249,115,22,0.15)' : 'var(--secondary)',
            border: `1px solid ${editing ? 'rgba(249,115,22,0.4)' : 'var(--border)'}`,
            color: editing ? '#f97316' : 'var(--muted-foreground)',
          }}
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>

      {/* Edit panel */}
      {editing && <EditProfilePanel onClose={() => setEditing(false)} />}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Time', value: formatDuration(totalMinutes), icon: Clock, color: '#3b82f6' },
          { label: 'Sessions', value: sessions.length.toString(), icon: Target, color: '#22c55e' },
          { label: 'Completion', value: `${avgCompletion}%`, icon: TrendingUp, color: '#f97316' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
            <p className="font-bold text-base" style={{ color: 'var(--foreground)' }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {(['overview', 'badges', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer capitalize"
            style={{
              background: activeTab === tab ? '#f97316' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--muted-foreground)',
            }}
          >
            {tab === 'overview' ? '📊 Activity' : tab === 'badges' ? '🏅 Badges' : '📋 History'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>This week&apos;s focus time</p>
          <div className="rounded-2xl p-4 mb-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-end justify-between mb-2">
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Daily minutes</span>
              <span className="text-orange-400 text-xs font-medium">{formatDuration(weeklyMinutes)} this week</span>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={weekData} barSize={28}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                  {weekData.map((entry, index) => (
                    <Cell key={index} fill={entry.isToday ? '#f97316' : entry.minutes > 0 ? '#f9731660' : 'var(--secondary)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>By subject</p>
          <div className="flex flex-col gap-2">
            {Object.entries(SUBJECT_CONFIG).map(([key, cfg]) => {
              const subjectMins = sessions.filter(s => s.subject === key).reduce((acc, s) => acc + s.durationMinutes, 0);
              const pct = totalMinutes > 0 ? (subjectMins / totalMinutes) * 100 : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center">{cfg.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{cfg.label}</span>
                      <span className="text-xs" style={{ color: 'var(--foreground)' }}>{formatDuration(subjectMins)}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{earnedBadges.length}/{badges.length} earned</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {badges.map(badge => <BadgeCard key={badge.id} badge={badge} />)}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="rounded-2xl px-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {sessions.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
              <p className="text-sm">No sessions yet</p>
            </div>
          ) : sessions.map(session => <SessionHistoryItem key={session.id} session={session} />)}
        </div>
      )}
    </div>
  );
}
