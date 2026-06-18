'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type RecentEvent = {
  label: string;
  timestamp: string;
};

type DashboardCommandCenterProps = {
  firstName: string;
  score: number;
  archetype: string;
  potential: number;
  gap: string;
  nextActionTitle: string;
  nextActionSignal: string;
  nextActionImpact: string;
  proofPercentage: number;
  completed: number;
  total: number;
  remaining: number;
  targetSchool: string;
  matchScore: number;
  topSpike: string;
  topSpikeLevel: string;
  nextLevel: string;
  recentEvents: RecentEvent[];
};

export default function DashboardCommandCenter({
  firstName,
  score,
  archetype,
  potential,
  gap,
  nextActionTitle,
  nextActionSignal,
  nextActionImpact,
  proofPercentage,
  completed,
  total,
  remaining,
  targetSchool,
  matchScore,
  topSpike,
  topSpikeLevel,
  nextLevel,
  recentEvents,
}: DashboardCommandCenterProps) {
  const spikeBars = useMemo(() => {
    const secondary = Math.max(18, Math.min(100, score - 18));
    const tertiary = Math.max(12, Math.min(100, proofPercentage + 28));
    return [
      { name: topSpike, level: topSpikeLevel, value: Math.max(proofPercentage, Math.min(score, 88)), next: nextLevel },
      { name: nextActionSignal, level: remaining > 0 ? 'Building' : 'Verified', value: secondary, next: gap },
      { name: archetype, level: 'Narrative', value: tertiary, next: targetSchool },
    ];
  }, [archetype, gap, nextActionSignal, nextLevel, proofPercentage, remaining, score, targetSchool, topSpike, topSpikeLevel]);

  const events = recentEvents.length > 0 ? recentEvents.slice(0, 5) : [
    { label: 'Narrative score loaded', timestamp: 'today' },
    { label: `${completed} roadmap actions verified`, timestamp: 'today' },
    { label: `${topSpike} spike profile updated`, timestamp: 'today' },
  ];

  return (
    <main className="onboarding-bg min-h-screen px-5 py-8 text-black sm:px-8">
      <div className="relative z-10 mx-auto max-w-[900px]">
        <header className="mb-8">
          <h1 className="font-serif text-[28px] font-semibold tracking-[-0.03em] text-black">
            Good morning, <span className="gradient-text">{firstName}</span>.
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Here is where your spike stands today.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Narrative Score" subtext="out of 100">
            <CircularScore value={score} />
          </MetricCard>

          <MetricCard label="Proof Score" subtext="of roadmap proven">
            <div className="font-serif text-[48px] font-semibold leading-none text-black">{proofPercentage}%</div>
            <ProgressBar value={proofPercentage} className="mt-4" />
          </MetricCard>

          <MetricCard label="Top Spike" subtext={`${completed} actions completed`}>
            <div className="truncate font-serif text-2xl font-semibold leading-tight text-black">{topSpike}</div>
            <GradientBadge className="mt-3">{topSpikeLevel}</GradientBadge>
          </MetricCard>

          <MetricCard label="Next Milestone" subtext={`complete to unlock ${nextActionImpact}`}>
            <div className="line-clamp-3 min-h-[66px] break-words text-[15px] font-semibold leading-snug text-black">
              {nextActionTitle}
            </div>
            <div className="mt-4 text-right text-xl font-semibold gradient-text">→</div>
          </MetricCard>
        </section>

        <section className="mt-8">
          <SectionLabel>Spike Progress</SectionLabel>
          <div className="mt-4 grid gap-4">
            {spikeBars.map((bar, index) => (
              <div key={`${bar.name}-${index}`} className="glass-card p-5">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <p className="truncate text-sm font-semibold text-black">{bar.name}</p>
                  <GradientBadge>{bar.level}</GradientBadge>
                </div>
                <ProgressBar value={bar.value} delay={index * 120} />
                <p className="mt-3 text-xs font-medium text-[var(--text-muted)]">Next level requires {bar.next}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <SectionLabel>Recent Activity</SectionLabel>
          <div className="mt-4">
            {events.map((event, index) => (
              <div key={`${event.label}-${index}`} className="flex items-center gap-3 border-b border-[#f5f5f5] py-3 last:border-b-0">
                <span className="h-2 w-2 shrink-0 rounded-[2px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)' }} />
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-black">{event.label}</p>
                <span className="shrink-0 text-xs font-medium text-[var(--text-muted)]">{event.timestamp}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <QuickAction
            href="/dashboard/activities"
            heading="Update activities"
            subtext="Keep your profile current"
          />
          <QuickAction
            href="/dashboard/roadmap"
            heading="Generate roadmap"
            subtext="Get your next action steps"
          />
          <QuickAction
            href="/dashboard/peer-benchmarks"
            heading="View peer matches"
            subtext={`Best match: ${matchScore}% at ${targetSchool}`}
            badge="Pro"
          />
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, subtext, children }: { label: string; subtext: string; children: React.ReactNode }) {
  return (
    <div className="glass-card flex min-h-[230px] flex-col justify-between p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</p>
      <div className="my-5 flex min-h-[96px] flex-col justify-center">{children}</div>
      <p className="text-[13px] font-medium leading-5 text-[var(--text-secondary)]">{subtext}</p>
    </div>
  );
}

function CircularScore({ value }: { value: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div className="relative mx-auto h-[100px] w-[100px]">
      <svg className="h-[100px] w-[100px] -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e5e5" strokeWidth="4" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#score-gradient)"
          strokeLinecap="round"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="animate-ring"
        />
        <defs>
          <linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="50%" stopColor="#f64f59" />
            <stop offset="100%" stopColor="#12c2e9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-serif text-[36px] font-semibold text-black">
        {value}
      </div>
    </div>
  );
}

function ProgressBar({ value, delay = 0, className = '' }: { value: number; delay?: number; className?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded bg-[var(--border)] ${className}`}>
      <div
        className="h-full rounded bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          animation: `barFill 0.8s ease ${delay}ms both`,
          transformOrigin: 'left',
        }}
      />
      <style jsx>{`
        @keyframes barFill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}

function GradientBadge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`gradient-border-card inline-flex w-fit items-center px-3 py-1 text-xs font-semibold ${className}`}>
      <span className="relative z-10 gradient-text">{children}</span>
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <p className="shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">{children}</p>
      <div className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}

function QuickAction({
  href,
  heading,
  subtext,
  badge,
}: {
  href: string;
  heading: string;
  subtext: string;
  badge?: string;
}) {
  return (
    <Link href={href} className="glass-card group flex min-h-[160px] flex-col p-5 transition duration-200 hover:-translate-y-px">
      <div className="flex items-start justify-between gap-4">
        <span className="h-4 w-4 rounded-[4px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)' }} />
        {badge ? <span className="gradient-text text-xs font-bold">{badge}</span> : null}
      </div>
      <h3 className="mt-7 text-[15px] font-semibold text-black">{heading}</h3>
      <p className="mt-2 text-[13px] leading-5 text-[var(--text-secondary)]">{subtext}</p>
      <span className="mt-auto self-end text-xl font-semibold gradient-text">→</span>
    </Link>
  );
}
