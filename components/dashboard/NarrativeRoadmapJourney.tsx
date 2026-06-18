'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { GradientButton, SectionLabel } from '@/components/dashboard/LightDashboardPrimitives';
import type { NarrativeRoadmap, RoadmapActionStatus, RoadmapOpportunity } from '@/lib/roadmap/mock';
import { calculateDerivedNarrativeScore, calculateDynamicScorePath, getRoadmapActions } from '@/lib/roadmap/progress';

const statuses: RoadmapActionStatus[] = ['Not Started', 'In Progress', 'Completed'];

export default function NarrativeRoadmapJourney({ roadmap, roadmapId }: { roadmap: NarrativeRoadmap; roadmapId: string }) {
  const [signalBuilders, setSignalBuilders] = useState<RoadmapOpportunity[]>(roadmap.signalBuilders);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState('0-0');

  const liveRoadmap = useMemo<NarrativeRoadmap>(() => ({
    ...roadmap,
    signalBuilders,
  }), [roadmap, signalBuilders]);

  const actions = useMemo(() => getRoadmapActions(signalBuilders), [signalBuilders]);
  const scorePath = useMemo(() => calculateDynamicScorePath(liveRoadmap), [liveRoadmap]);
  const narrativeScore = useMemo(() => calculateDerivedNarrativeScore(liveRoadmap), [liveRoadmap]);

  async function saveAction(
    signalIndex: number,
    builderIndex: number,
    updates: {
      status?: RoadmapActionStatus;
      evidenceText?: string;
      evidenceLink?: string;
    },
  ) {
    if (savingKey) return;

    const currentAction = signalBuilders[signalIndex]?.builders[builderIndex];
    if (!currentAction) return;

    const nextAction = {
      ...currentAction,
      status: updates.status ?? currentAction.status,
      evidenceText: updates.evidenceText ?? currentAction.evidenceText ?? '',
      evidenceLink: updates.evidenceLink ?? currentAction.evidenceLink ?? '',
    };
    const actionKey = `${signalIndex}-${builderIndex}`;
    const previousBuilders = signalBuilders;

    setFeedback(null);
    setSavingKey(actionKey);
    setSignalBuilders((current) => current.map((signal, index) => {
      if (index !== signalIndex) return signal;
      return {
        ...signal,
        builders: signal.builders.map((builder, nestedIndex) => (
          nestedIndex === builderIndex ? nextAction : builder
        )),
      };
    }));

    try {
      const response = await fetch('/api/roadmap/actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roadmapId,
          signalIndex,
          builderIndex,
          status: nextAction.status,
          evidenceText: nextAction.evidenceText,
          evidenceLink: nextAction.evidenceLink,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setSignalBuilders(previousBuilders);
        setFeedback(payload?.error || 'Could not save this roadmap action.');
        return;
      }

      if (payload?.roadmap?.signalBuilders) {
        setSignalBuilders(payload.roadmap.signalBuilders);
      }
      setFeedback('Roadmap action saved.');
    } catch {
      setSignalBuilders(previousBuilders);
      setFeedback('Could not reach Spikd roadmap actions. Please try again.');
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-3">
        <BaselineCard label="Narrative" value={String(narrativeScore.derivedNarrativeScore)} progress={narrativeScore.derivedNarrativeScore} />
        <BaselineCard label="Proof" value={`${scorePath.percentage}%`} progress={scorePath.percentage} />
        <BaselineCard label="Potential" value={String(roadmap.potentialScorePath.potentialScore)} gradient />
      </section>

      <section className="glass-card p-6">
        <SectionLabel>Current Narrative</SectionLabel>
        <p className="mt-4 text-[15px] leading-7 text-black">{roadmap.currentNarrative.summary}</p>
      </section>

      <section className="glass-card p-6">
        <SectionLabel>Gap and Missing Signals</SectionLabel>
        <div className="mt-4 flex flex-wrap gap-2">
          <SignalPill>{roadmap.missingSignals[0]?.label || roadmap.narrativeTension.signalImpact}</SignalPill>
          {roadmap.missingSignals.map((signal) => (
            <SignalPill key={signal.label} small>{signal.label}</SignalPill>
          ))}
        </div>
      </section>

      <section className="glass-card p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="font-serif text-xl font-semibold text-black">{narrativeScore.derivedNarrativeScore}</span>
          <span className="font-serif text-xl font-semibold"><span className="gradient-text">{scorePath.potentialScore}</span></span>
        </div>
        <div className="relative mt-8 h-12">
          <div className="absolute left-0 right-0 top-3 h-px bg-[var(--border)]" />
          <div className="absolute left-0 top-3 h-px bg-[linear-gradient(90deg,#667eea,#f64f59,#12c2e9)] transition-all duration-500" style={{ width: `${scorePath.percentage}%` }} />
          {actions.slice(0, 5).map((action, index) => {
            const done = action.status === 'Completed' && Boolean(action.evidenceText || action.evidenceLink);
            const doing = action.status === 'In Progress';
            return (
              <div key={`${action.title}-node`} className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${((index + 1) / 6) * 100}%` }}>
                <span className={`mx-auto block h-6 w-6 rounded-full border ${
                  done
                    ? 'border-transparent bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]'
                    : doing
                      ? 'border-[#f64f59] bg-white'
                      : 'border-[var(--border)] bg-white'
                }`} />
                <span className="mt-2 block text-[10px] font-bold text-[var(--text-muted)]">{action.estimatedScoreImpact}</span>
                <span className="block text-[11px] font-bold text-[var(--text-muted)]">#{index + 1}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-5 text-right text-xs font-semibold text-[var(--text-muted)]">
          {scorePath.completedWithEvidence}/{scorePath.total} proven · +{narrativeScore.completionBoost} narrative boost
        </p>
      </section>

      <section className="glass-card p-6">
        <SectionLabel>Roadmap Actions</SectionLabel>
        <p className="mt-3 text-[13px] leading-6 text-[var(--text-secondary)]">
          Completion only counts toward Proof Score when an action is marked completed and includes evidence.
        </p>
        {feedback ? (
          <p className={`mt-4 rounded-[10px] px-4 py-3 text-sm font-semibold ${
            feedback.includes('Could not') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
          }`}>
            {feedback}
          </p>
        ) : null}

        <div className="relative mt-6 space-y-3 pl-5">
          <div className="absolute bottom-8 left-[29px] top-4 w-px bg-[var(--border)]" />
          {actions.map((action) => {
            const actionKey = `${action.signalIndex}-${action.builderIndex}`;
            const saving = savingKey === actionKey;
            const expanded = expandedKey === actionKey;

            return (
              <article key={`${action.signal}-${action.title}-${action.builderIndex}`} className="relative">
                <button
                  type="button"
                  onClick={() => setExpandedKey(expanded ? '' : actionKey)}
                  className="glass-card group flex w-full items-start gap-4 p-4 text-left transition duration-200 hover:-translate-y-px"
                >
                  <StatusNode status={action.status} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <SignalPill small>{action.signalGapClosed}</SignalPill>
                      <span className="text-xs font-semibold text-[var(--text-muted)]">#{action.rank}</span>
                      <span className="text-xs font-semibold text-[var(--text-muted)]">{action.timeframe}</span>
                    </span>
                    <span className="mt-3 block font-serif text-base font-semibold text-black">{action.title}</span>
                    <span className="mt-2 flex items-center justify-between gap-4">
                      <span className="gradient-text text-xs font-bold">{action.estimatedScoreImpact}</span>
                      <StatusPill status={action.status} />
                    </span>
                  </span>
                  <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-[var(--text-muted)] transition ${expanded ? 'rotate-180' : ''}`} />
                </button>

                {expanded ? (
                  <div className="ml-9 mt-3 glass-card p-5">
                    <p className="text-sm leading-7 text-[var(--text-secondary)]">{action.action || action.description}</p>
                    <div className="my-5 h-px bg-[var(--border)]" />
                    <DetailRow label="Signal gap closed" value={action.signalGapClosed} />
                    <DetailRow label="Spike tag" value={action.spikeTag} />
                    <div className="mt-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Why it matters</p>
                      <p className="mt-2 text-sm italic leading-7 text-black">{action.whyItMatters}</p>
                    </div>
                    <DetailRow label="Proof type" value={`${action.proofType} · ${action.difficulty}`} />
                    <div className="my-5 h-px bg-[var(--border)]" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Evidence Required</p>
                    <div className="mt-3 grid gap-2">
                      {action.evidenceRequired.map((evidence) => (
                        <label key={evidence} className="flex items-start gap-2 text-[13px] leading-6 text-[var(--text-secondary)]">
                          <span className="mt-2 h-2 w-2 rounded-full bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" />
                          {evidence}
                        </label>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {statuses.map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={Boolean(savingKey)}
                          onClick={() => saveAction(action.signalIndex, action.builderIndex, { status })}
                          className={`rounded-full px-3 py-2 text-xs font-semibold transition hover:-translate-y-px ${
                            action.status === status
                              ? 'gradient-border-card text-black'
                              : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                          } disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0`}
                        >
                          <span className="relative z-10">{status === 'Not Started' ? 'New' : status === 'In Progress' ? 'Doing' : 'Done'}</span>
                        </button>
                      ))}
                    </div>
                    <form
                      className="mt-4 space-y-3"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const form = new FormData(event.currentTarget);
                        saveAction(action.signalIndex, action.builderIndex, {
                          evidenceText: String(form.get('evidenceText') || ''),
                          evidenceLink: String(form.get('evidenceLink') || ''),
                        });
                      }}
                    >
                      <textarea
                        name="evidenceText"
                        defaultValue={action.evidenceText || ''}
                        disabled={Boolean(savingKey)}
                        rows={3}
                        placeholder="What proof did you create?"
                        className="spikd-liquid-input h-auto min-h-[96px] w-full resize-none py-3"
                      />
                      <input
                        name="evidenceLink"
                        defaultValue={action.evidenceLink || ''}
                        disabled={Boolean(savingKey)}
                        placeholder="Optional evidence link"
                        className="spikd-liquid-input w-full"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={Boolean(savingKey)}
                          className="inline-flex h-12 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)] bg-[length:200%_200%] px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                          style={{ animation: 'shimmer 6s ease infinite' }}
                        >
                          {saving ? 'Saving...' : 'Save evidence'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="gradient-border-card">
        <div className="glass-card relative z-10 p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Next Narrative Stage</p>
          <h2 className="mt-4 font-serif text-[22px] font-semibold tracking-[-0.02em]"><span className="gradient-text">{roadmap.nextNarrativeStage.nextStage}</span></h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{roadmap.nextNarrativeStage.explanation}</p>
        </div>
      </section>
    </div>
  );
}

function BaselineCard({ label, value, progress, gradient }: { label: string; value: string; progress?: number; gradient?: boolean }) {
  return (
    <div className="glass-card p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</p>
      <p className={`mt-3 font-serif text-[40px] font-semibold leading-none ${gradient ? 'gradient-text' : 'text-black'}`}>{value}</p>
      {typeof progress === 'number' ? (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--border)]">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#667eea,#f64f59,#12c2e9)] transition-all duration-500" style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} />
        </div>
      ) : null}
    </div>
  );
}

function SignalPill({ children, small }: { children: string; small?: boolean }) {
  return (
    <span className={`gradient-border-card inline-flex w-fit items-center ${small ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-[13px]'} font-semibold`}>
      <span className="relative z-10 gradient-text">{children}</span>
    </span>
  );
}

function StatusNode({ status }: { status: RoadmapActionStatus }) {
  const done = status === 'Completed';
  const doing = status === 'In Progress';
  return (
    <span className={`relative z-10 mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
      done
        ? 'border-transparent bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]'
        : doing
          ? 'border-[#f64f59] bg-white'
          : 'border-[var(--border)] bg-white'
    }`} />
  );
}

function StatusPill({ status }: { status: RoadmapActionStatus }) {
  const label = status === 'Not Started' ? 'Not Started' : status === 'In Progress' ? 'Doing' : 'Done';
  const className = status === 'Completed'
    ? 'bg-[#f0fdf4] text-[#16a34a]'
    : status === 'In Progress'
      ? 'bg-[#fffbeb] text-[#92400e]'
      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]';
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{label}</span>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 flex items-start justify-between gap-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
      <p className="max-w-[60%] text-right text-sm font-semibold text-black">{value}</p>
    </div>
  );
}
