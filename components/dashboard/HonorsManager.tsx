'use client';

import { useState } from 'react';

import {
  EmptyState,
  GlassButton,
  GradientBadge,
  GradientButton,
  LightDashboardFrame,
  PageHeader,
} from '@/components/dashboard/LightDashboardPrimitives';
import { supabaseClient } from '@/lib/supabase/client';
import type { Honors } from '@/lib/supabase/types';

type HonorInput = Pick<Honors, 'id' | 'profile_id' | 'title' | 'issuer' | 'year' | 'level' | 'created_at'>;

const levels = ['Local', 'Regional', 'National', 'International'];

const emptyHonor = (profileId: string): HonorInput => ({
  id: crypto.randomUUID(),
  profile_id: profileId,
  title: '',
  issuer: '',
  year: null,
  level: 'Local',
  created_at: new Date().toISOString(),
});

export default function HonorsManager({ profileId, initialHonors }: { profileId: string; initialHonors: HonorInput[] }) {
  const [honors, setHonors] = useState<HonorInput[]>(initialHonors);
  const [draft, setDraft] = useState<HonorInput>(emptyHonor(profileId));
  const [showAdd, setShowAdd] = useState(false);
  const [message, setMessage] = useState('');

  const addHonor = async () => {
    if (!draft.title.trim()) return;
    const nextHonor = { ...draft, title: draft.title.trim() };
    setHonors((current) => [nextHonor, ...current]);
    setDraft(emptyHonor(profileId));
    setShowAdd(false);

    const { error } = await (supabaseClient.from('honors') as any)
      .insert({
        id: nextHonor.id,
        profile_id: profileId,
        title: nextHonor.title,
        issuer: nextHonor.issuer || null,
        year: nextHonor.year,
        level: nextHonor.level,
      });
    setMessage(error ? 'Could not save honor. Make sure the honors SQL has been run.' : 'Saved.');
  };

  const deleteHonor = async (honor: HonorInput) => {
    setHonors((current) => current.filter((item) => item.id !== honor.id));
    const { error } = await supabaseClient.from('honors').delete().eq('id', honor.id).eq('profile_id', profileId);
    setMessage(error ? 'Could not delete honor yet.' : 'Deleted.');
  };

  return (
    <LightDashboardFrame maxWidth="800px">
      <PageHeader
        before="Your "
        gradient="honors"
        subtext="External recognition is one of the strongest narrative signals."
        action={<GlassButton onClick={() => setShowAdd(true)}>+ Add honor</GlassButton>}
      />

      {showAdd ? (
        <div className="gradient-border-card glass-card mb-4 p-6">
          <div className="grid gap-4">
            <input className="spikd-liquid-input" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Honor title" />
            <input className="spikd-liquid-input" value={draft.issuer || ''} onChange={(event) => setDraft({ ...draft, issuer: event.target.value })} placeholder="e.g. College Board, NASA, DECA" />
            <input className="spikd-liquid-input" type="number" value={draft.year || ''} onChange={(event) => setDraft({ ...draft, year: event.target.value ? Number(event.target.value) : null })} placeholder="Year" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {levels.map((level) => (
                <button key={level} type="button" onClick={() => setDraft({ ...draft, level })} className={`spikd-pill ${draft.level === level ? 'spikd-pill-active' : ''}`}>
                  {level}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-end gap-4">
              <button type="button" onClick={() => setShowAdd(false)} className="gradient-text text-sm font-semibold">Cancel</button>
              <GradientButton onClick={addHonor} className="h-10">Add honor</GradientButton>
            </div>
          </div>
        </div>
      ) : null}

      {honors.length ? (
        <div className="grid gap-3">
          {honors.map((honor) => (
            <div key={honor.id} className="glass-card relative border-l-[3px] border-l-transparent bg-[linear-gradient(white,white)_padding-box,linear-gradient(180deg,#667eea,#f64f59,#12c2e9)_border-box] p-5">
              <button type="button" onClick={() => deleteHonor(honor)} className="absolute right-4 top-4 text-lg text-[var(--text-muted)] transition hover:text-red-500">x</button>
              <div className="grid gap-3 pr-8 sm:grid-cols-[1fr_auto] sm:items-start">
                <div>
                  <h2 className="font-serif text-base font-semibold text-black">{honor.title}</h2>
                  {honor.issuer ? <p className="mt-2 text-[13px] text-[var(--text-secondary)]">{honor.issuer}</p> : null}
                  {honor.year ? <p className="mt-1 text-xs text-[var(--text-muted)]">{honor.year}</p> : null}
                </div>
                {honor.level ? <GradientBadge>{honor.level}</GradientBadge> : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No honors added yet."
          copy="Add your awards and recognition to strengthen your narrative signal."
          cta="+ Add your first honor"
          onClick={() => setShowAdd(true)}
        />
      )}

      {message ? <p className="mt-4 text-sm font-medium text-[var(--text-muted)]">{message}</p> : null}
    </LightDashboardFrame>
  );
}
