import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { redirect } from 'next/navigation';

import GenerateRoadmapButton from '@/components/dashboard/GenerateRoadmapButton';
import { EmptyState, GradientButton, LightDashboardFrame, PageHeader } from '@/components/dashboard/LightDashboardPrimitives';
import NarrativeRoadmapJourney from '@/components/dashboard/NarrativeRoadmapJourney';
import DashboardShell from '@/components/layout/DashboardShell';
import { generationLimitCopy } from '@/lib/generation-limits';
import { storedAnalysisToNarrative } from '@/lib/narrative/mock';
import { storedRoadmapToNarrative } from '@/lib/roadmap/mock';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Activities, Analyses, NarrativeRoadmaps, Profiles } from '@/lib/supabase/types';

export default async function RoadmapPage() {
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
        <LightDashboardFrame maxWidth="800px">
          <EmptyState
            title="Finish your proof baseline first."
            copy="Roadmap needs your saved profile, activities, and latest analysis before it can map your story evolution."
          />
          <div className="text-center">
            <GradientButton href="/onboarding">Go to onboarding →</GradientButton>
          </div>
        </LightDashboardFrame>
      </DashboardShell>
    );
  }

  const [{ data: analysisData }, { data: activityData }, { data: roadmapData }] = await Promise.all([
    (supabase.from('analyses') as any)
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('activities')
      .select('*')
      .eq('profile_id', profile.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('narrative_roadmaps')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const latestAnalysisRow = analysisData as Analyses | null;
  const latestAnalysis = latestAnalysisRow ? storedAnalysisToNarrative(latestAnalysisRow) : null;
  const activities = (activityData as Activities[] | null) ?? [];
  const latestRoadmapRow = roadmapData as NarrativeRoadmaps | null;
  const latestRoadmap = latestRoadmapRow ? storedRoadmapToNarrative(latestRoadmapRow) : null;
  const canGenerateRoadmap = Boolean(latestAnalysis && activities.length);

  return (
    <DashboardShell>
      <LightDashboardFrame maxWidth="800px">
        <PageHeader
          before="Your narrative "
          gradient="roadmap"
          subtext="Build proof for your next narrative stage."
          action={<GenerateRoadmapButton label={latestRoadmap ? 'Generate updated roadmap' : 'Generate roadmap'} disabled={!canGenerateRoadmap} />}
        />

        {latestRoadmapRow && latestRoadmap ? (
          <>
            <div className="glass-card mb-6 p-5">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-[3px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)' }} />
                <p className="text-[13px] leading-6 text-[var(--text-secondary)]">
                  Saved roadmap — page refreshes load this from Supabase. A new analysis only happens when you generate again. {generationLimitCopy.combined}
                </p>
              </div>
            </div>
            <NarrativeRoadmapJourney roadmap={latestRoadmap} roadmapId={latestRoadmapRow.id} />
          </>
        ) : (
          <section className="gradient-border-card">
            <div className="glass-card relative z-10 p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Narrative Roadmap</p>
              <h2 className="mt-4 max-w-xl font-serif text-[34px] font-semibold leading-tight tracking-[-0.03em] text-black">
                Build the map of your application story.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
                Free gives you the diagnosis. Roadmap turns it into prescription: proof actions, missing signals, potential score path, and the next narrative stage. {generationLimitCopy.combined}
              </p>
              <div className="mt-8">
                {latestAnalysis ? (
                  <GenerateRoadmapButton disabled={!canGenerateRoadmap} />
                ) : (
                  <GradientButton href="/analysis/loading">
                    Generate Narrative First <ArrowRight className="ml-2 h-4 w-4" />
                  </GradientButton>
                )}
                {!activities.length && latestAnalysis ? (
                  <p className="mt-3 text-sm leading-6 text-[#92400e]">
                    Add at least one activity before generating your roadmap.
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        )}
      </LightDashboardFrame>
    </DashboardShell>
  );
}
