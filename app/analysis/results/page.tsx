import Link from 'next/link';
import { redirect } from 'next/navigation';

import { GradientBadge, GradientButton, GlassButton, LightDashboardFrame, SectionLabel } from '@/components/dashboard/LightDashboardPrimitives';
import { mockNarrativeAnalysis, storedAnalysisToNarrative } from '@/lib/narrative/mock';
import { PRO_PRICE_LABEL } from '@/lib/pricing';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = "force-dynamic";

export default async function AnalysisResultsPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect('/login');
  }

  const { data: latestAnalysisData } = await (supabase.from('analyses') as any)
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const analysis = latestAnalysisData
    ? storedAnalysisToNarrative(latestAnalysisData)
    : mockNarrativeAnalysis;
  const usedFallback = !latestAnalysisData;

  return (
    <LightDashboardFrame maxWidth="600px">
      <div className="pb-16">
        <header className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Generated</p>
          <h1 className="mt-4 font-serif text-[32px] font-semibold tracking-[-0.03em] text-black">
            Your <span className="gradient-text">spike</span> is taking shape.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-[var(--text-secondary)]">
            This is the story your application is currently telling, compressed into the signals that matter most.
          </p>
        </header>

        {usedFallback ? (
          <div className="mt-8 rounded-[10px] bg-[#fffbeb] px-4 py-3 text-[13px] font-medium leading-6 text-[#92400e]">
            We could not find a saved result, so this page is showing the sample Spikd result.
          </div>
        ) : null}

        <section className="gradient-border-card mt-8">
          <div className="glass-card relative z-10 p-8 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Your College Story Archetype</p>
            <h2 className="mt-5 font-serif text-5xl font-semibold tracking-[-0.04em]">
              <span className="gradient-text">{analysis.archetype}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-[var(--text-secondary)]">
              {analysis.archetypeDetails.description}
            </p>
            <div className="my-7 h-px bg-[var(--border)]" />
            <p className="mx-auto max-w-md text-sm leading-7 text-[var(--text-secondary)]">
              You do not just list experiences. You are building a recognizable proof pattern around {analysis.signals[0]?.label || 'your strongest signal'}.
            </p>
          </div>
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-3">
          <RevealMetric label="Narrative Score" value={String(analysis.score)} ring />
          <RevealMetric label="Archetype" value={analysis.archetype} gradient />
          <RevealMetric label="Potential Score" value={String(analysis.potentialScore)} />
        </section>

        <section className="glass-card relative mt-4 overflow-hidden p-8">
          <span className="pointer-events-none absolute left-5 top-0 font-serif text-[120px] leading-none opacity-[0.08]">
            <span className="gradient-text">“</span>
          </span>
          <SectionLabel>Your Narrative</SectionLabel>
          <p className="relative z-10 mt-6 pl-4 font-serif text-lg italic leading-[1.8] text-black">
            {analysis.narrative}
          </p>
        </section>

        <section className="mt-4">
          <SectionLabel>Key Signals</SectionLabel>
          <div className="mt-4 grid gap-2">
            {analysis.signals.slice(0, 3).map((signal) => (
              <div key={signal.label} className="glass-card border-l-[3px] border-l-transparent p-4" style={{ borderLeftColor: '#f64f59' }}>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-black">{signal.label}</p>
                  <span className="gradient-text text-sm font-bold">✓</span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">{signal.evidence}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="gradient-border-card mt-4">
          <div className="glass-card relative z-10 p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Story Gap</p>
            <p className="mt-3 text-[15px] font-semibold leading-7 text-black">{analysis.gap.label}</p>
            <p className="mt-2 text-[13px] italic leading-6 text-[var(--text-muted)]">
              Upgrade to Pro to get the exact action plan to close this gap.
            </p>
          </div>
        </section>

        <section className="glass-card mt-4 p-6">
          <SectionLabel>Share Your Story</SectionLabel>
          <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">Share your archetype and narrative with friends.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <GlassButton href="/analysis/results">Copy story link</GlassButton>
            <GlassButton href="/analysis/results">View story card</GlassButton>
          </div>
          <div className="gradient-border-card mx-auto mt-6 w-[200px]">
            <div className="relative z-10 rounded-[16px] bg-white p-5 text-center">
              <p className="font-serif text-xl font-semibold"><span className="gradient-text">{analysis.archetype}</span></p>
              <p className="mt-2 font-serif text-4xl font-semibold text-black">{analysis.score}</p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Spikd</p>
            </div>
          </div>
        </section>

        <section className="gradient-border-card mt-4">
          <div className="glass-card relative z-10 p-8">
            <h2 className="font-serif text-[22px] font-semibold tracking-[-0.02em] text-black">
              Unlock your full <span className="gradient-text">spike strategy</span>.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Get your monthly roadmap, proof score, peer matches, and spike tracker.
            </p>
            <div className="mt-6 grid gap-3">
              {['Narrative Roadmap', 'Proof Score', 'Peer Benchmarks'].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm font-semibold text-black">
                  <span className="h-3 w-3 rounded-[3px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)' }} />
                  {feature}
                </div>
              ))}
            </div>
            <GradientButton href="/pricing" className="mt-8 w-full">Upgrade to Pro — {PRO_PRICE_LABEL} →</GradientButton>
          </div>
        </section>

        <div className="mt-8 flex justify-center">
          <GradientBadge>
            <Link href="/dashboard">Back to dashboard</Link>
          </GradientBadge>
        </div>
      </div>
    </LightDashboardFrame>
  );
}

function RevealMetric({
  label,
  value,
  gradient,
  ring,
}: {
  label: string;
  value: string;
  gradient?: boolean;
  ring?: boolean;
}) {
  return (
    <div className="glass-card flex min-h-[140px] flex-col items-center justify-center p-4 text-center">
      {ring ? (
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-[#e5e5e5] bg-white">
          <span className="font-serif text-[28px] font-semibold text-black">{value}</span>
        </div>
      ) : (
        <p className={`font-serif text-[28px] font-semibold tracking-[-0.03em] ${gradient ? 'gradient-text' : 'text-black'}`}>{value}</p>
      )}
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
