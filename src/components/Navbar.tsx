'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, User, Zap, Shield, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/leaderboard', label: 'Compete', icon: Users },
  { to: '/profile', label: 'Profile', icon: User },
];

function getInitials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const loading = status === 'loading';
  const userName = session?.user?.name ?? '';
  const initials = getInitials(session?.user?.name);
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';
  const avatarImage = session?.user?.image;

  const isActive = (to: string) => to === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(to);

  return (
    <>
      {/* Sidebar for desktop */}
      <aside
        className="hidden md:flex flex-col w-16 lg:w-56 min-h-screen py-6 px-2 lg:px-4 flex-shrink-0"
        style={{ background: 'var(--nav-bg)', borderRight: '1px solid var(--nav-border)' }}
      >
        <div className="flex items-center gap-2 mb-10 px-1">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="hidden lg:block font-bold text-lg tracking-tight" style={{ color: 'var(--foreground)' }}>
            Stochos
          </span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                href={to}
                className="flex items-center gap-3 px-2 py-3 rounded-xl transition-all"
                style={{
                  background: active ? 'rgba(249,115,22,0.2)' : 'transparent',
                  color: active ? '#fb923c' : 'var(--muted-foreground)',
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'var(--foreground)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-orange-400' : ''}`} />
                <span className="hidden lg:block text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin link */}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-2 py-3 rounded-xl transition-all mt-1"
            style={{
              background: isActive('/admin') ? 'rgba(249,115,22,0.2)' : 'transparent',
              color: isActive('/admin') ? '#fb923c' : 'var(--muted-foreground)',
            }}
            onMouseEnter={e => { if (!isActive('/admin')) { (e.currentTarget as HTMLElement).style.color = 'var(--foreground)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; } }}
            onMouseLeave={e => { if (!isActive('/admin')) { (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
          >
            <Shield className={`w-5 h-5 flex-shrink-0 ${isActive('/admin') ? 'text-orange-400' : ''}`} />
            <span className="hidden lg:block text-sm font-medium">Admin</span>
          </Link>
        )}

        <div className="mt-auto flex flex-col items-center lg:items-start gap-3">
          <ThemeToggle />
          <Link href="/profile" className="flex items-center gap-2 group">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-orange-500/30 border-2 border-orange-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {loading
                ? <span className="w-3 h-3 rounded-full bg-orange-400/40 animate-pulse" />
                : avatarImage
                  ? <img src={avatarImage} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-orange-400 text-xs font-bold">{initials}</span>
              }
            </div>
            {!loading && userName && (
              <span className="hidden lg:block text-sm font-medium truncate max-w-[100px] group-hover:text-orange-400 transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                {userName}
              </span>
            )}
            {loading && (
              <div className="hidden lg:block w-16 h-3.5 rounded-full animate-pulse" style={{ background: 'var(--secondary)' }} />
            )}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="flex items-center gap-3 px-2 py-2 rounded-xl transition-all w-full"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:block text-sm font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Bottom bar for mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-4 py-2"
        style={{ background: 'var(--nav-bg)', borderTop: '1px solid var(--nav-border)' }}
      >
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              href={to}
              className="flex flex-col items-center gap-0.5 py-1 px-3 transition-all"
              style={{ color: active ? '#fb923c' : 'var(--muted-foreground)' }}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-orange-400' : ''}`} />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex flex-col items-center gap-0.5 py-1 px-3 transition-all"
            style={{ color: isActive('/admin') ? '#fb923c' : 'var(--muted-foreground)' }}
          >
            <Shield className={`w-5 h-5 ${isActive('/admin') ? 'text-orange-400' : ''}`} />
            <span className="text-[10px]">Admin</span>
          </Link>
        )}
        <ThemeToggle />
        <button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className="flex flex-col items-center gap-0.5 py-1 px-3 transition-all"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px]">Sign out</span>
        </button>
      </nav>
    </>
  );
}
