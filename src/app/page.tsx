'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false });

export default function LandingPage() {
  return (
    <>
      <LoadingScreen />
      <ThreeBackground />

      <main className="min-h-screen flex flex-col items-center justify-center relative z-10 px-4">
        {/* Center card */}
        <div className="flex flex-col items-center text-center gap-8 max-w-lg w-full">
          {/* Logo */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%)', transform: 'scale(2)' }}
            />
            <Image
              src="/logstochos.png"
              alt="Stochos"
              width={88}
              height={88}
              className="relative"
              style={{ filter: 'drop-shadow(0 0 24px rgba(139,92,246,0.9))' }}
              priority
            />
          </div>

          {/* Title */}
          <div>
            <h1
              className="text-6xl font-black tracking-tight mb-3"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 60%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              STOCHOS
            </h1>
            <p className="text-lg" style={{ color: 'rgba(196,181,253,0.75)' }}>
              Master your focus. Build your streak.
            </p>
          </div>

          {/* Stats strip */}
          <div
            className="flex items-center gap-6 px-6 py-3 rounded-full text-sm"
            style={{
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.25)',
              color: 'rgba(196,181,253,0.65)',
            }}
          >
            <span>⚡ Focus sessions</span>
            <span className="w-px h-4" style={{ background: 'rgba(124,58,237,0.3)' }} />
            <span>🏆 Leaderboards</span>
            <span className="w-px h-4" style={{ background: 'rgba(124,58,237,0.3)' }} />
            <span>🎯 Goal tracking</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 w-full max-w-xs">
            <Link href="/auth/signin" className="flex-1">
              <button
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  boxShadow: '0 0 24px rgba(124,58,237,0.5), 0 4px 16px rgba(0,0,0,0.4)',
                }}
              >
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup" className="flex-1">
              <button
                className="w-full py-3.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(124,58,237,0.6)',
                  color: '#a78bfa',
                  boxShadow: '0 0 16px rgba(124,58,237,0.15)',
                }}
              >
                Sign Up
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom footer */}
        <p
          className="absolute bottom-6 text-xs"
          style={{ color: 'rgba(124,58,237,0.4)' }}
        >
          © {new Date().getFullYear()} Stochos — All rights reserved
        </p>
      </main>
    </>
  );
}
