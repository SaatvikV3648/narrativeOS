import Link from 'next/link';
import { redirect } from 'next/navigation';
import type React from 'react';

import DashboardCommandCenter from '@/components/dashboard/DashboardCommandCenter';
import DashboardShell from '@/components/layout/DashboardShell';
import { storedAnalysisToNarrative } from '@/lib/narrative/mock';
import { calculateProofScore, getRoadmapActions } from '@/lib/roadmap/progress';
import { storedRoadmapToNarrative } from '@/lib/roadmap/mock';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Activities, NarrativeRoadmaps, Profiles } from '@/lib/supabase/types';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect('/login');
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  const profile = profileData as Profiles | null;

  if (!profile) {
    return (
      <DashboardShell>
        <EmptyState
          title="Your spike is waiting."
          copy="Complete your profile to see your narrative analysis."
          href="/onboarding"
          cta="Complete your profile →"
        />
      </DashboardShell>
    );
  }

  const [{ data: activityData }, { data: latestAnalysisData }, { data: latestRoadmapData }] = await Promise.all([
    supabase
      .from('activities')
      .select('*')
      .eq('profile_id', profile.id)
      .order('sort_order', { ascending: true }),
    (supabase.from('analyses') as any)
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('narrative_roadmaps')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const activities = (activityData as Activities[] | null) ?? [];
  const latestAnalysis = latestAnalysisData ? storedAnalysisToNarrative(latestAnalysisData) : null;
  const latestRoadmapRow = latestRoadmapData as NarrativeRoadmaps | null;
  const latestRoadmap = latestRoadmapRow ? storedRoadmapToNarrative(latestRoadmapRow) : null;
  const proof = latestRoadmap ? calculateProofScore(latestRoadmap.signalBuilders) : { percentage: 0, completedWithEvidence: 0, total: 5 };
  const actions = latestRoadmap ? getRoadmapActions(latestRoadmap.signalBuilders) : [];
  const nextAction = actions.find((action) => action.status !== 'Completed');
  const hasCompleteProfile = profile.onboarded && activities.length > 0 && Boolean(profile.intended_major);

  if (!latestAnalysis || !hasCompleteProfile) {
    return (
      <DashboardShell>
        <EmptyState
          title="Your spike is waiting."
          copy="Complete your profile to see your narrative analysis."
          href={profile.onboarded ? '/analysis/loading' : '/onboarding'}
          cta={profile.onboarded ? 'Generate your spike →' : 'Complete your profile →'}
        />
      </DashboardShell>
    );
  }

  const completed = proof.completedWithEvidence;
  const total = proof.total || 5;
  const remaining = Math.max(total - completed, 0);
  const score = latestAnalysis.score;
  const gap = latestAnalysis.gap.label;
  const topSpike = inferTopSpike(latestRoadmap, latestAnalysis.signals?.[0]?.label);
  const topSpikeLevel = getSpikeLevel(proof.percentage);
  const nextLevel = nextAction?.signalGapClosed || gap;
  const targetSchool = profile.target_schools?.[0] || 'Target school';
  const matchScore = Math.min(94, Math.max(72, 100 - Math.abs(84 - score)));
  const firstName = (profile.full_name || 'there').split(' ')[0] || 'there';
  const recentEvents = [
    latestAnalysisData?.created_at
      ? { label: `Narrative score updated to ${score}`, timestamp: relativeTime(new Date(latestAnalysisData.created_at)) }
      : null,
    latestRoadmapRow?.created_at
      ? { label: `${completed} roadmap actions verified`, timestamp: relativeTime(new Date(latestRoadmapRow.created_at)) }
      : null,
    activities[0]?.created_at
      ? { label: `${activities[0].activity_name} added to your activity profile`, timestamp: relativeTime(new Date(activities[0].created_at)) }
      : null,
    profile.updated_at
      ? { label: 'Profile details refreshed', timestamp: relativeTime(new Date(profile.updated_at)) }
      : null,
  ].filter(Boolean) as { label: string; timestamp: string }[];

  return (
    <DashboardShell>
      <DashboardCommandCenter
        firstName={firstName}
        score={score}
        archetype={latestAnalysis.archetype}
        potential={latestAnalysis.potentialScore}
        gap={gap}
        nextActionTitle={nextAction?.title || 'Generate your next roadmap action'}
        nextActionSignal={nextAction?.signalGapClosed || gap}
        nextActionImpact={nextAction?.estimatedScoreImpact || '+1 to +3 pts'}
        proofPercentage={proof.percentage}
        completed={completed}
        total={total}
        remaining={remaining}
        targetSchool={targetSchool}
        matchScore={matchScore}
        topSpike={topSpike}
        topSpikeLevel={topSpikeLevel}
        nextLevel={nextLevel}
        recentEvents={recentEvents}
      />
    </DashboardShell>
  );
}

function EmptyState({ title, copy, href, cta }: { title: string; copy: string; href: string; cta: string }) {
  return (
    <main className="onboarding-bg flex min-h-screen items-center justify-center px-5 py-8 text-center text-black">
      <style dangerouslySetInnerHTML={{ __html: emptyStyles }} />
      <div className="relative z-10">
        <div className="mx-auto h-12 w-12 rounded-[10px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)] bg-[length:200%_200%]" style={{ transform: 'rotate(45deg)', animation: 'pulse-diamond 1.8s ease-in-out infinite, gradientShift 4s ease infinite' }} />
        <h1 className="mt-8 font-serif text-2xl font-semibold tracking-[-0.03em] text-black">{title}</h1>
        <div className="mt-3 text-[13px] leading-6 text-[#555555]">{copy}</div>
        <Link href={href} className="mt-8 inline-flex h-12 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)] bg-[length:200%_200%] px-6 text-sm font-semibold text-white transition duration-200 hover:-translate-y-px" style={{ animation: 'shimmer 6s ease infinite' }}>
          {cta}
        </Link>
      </div>
    </main>
  );
}

function inferTopSpike(roadmap: ReturnType<typeof storedRoadmapToNarrative> | null, fallback?: string) {
  const action = roadmap ? getRoadmapActions(roadmap.signalBuilders)[0] : null;
  return action?.spikeTag || roadmap?.signalBuilders[0]?.signal || fallback || 'Business';
}

function getSpikeLevel(value: number) {
  if (value >= 80) return 'Advanced';
  if (value >= 40) return 'Developing';
  return 'Emerging';
}

function relativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

const emptyStyles = `
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;
