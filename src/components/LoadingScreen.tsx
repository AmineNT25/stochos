'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const duration = 2200;
    const interval = 30;
    const steps = duration / interval;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      // Ease-out curve: fast start, slow finish
      const raw = current / steps;
      const eased = 1 - Math.pow(1 - raw, 2);
      setProgress(Math.min(Math.round(eased * 100), 100));

      if (current >= steps) {
        clearInterval(timer);
        setFading(true);
        setTimeout(() => setHidden(true), 600);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  if (hidden) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-600"
      style={{
        background: '#060010',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease-out',
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      {/* Logo with glow */}
      <div className="relative mb-10">
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.6) 0%, transparent 70%)', transform: 'scale(1.8)' }}
        />
        <Image
          src="/logstochos.png"
          alt="Stochos"
          width={100}
          height={100}
          className="relative"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.8))',
            animation: 'pulse 2s ease-in-out infinite',
          }}
          priority
        />
      </div>

      {/* App name */}
      <p className="text-white text-2xl font-bold tracking-widest mb-8 uppercase">
        Stochos
      </p>

      {/* Progress bar */}
      <div className="w-56 flex flex-col items-center gap-2">
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(124,58,237,0.2)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
              transition: 'width 0.03s linear',
              boxShadow: '0 0 8px rgba(167,139,250,0.8)',
            }}
          />
        </div>
        <span className="text-xs font-mono" style={{ color: 'rgba(167,139,250,0.7)' }}>
          {progress}%
        </span>
      </div>
    </div>
  );
}
