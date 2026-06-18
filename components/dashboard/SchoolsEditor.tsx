'use client';

import { useMemo, useState } from 'react';

import {
  EmptyState,
  GlassButton,
  GradientBadge,
  LightDashboardFrame,
  PageHeader,
} from '@/components/dashboard/LightDashboardPrimitives';
import { supabaseClient } from '@/lib/supabase/client';

const suggestions = [
  'Harvard University',
  'Stanford University',
  'MIT',
  'Princeton University',
  'Yale University',
  'Columbia University',
  'University of Pennsylvania',
  'Brown University',
  'Cornell University',
  'Duke University',
  'UC Berkeley',
  'UCLA',
  'Carnegie Mellon University',
  'NYU',
];

export default function SchoolsEditor({ profileId, initialSchools }: { profileId: string; initialSchools: string[] }) {
  const [schools, setSchools] = useState<string[]>(initialSchools.slice(0, 5));
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [message, setMessage] = useState('');

  const matches = useMemo(() => suggestions
    .filter((school) => !schools.includes(school))
    .filter((school) => school.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6), [query, schools]);

  const persist = async (nextSchools: string[]) => {
    setSchools(nextSchools);
    const { error } = await (supabaseClient.from('profiles') as any)
      .update({ target_schools: nextSchools })
      .eq('id', profileId);
    setMessage(error ? 'Could not save schools yet.' : 'Saved.');
  };

  const addSchool = (school: string) => {
    const trimmed = school.trim();
    if (!trimmed || schools.includes(trimmed) || schools.length >= 5) return;
    setQuery('');
    persist([...schools, trimmed]);
  };

  return (
    <LightDashboardFrame maxWidth="800px">
      <PageHeader
        before="Your "
        gradient="target schools"
        subtext="See how your narrative benchmarks against admitted students."
      />

      <section className="gradient-border-card glass-card p-6">
        <h2 className="text-sm font-semibold text-black">Add a target school</h2>
        <div className="relative mt-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 140)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addSchool(query);
              }
            }}
            disabled={schools.length >= 5}
            className="spikd-liquid-input"
            placeholder={schools.length >= 5 ? 'Maximum 5 schools selected' : 'Search schools'}
          />
          {focused && matches.length && schools.length < 5 ? (
            <div className="glass-card absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden p-1">
              {matches.map((school) => (
                <button key={school} type="button" onMouseDown={() => addSchool(school)} className="w-full rounded-[10px] px-3 py-2 text-left text-sm font-medium text-black transition hover:bg-white/80">
                  {school}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-6 grid gap-4">
        {schools.length ? schools.map((school) => (
          <div key={school} className="glass-card relative grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <button type="button" onClick={() => persist(schools.filter((item) => item !== school))} className="absolute right-4 top-4 text-lg leading-none text-[var(--text-muted)] transition hover:text-red-500">x</button>
            <div>
              <h2 className="font-serif text-xl font-semibold text-black">{school}</h2>
              <p className="mt-2 text-[13px] text-[var(--text-secondary)]">Added today</p>
            </div>
            <div className="pr-8 text-right">
              <GradientBadge>Pro</GradientBadge>
              <p className="mt-2 text-[13px] text-[var(--text-muted)]">Upgrade to see your benchmark score</p>
            </div>
          </div>
        )) : (
          <EmptyState
            title="No schools added yet."
            copy="Add your target schools to benchmark your narrative."
            cta="+ Add a school"
            onClick={() => setFocused(true)}
          />
        )}
      </section>

      {message ? <p className="mt-4 text-sm font-medium text-[var(--text-muted)]">{message}</p> : null}
    </LightDashboardFrame>
  );
}
