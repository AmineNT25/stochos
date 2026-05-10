'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Shield, Users, UserCheck, RefreshCw, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}

function getInitials(name?: string | null, email?: string) {
  if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  if (email) return email[0].toUpperCase();
  return '?';
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'admin';
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: isAdmin ? 'rgba(249,115,22,0.15)' : 'rgba(100,116,139,0.15)',
        color: isAdmin ? '#fb923c' : 'var(--muted-foreground)',
        border: `1px solid ${isAdmin ? 'rgba(249,115,22,0.3)' : 'rgba(100,116,139,0.2)'}`,
      }}
    >
      {isAdmin ? '🛡️ admin' : '👤 user'}
    </span>
  );
}

function ConfirmDelete({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Sure?</span>
      <button
        onClick={onConfirm}
        className="text-xs px-2 py-1 rounded-lg font-medium transition-all hover:opacity-80"
        style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
      >
        Delete
      </button>
      <button
        onClick={onCancel}
        className="text-xs px-2 py-1 rounded-lg font-medium transition-all hover:opacity-80"
        style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}
      >
        Cancel
      </button>
    </div>
  );
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/users');
    if (!res.ok) { setError('Failed to load users.'); setLoading(false); return; }
    const data = await res.json();
    setUsers(data.users);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleRole = async (user: AdminUser) => {
    setActionLoading(user.id);
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    }
    setActionLoading(null);
  };

  const deleteUser = async (id: string) => {
    setActionLoading(id);
    setConfirmDelete(null);
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== id));
    setActionLoading(null);
  };

  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const newThisMonth = users.filter(u => {
    const d = new Date(u.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: '#3b82f6' },
    { label: 'Admins', value: totalAdmins, icon: Shield, color: '#f97316' },
    { label: 'New This Month', value: newThisMonth, icon: UserCheck, color: '#22c55e' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}
          >
            <Shield className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="font-bold text-xl" style={{ color: 'var(--foreground)' }}>Admin Panel</h1>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Signed in as {session?.user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80 disabled:opacity-40"
          style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              {loading ? <span className="inline-block w-6 h-6 rounded bg-current opacity-10 animate-pulse" /> : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Registered Users</p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{users.length} total</p>
        </div>

        {error && (
          <div className="px-4 py-3 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.05)' }}>{error}</div>
        )}

        {loading ? (
          <div className="flex flex-col gap-0">
            {[1, 2, 3].map(i => (
              <div key={i} className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
                <div className="w-9 h-9 rounded-xl animate-pulse" style={{ background: 'var(--secondary)' }} />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="w-32 h-3 rounded animate-pulse" style={{ background: 'var(--secondary)' }} />
                  <div className="w-48 h-2.5 rounded animate-pulse" style={{ background: 'var(--secondary)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--muted-foreground)', background: 'var(--card)' }}>
            No users found.
          </div>
        ) : (
          <div>
            {users.map((user, idx) => {
              const isSelf = user.id === session?.user?.id;
              const busy = actionLoading === user.id;
              const isLast = idx === users.length - 1;

              return (
                <div
                  key={user.id}
                  className="px-4 py-3.5 flex items-center gap-3 transition-colors"
                  style={{
                    background: isSelf ? 'rgba(249,115,22,0.04)' : 'var(--card)',
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{
                      background: user.role === 'admin' ? 'rgba(249,115,22,0.2)' : 'rgba(100,116,139,0.15)',
                      color: user.role === 'admin' ? '#fb923c' : 'var(--muted-foreground)',
                      border: isSelf ? '2px solid #f97316' : '2px solid transparent',
                    }}
                  >
                    {getInitials(user.name, user.email)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                        {user.name ?? '—'}
                      </p>
                      {isSelf && (
                        <span className="text-orange-400 text-xs bg-orange-500/10 px-1.5 py-0.5 rounded-full">You</span>
                      )}
                      <RoleBadge role={user.role} />
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {user.email} · Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {confirmDelete === user.id ? (
                      <ConfirmDelete
                        onConfirm={() => deleteUser(user.id)}
                        onCancel={() => setConfirmDelete(null)}
                      />
                    ) : (
                      <>
                        {!isSelf && (
                          <>
                            <button
                              onClick={() => toggleRole(user)}
                              disabled={busy}
                              title={user.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 disabled:opacity-40"
                              style={{
                                background: user.role === 'admin' ? 'rgba(100,116,139,0.12)' : 'rgba(249,115,22,0.12)',
                                color: user.role === 'admin' ? 'var(--muted-foreground)' : '#fb923c',
                                border: `1px solid ${user.role === 'admin' ? 'rgba(100,116,139,0.2)' : 'rgba(249,115,22,0.25)'}`,
                              }}
                            >
                              {user.role === 'admin'
                                ? <><ChevronDown className="w-3 h-3" /> Demote</>
                                : <><ChevronUp className="w-3 h-3" /> Promote</>
                              }
                            </button>
                            <button
                              onClick={() => setConfirmDelete(user.id)}
                              disabled={busy}
                              title="Delete user"
                              className="p-1.5 rounded-lg transition-all hover:opacity-80 disabled:opacity-40"
                              style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
