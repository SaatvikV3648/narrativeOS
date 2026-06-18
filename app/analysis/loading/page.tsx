'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

import { GradientButton, GlassButton, SectionLabel } from '@/components/dashboard/LightDashboardPrimitives';
import { generationLimitCopy } from '@/lib/generation-limits';
import { supabaseClient } from '@/lib/supabase/client';

type ProfileSummary = {
  profileId: string;
  activities: number;
  schools: number;
  honors: number;
  passionWritten: boolean;
  hasAnalysis: boolean;
};

const loadingSteps = [
  'Identifying your archetype',
  'Scoring narrative coherence',
  'Building your spike profile',
];

export default function AnalysisLoadingPage() {
  const router = useRouter();
  const hasStartedGeneration = useRef(false);
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  const incomplete = useMemo(() => {
    if (!summary) return false;
    return summary.activities < 2 || !summary.passionWritten;
  }, [summary]);

  useEffect(() => {
    async function loadSummary() {
      const { data: userData } = await supabaseClient.auth.getUser();
      if (!userData.user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabaseClient
        .from('profiles')
        .select('id,target_schools,passion_statement')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (!profileData) {
        router.push('/onboarding');
        return;
      }
      const profile = profileData as {
        id: string;
        target_schools: string[] | null;
        passion_statement: string | null;
      };

      const [{ count: activityCount }, { count: honorCount }, { data: analysisData }] = await Promise.all([
        supabaseClient
          .from('activities')
          .select('id', { count: 'exact', head: true })
          .eq('profile_id', profile.id),
        (supabaseClient.from('honors') as any)
          .select('id', { count: 'exact', head: true })
          .eq('profile_id', profile.id),
        (supabaseClient.from('analyses') as any)
          .select('id')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      setSummary({
        profileId: profile.id,
        activities: activityCount ?? 0,
        schools: Array.isArray(profile.target_schools) ? profile.target_schools.length : 0,
        honors: honorCount ?? 0,
        passionWritten: Boolean(profile.passion_statement?.trim()),
        hasAnalysis: Boolean(analysisData),
      });
      setLoadingSummary(false);
    }

    loadSummary();
  }, [router]);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = window.setInterval(() => {
      setActiveStep((current) => Math.min(current + 1, loadingSteps.length - 1));
    }, 760);
    return () => window.clearInterval(interval);
  }, [isGenerating]);

  async function generate() {
    if (hasStartedGeneration.current || isGenerating) return;
    hasStartedGeneration.current = true;
    setError('');
    setUpgradeRequired(false);
    setIsGenerating(true);
    setActiveStep(0);

    try {
      const response = await fetch('/api/narrative/generate', { method: 'POST' });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        if (payload?.upgradeRequired) {
          setUpgradeRequired(true);
        }
        throw new Error(payload?.error || 'Could not generate analysis.');
      }

      const serializedAnalysis = JSON.stringify(payload.analysis);
      window.sessionStorage.setItem('spikd:last-analysis', serializedAnalysis);
      window.localStorage.setItem('spikd:last-analysis', serializedAnalysis);

      window.setTimeout(() => {
        router.push('/analysis/results');
      }, 1100);
    } catch (generateError) {
      hasStartedGeneration.current = false;
      setIsGenerating(false);
      setError(generateError instanceof Error
        ? generateError.message
        : 'Something interrupted the analysis. Your onboarding data is safe.');
    }
  }

  if (loadingSummary || isGenerating) {
    return (
      <main className="onboarding-bg min-h-screen px-5 py-8 text-black sm:px-8">
        <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-[600px] flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-[18px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)', animation: 'pulse-diamond 1.8s ease-in-out infinite' }} />
          <h1 className="mt-12 font-serif text-[28px] font-semibold tracking-[-0.02em] text-black">
            {isGenerating ? 'Reading your story...' : 'Preparing your profile...'}
          </h1>
          <div className="mt-8 grid gap-4 text-left">
            {(isGenerating ? loadingSteps : ['Loading your profile', 'Checking saved activities', 'Preparing your summary']).map((step, index) => (
              <div key={step} className="flex items-center gap-3" style={{ animation: `stepFade 0.2s ease ${index * 600}ms both` }}>
                <span className="h-2 w-2 rounded-full bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" />
                <span className="text-sm font-medium text-black">{step}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="onboarding-bg min-h-screen px-5 py-8 text-black sm:px-8">
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-[600px] flex-col justify-center">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Generate</p>
          <h1 className="mt-4 font-serif text-[32px] font-semibold tracking-[-0.03em] text-black sm:text-[40px]">
            Ready to reveal your <span className="gradient-text">spike</span>?
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-[var(--text-secondary)]">
            Our intelligence system will analyze your profile and decode the story your application is telling.
          </p>
        </div>

        <div className="gradient-border-card mt-10">
          <div className="glass-card relative z-10 p-6">
            <SectionLabel>Profile Summary</SectionLabel>
            <div className="mt-5 divide-y divide-[var(--border)]">
              <SummaryRow label="Activities" value={`${summary?.activities ?? 0} added`} complete={Boolean(summary?.activities)} />
              <SummaryRow label="Schools" value={`${summary?.schools ?? 0} added`} complete={Boolean(summary?.schools)} />
              <SummaryRow label="Honors" value={`${summary?.honors ?? 0} added`} complete={Boolean(summary?.honors)} />
              <SummaryRow label="Passion statement" value={summary?.passionWritten ? 'Written' : 'Not added'} complete={Boolean(summary?.passionWritten)} />
            </div>
            <p className="mt-5 border-t border-[var(--border)] pt-5 text-[13px] leading-6 text-[var(--text-muted)]">
              The more complete your profile, the more accurate your narrative analysis. {generationLimitCopy.combined}
            </p>
            {incomplete ? (
              <div className="mt-4 rounded-[10px] bg-[#fffbeb] px-4 py-3 text-[13px] font-medium leading-6 text-[#92400e]">
                Add more activities and a passion statement for the best results.
              </div>
            ) : null}
            {error ? (
              <div className="mt-4 rounded-[10px] bg-red-50 px-4 py-3 text-[13px] font-medium leading-6 text-red-700">
                {error}
                {upgradeRequired ? (
                  <Link href="/pricing" className="mt-3 block font-semibold text-red-800 underline underline-offset-4">
                    View Pro pricing →
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <GradientButton onClick={generate} disabled={isGenerating} className="mt-8 w-full !h-[52px]">
          {isGenerating ? 'Generating...' : 'Reveal my narrative →'}
        </GradientButton>

        {summary?.hasAnalysis ? (
          <div className="mt-3">
            <GlassButton onClick={generate} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Regenerate analysis'}
            </GlassButton>
          </div>
        ) : null}

        <Link href="/dashboard" className="mt-6 text-center text-sm font-semibold text-[var(--text-muted)] transition hover:text-black">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}

function SummaryRow({ label, value, complete }: { label: string; value: string; complete: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className={complete ? 'font-semibold text-black' : 'font-medium text-[var(--text-muted)]'}>
        {complete ? <Check className="mr-1 inline h-4 w-4 align-[-3px] text-[#f64f59]" /> : null}
        {value}
      </span>
    </div>
  );
}
