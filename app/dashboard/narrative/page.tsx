import Link from 'next/link';
import { redirect } from 'next/navigation';

import {
  GradientBadge,
  GradientButton,
  LightDashboardFrame,
  PageHeader,
  SectionLabel,
} from '@/components/dashboard/LightDashboardPrimitives';
import DashboardShell from '@/components/layout/DashboardShell';
import { storedAnalysisToNarrative } from '@/lib/narrative/mock';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = "force-dynamic";

export default async function MyNarrativePage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) redirect('/login');

  const { data: latestAnalysisData } = await (supabase.from('analyses') as any)
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const analysis = latestAnalysisData ? storedAnalysisToNarrative(latestAnalysisData) : null;

  if (!analysis) {
    return (
      <DashboardShell>
        <LightDashboardFrame maxWidth="720px">
          <div className="flex min-h-[620px] flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-[10px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)', animation: 'pulse-diamond 1.8s ease-in-out infinite' }} />
            <h1 className="mt-8 font-serif text-2xl font-semibold text-black">Your narrative is waiting.</h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
              Generate once to unlock archetype, score, signals, gap, and admissions impact.
            </p>
            <GradientButton href="/analysis/loading" className="mt-8">Generate My Narrative →</GradientButton>
          </div>
        </LightDashboardFrame>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <LightDashboardFrame maxWidth="720px">
        <PageHeader
          before="Your "
          gradient="narrative"
          subtext="This is the story your application is currently telling."
        />

        <section className="gradient-border-card glass-card p-8">
          <div className="grid gap-8 sm:grid-cols-[1fr_140px] sm:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Your Archetype</p>
              <h2 className="mt-4 font-serif text-[40px] font-semibold leading-none tracking-[-0.04em] gradient-text">
                {analysis.archetype}
              </h2>
              <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                {analysis.archetype} profiles are defined by the pattern of proof, focus, and momentum behind their activities.
              </p>
            </div>
            <ScoreRing score={analysis.score} />
          </div>
        </section>

        <section className="glass-card relative mt-4 overflow-hidden p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Your Narrative</p>
          <span className="pointer-events-none absolute left-6 top-10 font-serif text-[120px] leading-none opacity-[0.08] gradient-text">“</span>
          <p className="relative mt-6 pl-8 font-serif text-lg italic leading-[1.8] text-black">
            {analysis.narrative}
          </p>
          <div className="mt-6 pl-8">
            <GradientBadge>{analysis.archetype}</GradientBadge>
          </div>
        </section>

        <section className="mt-4">
          <SectionLabel>Key Signals</SectionLabel>
          <div className="mt-4 grid gap-2">
            {analysis.signals.slice(0, 3).map((signal) => (
              <div key={signal.label} className="glass-card border-l-[3px] border-l-transparent bg-[linear-gradient(white,white)_padding-box,linear-gradient(180deg,#667eea,#f64f59,#12c2e9)_border-box] px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-black">{signal.label}</p>
                  <span className="gradient-text text-sm font-bold">✓</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="gradient-border-card mt-4 p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Story Gap</p>
          <p className="mt-3 text-[15px] font-medium leading-7 text-black">{analysis.gap.summary}</p>
          <p className="mt-3 text-[13px] italic text-[var(--text-muted)]">Upgrade to Pro to get the exact plan to close this gap</p>
        </section>

        <section className="glass-card relative mt-4 overflow-hidden p-8 text-center">
          <div className="absolute inset-0 backdrop-blur-[8px]" />
          <div className="relative z-10 mx-auto max-w-sm">
            <span className="gradient-border-card mx-auto inline-flex px-3 py-1 text-xs font-bold">
              <span className="relative z-10 gradient-text">Pro</span>
            </span>
            <p className="mt-4 text-sm font-medium text-[var(--text-secondary)]">Unlock your full score breakdown</p>
            <GradientButton href="/pricing" className="mt-6">Upgrade to Pro →</GradientButton>
          </div>
          <div className="mt-8 grid gap-3 opacity-35">
            {['Activity Depth', 'External Validation', 'Leadership Signal', 'Major Alignment', 'Narrative Focus'].map((label, index) => (
              <div key={label} className="grid grid-cols-[1fr_40px] items-center gap-3 text-left">
                <span className="text-sm text-black">{label}</span>
                <span className="text-right text-xs text-[var(--text-muted)]">{12 + index}/20</span>
              </div>
            ))}
          </div>
        </section>

        <Link href="/analysis/loading" className="mt-6 inline-flex gradient-text text-sm font-semibold">
          Regenerate narrative →
        </Link>
      </LightDashboardFrame>
    </DashboardShell>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="grid justify-items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="narrativeRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="50%" stopColor="#f64f59" />
            <stop offset="100%" stopColor="#12c2e9" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#e5e5e5" strokeWidth="4" />
        <circle cx="60" cy="60" r={radius} fill="transparent" stroke="url(#narrativeRingGradient)" strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="animate-ring" transform="rotate(-90 60 60)" />
        <text x="60" y="64" textAnchor="middle" className="fill-black font-serif text-[40px] font-semibold">{score}</text>
      </svg>
      <p className="mt-2 text-xs font-medium text-[var(--text-muted)]">out of 100</p>
    </div>
  );
}
