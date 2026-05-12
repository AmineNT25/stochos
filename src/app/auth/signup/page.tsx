'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailConflict, setEmailConflict] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailConflict(false);
    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 409) {
        setEmailConflict(true);
        setError('This email is already registered. Please sign in or use a different email.');
      } else {
        setError(data.error || 'Registration failed.');
      }
      setLoading(false);
    } else {
      router.push('/auth/signin?registered=1');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1e0545 0%, #060010 60%)' }}
    >
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(124,58,237,0.15)' }} />

      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col gap-6"
        style={{
          background: 'rgba(12,4,30,0.85)',
          border: '1px solid rgba(124,58,237,0.25)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 60px rgba(124,58,237,0.1)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <Image src="/logstochos.png" alt="Stochos" width={52} height={52} style={{ filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.8))' }} />
          <div className="text-center">
            <h1 className="text-white text-xl font-bold">Create account</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(196,181,253,0.6)' }}>Join Stochos and start tracking</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'rgba(196,181,253,0.7)' }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
              onFocus={(e) => (e.target.style.border = '1px solid rgba(124,58,237,0.6)')}
              onBlur={(e) => (e.target.style.border = '1px solid rgba(124,58,237,0.2)')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'rgba(196,181,253,0.7)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-purple-900 outline-none transition-all"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
              onFocus={(e) => (e.target.style.border = '1px solid rgba(124,58,237,0.6)')}
              onBlur={(e) => (e.target.style.border = '1px solid rgba(124,58,237,0.2)')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'rgba(196,181,253,0.7)' }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className="w-full px-4 py-3 pr-11 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
                onFocus={(e) => (e.target.style.border = '1px solid rgba(124,58,237,0.6)')}
                onBlur={(e) => (e.target.style.border = '1px solid rgba(124,58,237,0.2)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'rgba(196,181,253,0.5)' }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex flex-col gap-1.5 px-3 py-2 rounded-lg text-xs text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ color: '#f87171' }}>{error}</p>
              {emailConflict && (
                <Link href="/auth/signin" className="font-medium transition-colors" style={{ color: '#c084fc' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#e9d5ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#c084fc')}
                >
                  Sign in instead →
                </Link>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white mt-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 24px rgba(124,58,237,0.4)' }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs" style={{ color: 'rgba(196,181,253,0.5)' }}>
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
