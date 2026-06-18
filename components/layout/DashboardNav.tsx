'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ComponentType } from 'react';
import {
  BookOpenText,
  CreditCard,
  FileText,
  Home,
  Layers3,
  Lock,
  Map,
  Play,
  School,
  Settings,
  Trophy,
  UsersRound,
  WandSparkles,
} from 'lucide-react';

import { supabaseClient } from '@/lib/supabase/client';

const freeLinks = [
  { label: 'Generate', href: '/analysis/loading', icon: WandSparkles },
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'My Narrative', href: '/dashboard/narrative', icon: BookOpenText },
  { label: 'Activities', href: '/dashboard/activities', icon: Layers3 },
  { label: 'Schools', href: '/dashboard/schools', icon: School },
  { label: 'Honors', href: '/dashboard/honors', icon: Trophy },
  { label: 'Essays', href: '/dashboard/essays', icon: FileText },
];

const proLinks = [
  { label: 'Pricing', href: '/pricing', icon: CreditCard },
  { label: 'Narrative Roadmap', href: '/dashboard/roadmap', icon: Map },
  { label: 'Peer Benchmarks', href: '/dashboard/peer-benchmarks', icon: UsersRound },
  { label: 'Admissions Simulator', href: '/dashboard/admissions-simulator', icon: Play },
];

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  label,
  href,
  icon: Icon,
  compact = false,
  pro = false,
}: {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  compact?: boolean;
  pro?: boolean;
}) {
  const pathname = usePathname();
  const active = isActive(pathname, href);
  const DisplayIcon = pro ? Lock : Icon;

  return (
    <Link
      href={href}
      className={`group relative flex h-9 items-center gap-2.5 rounded-lg px-4 text-sm font-medium transition duration-200 ${
        compact ? 'shrink-0' : ''
      } ${active ? 'bg-[var(--bg-secondary)] text-black' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-black'}`}
    >
      {active ? <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-[linear-gradient(180deg,#667eea,#f64f59,#12c2e9)]" /> : null}
      <DisplayIcon className="h-4 w-4" />
      <span className="truncate">{label}</span>
      {pro ? (
        <span className="gradient-border-card ml-auto inline-flex px-2 py-0.5 text-[10px] font-bold">
          <span className="relative z-10 gradient-text">Pro</span>
        </span>
      ) : null}
    </Link>
  );
}

export function SidebarNav() {
  return (
    <div className="flex h-[calc(100%-152px)] flex-col px-3 pt-6">
      <nav className="space-y-1">
        {freeLinks.map((link) => (
          <NavLink key={link.href} {...link} />
        ))}
      </nav>

      <div className="my-5 h-px bg-[#f5f5f5]" />

      <p className="mb-2 px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Pro Features</p>
      <nav className="space-y-1">
        {proLinks.map((link) => (
          <NavLink key={link.href} {...link} pro />
        ))}
      </nav>
    </div>
  );
}

export function MobileDashboardNav() {
  return (
    <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {[...freeLinks, ...proLinks].map((link) => (
        <NavLink key={link.href} {...link} compact pro={proLinks.some((item) => item.href === link.href)} />
      ))}
    </nav>
  );
}

export function SidebarUserArea() {
  const [user, setUser] = useState<{ name: string; email: string }>({ name: 'Spikd user', email: 'Signed in' });

  useEffect(() => {
    let cancelled = false;
    supabaseClient.auth.getUser().then(({ data }) => {
      if (cancelled || !data.user) return;
      const name = typeof data.user.user_metadata?.full_name === 'string'
        ? data.user.user_metadata.full_name
        : data.user.email?.split('@')[0] || 'Spikd user';
      setUser({ name, email: data.user.email || 'Signed in' });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const logout = async () => {
    await supabaseClient.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 border-t border-[#f5f5f5] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#667eea,#f64f59)] text-sm font-medium text-white">
          {initials || 'S'}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-black">{user.name}</p>
          <p className="truncate text-[11px] text-[var(--text-muted)]">{user.email}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Link href="/dashboard/settings" className="text-xs font-medium text-[var(--text-secondary)] transition hover:text-black">
          Settings
        </Link>
        <button type="button" onClick={logout} className="text-xs font-medium text-[var(--text-secondary)] transition hover:text-black">
          Log out
        </button>
      </div>
    </div>
  );
}
