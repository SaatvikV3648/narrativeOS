import Link from 'next/link';
import { ArrowRight, UsersRound } from 'lucide-react';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { EmptyState, GradientButton, LightDashboardFrame, PageHeader, SectionLabel } from '@/components/dashboard/LightDashboardPrimitives';
import DashboardShell from '@/components/layout/DashboardShell';
import { storedAnalysisToNarrative } from '@/lib/narrative/mock';
import { loadAdmittedProfiles, matchAdmittedProfiles } from '@/lib/peer-benchmarks';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Activities, Profiles } from '@/lib/supabase/types';

export default async function PeerBenchmarksPage({
  searchParams,
}: {
  searchParams?: { match?: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  const profile = profileData as Profiles | null;

  if (!profile) {
    return (
      <DashboardShell>
        <LightDashboardFrame maxWidth="900px">
          <EmptyState
            title="Finish your profile first."
            copy="Benchmarks need your intended major, schools, and narrative baseline before matching you with admitted profiles."
          />
          <div className="text-center"><GradientButton href="/onboarding">Complete onboarding →</GradientButton></div>
        </LightDashboardFrame>
      </DashboardShell>
    );
  }

  const [{ data: activityData }, { data: latestAnalysisData }] = await Promise.all([
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
  ]);

  const activities = (activityData as Activities[] | null) ?? [];
  const analysis = latestAnalysisData ? storedAnalysisToNarrative(latestAnalysisData) : null;

  if (!analysis) {
    return (
      <DashboardShell>
        <LightDashboardFrame maxWidth="900px">
          <EmptyState
            title="Generate your narrative first."
            copy="Benchmarks compare your latest archetype, score, signals, and gap against admitted profiles."
          />
          <div className="text-center"><GradientButton href="/analysis/loading">Generate My Narrative →</GradientButton></div>
        </LightDashboardFrame>
      </DashboardShell>
    );
  }

  const { profiles: admittedProfiles } = await loadAdmittedProfiles();
  const matches = matchAdmittedProfiles({ admittedProfiles, profile, activities, analysis });
  const selectedMatch = matches.find((match) => match.profile.profileId === searchParams?.match) ?? matches[0] ?? null;
  const userSignals = analysis.signals.map((signal) => signal.label);

  if (!selectedMatch) {
    return (
      <DashboardShell>
        <LightDashboardFrame maxWidth="900px">
          <EmptyState
            title="Not enough matches yet."
            copy="We are adding new admitted profiles weekly. Check back soon or update your activities to improve your match."
          />
          <div className="text-center"><GradientButton href="/dashboard/activities">Update activities →</GradientButton></div>
        </LightDashboardFrame>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <LightDashboardFrame maxWidth="900px">
        <PageHeader
          before="Peer profile "
          gradient="matches"
          subtext="Real students with your archetype who got into their target schools."
        />

        <section className="glass-card mb-4 flex items-start gap-3 p-4">
          <span className="mt-1 h-3 w-3 rounded-[3px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)' }} />
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Showing profiles matching your archetype <span className="gradient-text font-semibold">{analysis.archetype}</span> with narrative scores within ±10 of yours (<span className="gradient-text font-semibold">{analysis.score}</span>).
          </p>
        </section>

        <section className="gradient-border-card">
          <div className="glass-card relative z-10 p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Best Match</p>
                <h2 className="mt-4 font-serif text-[44px] font-semibold tracking-[-0.04em]"><span className="gradient-text">{selectedMatch.profile.archetype}</span></h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">{selectedMatch.profile.storySummary}</p>
              </div>
              <div className="glass-card min-w-[160px] p-5 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Similarity</p>
                <p className="mt-2 font-serif text-[44px] font-semibold text-black">{Math.round(selectedMatch.score)}</p>
                <p className="text-xs font-semibold text-[var(--text-muted)]">score {selectedMatch.profile.narrativeScore}/100</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <BestMatchTile label="Spike" value={selectedMatch.profile.spike} />
              <BestMatchTile label="Admitted to" value={selectedMatch.profile.schoolsAdmitted.slice(0, 3).join(', ')} />
              <BestMatchTile label="Gap solved" value={selectedMatch.profile.gapSolved} />
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <AnalysisCard title="Why This Profile Scored Higher">
            <div className="grid gap-3">
              {selectedMatch.whyScoredHigher.map((reason) => <Callout key={reason}>{reason}</Callout>)}
            </div>
          </AnalysisCard>
          <AnalysisCard title="Story Construction Analysis">
            <ConstructionRow label="Foundation" value={selectedMatch.storyConstruction.foundation} />
            <ConstructionRow label="Proof layer" value={selectedMatch.storyConstruction.proofLayer} />
            <ConstructionRow label="Positioning" value={selectedMatch.storyConstruction.positioning} />
          </AnalysisCard>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <ProfileComparison
            title="You"
            archetype={analysis.archetype}
            score={`${analysis.score}/100 · ${profile.intended_major || 'Undecided'}`}
            summary={analysis.narrative}
            signals={[...userSignals, `Gap: ${analysis.gap.label}`]}
          />
          <ProfileComparison
            title="Matched admitted profile"
            archetype={selectedMatch.profile.archetype}
            score={`${selectedMatch.profile.narrativeScore}/100 · ${selectedMatch.profile.intendedMajor}`}
            summary={selectedMatch.profile.storySummary}
            signals={[...selectedMatch.profile.strongestSignals.slice(0, 5), `Solved: ${selectedMatch.profile.gapSolved}`]}
          />
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <AnalysisCard title="Signal Comparison">
            <SignalGroup title="Signals you already show" signals={userSignals} />
            <SignalGroup title="Signals this admitted profile showed" signals={selectedMatch.profile.strongestSignals.slice(0, 5)} />
            <SignalGroup title="Missing or underdeveloped for you" signals={selectedMatch.missingSignals} />
          </AnalysisCard>
          <AnalysisCard title="Narrative Shift">
            <div className="flex items-center gap-3 font-serif text-2xl font-semibold text-black">
              <span>{selectedMatch.narrativeShift.from}</span>
              <ArrowRight className="h-5 w-5 text-[var(--text-muted)]" />
              <span className="gradient-text">{selectedMatch.narrativeShift.to}</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              What created the shift: {selectedMatch.narrativeShift.createdBy.join(', ')}.
            </p>
          </AnalysisCard>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-3">
          {matches.slice(0, 3).map((match) => (
            <Link
              key={match.profile.profileId}
              href={`/dashboard/peer-benchmarks?match=${match.profile.profileId}`}
              className="gradient-border-card transition hover:-translate-y-px"
            >
              <article className="glass-card relative z-10 h-full p-5">
                <div className="flex items-start justify-between gap-4">
                  <Pill>{match.profile.archetype}</Pill>
                  <span className="rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">{match.profile.narrativeScore - 2}–{match.profile.narrativeScore + 2}</span>
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Spike</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-black">{match.profile.spike}</p>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Activities</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {match.profile.activities.slice(0, 4).map((activity) => (
                    <span key={activity} className="rounded-full bg-[var(--bg-secondary)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">{activity}</span>
                  ))}
                </div>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Admitted To</p>
                <div className="mt-2 grid gap-2">
                  {match.profile.schoolsAdmitted.slice(0, 3).map((school) => (
                    <p key={school} className="flex items-center gap-2 text-[13px] font-semibold text-black">
                      <span className="h-2 w-2 rounded-[2px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)' }} />
                      {school}
                    </p>
                  ))}
                </div>
                <p className="mt-4 rounded-[8px] bg-[#fffbeb] p-3 text-[13px] leading-6 text-[#92400e]">
                  Their score was {match.profile.narrativeScore}. Yours is {analysis.score}. The difference was {match.missingSignals[0] || match.profile.gapSolved}.
                </p>
              </article>
            </Link>
          ))}
        </section>

        <section className="gradient-border-card mt-8">
          <div className="glass-card relative z-10 p-6">
            <h2 className="font-serif text-xl font-semibold text-black">Got in? <span className="gradient-text">Share</span> your profile.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              Help future students by anonymously sharing your admitted profile. Your data helps match students with profiles like yours.
            </p>
            <GradientButton href="/dashboard/settings" className="mt-6">Share my admitted profile →</GradientButton>
          </div>
        </section>
      </LightDashboardFrame>
    </DashboardShell>
  );
}

function BestMatchTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-black">{value}</p>
    </div>
  );
}

function AnalysisCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="glass-card p-6">
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-5 grid gap-3">{children}</div>
    </div>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-[12px] bg-[var(--bg-secondary)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-[2px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)' }} />
      <span>{children}</span>
    </div>
  );
}

function ProfileComparison({
  title,
  archetype,
  score,
  summary,
  signals,
}: {
  title: string;
  archetype: string;
  score: string;
  summary: string;
  signals: string[];
}) {
  return (
    <div className="glass-card p-6">
      <SectionLabel>{title}</SectionLabel>
      <h3 className="mt-4 font-serif text-2xl font-semibold text-black">{archetype}</h3>
      <p className="mt-1 text-sm font-semibold text-[var(--text-muted)]">{score}</p>
      <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--text-secondary)]">{summary}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {signals.map((signal) => <Pill key={signal}>{signal}</Pill>)}
      </div>
    </div>
  );
}

function SignalGroup({ title, signals }: { title: string; signals: string[] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {signals.length ? signals.map((signal) => <Pill key={signal}>{signal}</Pill>) : <span className="text-sm text-[var(--text-muted)]">No signal detected yet.</span>}
      </div>
    </div>
  );
}

function ConstructionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-[var(--bg-secondary)] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-black">{value}</p>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="gradient-border-card inline-flex w-fit px-3 py-1 text-xs font-semibold">
      <span className="relative z-10 gradient-text">{children}</span>
    </span>
  );
}
