'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', { email, password, redirect: false });

    if (result?.error) {
      setError('Invalid email or password.');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1e0545 0%, #060010 60%)' }}
    >
      {/* Glow orbs */}
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
            <h1 className="text-white text-xl font-bold">Welcome back</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(196,181,253,0.6)' }}>Sign in to your Stochos account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'rgba(196,181,253,0.7)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-purple-900 outline-none transition-all"
              style={{
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
              onFocus={(e) => (e.target.style.border = '1px solid rgba(124,58,237,0.6)')}
              onBlur={(e) => (e.target.style.border = '1px solid rgba(124,58,237,0.2)')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'rgba(196,181,253,0.7)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
              style={{
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
              onFocus={(e) => (e.target.style.border = '1px solid rgba(124,58,237,0.6)')}
              onBlur={(e) => (e.target.style.border = '1px solid rgba(124,58,237,0.2)')}
            />
          </div>

          {error && (
            <p className="text-xs text-center px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white mt-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              boxShadow: '0 0 24px rgba(124,58,237,0.4)',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs" style={{ color: 'rgba(196,181,253,0.5)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
