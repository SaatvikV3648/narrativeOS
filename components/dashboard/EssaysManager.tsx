'use client';

import { useState } from 'react';

import {
  EmptyState,
  GlassButton,
  GradientButton,
  LightDashboardFrame,
  PageHeader,
} from '@/components/dashboard/LightDashboardPrimitives';
import { supabaseClient } from '@/lib/supabase/client';
import type { Essays } from '@/lib/supabase/types';

type EssayInput = Essays;

const statuses = [
  { label: 'Not started', value: 'not_started' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Complete', value: 'complete' },
];

const emptyEssay = (profileId: string): EssayInput => ({
  id: crypto.randomUUID(),
  profile_id: profileId,
  prompt: '',
  school: '',
  word_limit: null,
  word_count: 0,
  status: 'not_started',
  last_edited: null,
  created_at: new Date().toISOString(),
});

export default function EssaysManager({ profileId, initialEssays }: { profileId: string; initialEssays: Essays[] }) {
  const [essays, setEssays] = useState<EssayInput[]>(initialEssays);
  const [draft, setDraft] = useState<EssayInput>(emptyEssay(profileId));
  const [showAdd, setShowAdd] = useState(false);
  const [message, setMessage] = useState('');

  const addEssay = async () => {
    if (!draft.prompt.trim()) return;
    const nextEssay = { ...draft, prompt: draft.prompt.trim(), last_edited: new Date().toISOString() };
    setEssays((current) => [nextEssay, ...current]);
    setDraft(emptyEssay(profileId));
    setShowAdd(false);

    const { error } = await (supabaseClient.from('essays') as any).insert({
      id: nextEssay.id,
      profile_id: profileId,
      prompt: nextEssay.prompt,
      school: nextEssay.school || null,
      word_limit: nextEssay.word_limit,
      word_count: nextEssay.word_count,
      status: nextEssay.status,
      last_edited: nextEssay.last_edited,
    });
    setMessage(error ? 'Could not save essay. Make sure the essays SQL has been run.' : 'Saved.');
  };

  const deleteEssay = async (essay: EssayInput) => {
    setEssays((current) => current.filter((item) => item.id !== essay.id));
    const { error } = await supabaseClient.from('essays').delete().eq('id', essay.id).eq('profile_id', profileId);
    setMessage(error ? 'Could not delete essay yet.' : 'Deleted.');
  };

  return (
    <LightDashboardFrame maxWidth="800px">
      <PageHeader
        before="Your "
        gradient="essays"
        subtext="Track your Common App and supplemental essays in one place."
        action={<GlassButton onClick={() => setShowAdd(true)}>+ Add essay</GlassButton>}
      />

      {showAdd ? (
        <div className="gradient-border-card glass-card mb-4 p-6">
          <div className="grid gap-4">
            <input className="spikd-liquid-input" value={draft.prompt} onChange={(event) => setDraft({ ...draft, prompt: event.target.value })} placeholder="Essay prompt or title" />
            <input className="spikd-liquid-input" value={draft.school || ''} onChange={(event) => setDraft({ ...draft, school: event.target.value })} placeholder="Leave blank for Common App" />
            <input className="spikd-liquid-input" type="number" value={draft.word_limit || ''} onChange={(event) => setDraft({ ...draft, word_limit: event.target.value ? Number(event.target.value) : null })} placeholder="Word limit" />
            <div className="grid grid-cols-3 gap-2">
              {statuses.map((status) => (
                <button key={status.value} type="button" onClick={() => setDraft({ ...draft, status: status.value })} className={`spikd-pill ${draft.status === status.value ? 'spikd-pill-active' : ''}`}>
                  {status.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-end gap-4">
              <button type="button" onClick={() => setShowAdd(false)} className="gradient-text text-sm font-semibold">Cancel</button>
              <GradientButton onClick={addEssay} className="h-10">Add essay</GradientButton>
            </div>
          </div>
        </div>
      ) : null}

      {essays.length ? (
        <div className="grid gap-4">
          {essays.map((essay) => (
            <div key={essay.id} className="glass-card p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-serif text-base font-semibold text-black">{essay.prompt}</h2>
                <StatusPill status={essay.status} />
              </div>
              <p className="mt-3 text-[13px] text-[var(--text-secondary)]">{essay.school || 'Common App'}</p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-[13px] text-[var(--text-muted)]">
                  {essay.word_count || 0} / {essay.word_limit || 650} words
                </p>
                <p className="text-xs text-[var(--text-muted)]">Last edited {essay.last_edited ? new Date(essay.last_edited).toLocaleDateString() : 'today'}</p>
              </div>
              <div className="mt-5 flex gap-2">
                <GlassButton>Edit</GlassButton>
                <GlassButton>View</GlassButton>
                <button type="button" onClick={() => deleteEssay(essay)} className="ml-auto text-sm text-[var(--text-muted)] transition hover:text-red-500">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No essays yet."
          copy="Add your essays to track progress across all your applications."
          cta="+ Add your first essay"
          onClick={() => setShowAdd(true)}
        />
      )}

      {message ? <p className="mt-4 text-sm font-medium text-[var(--text-muted)]">{message}</p> : null}
    </LightDashboardFrame>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === 'complete') {
    return <span className="rounded-full bg-[#f0fdf4] px-3 py-1 text-xs font-semibold text-[#16a34a]">Complete</span>;
  }
  if (status === 'in_progress') {
    return (
      <span className="gradient-border-card inline-flex px-3 py-1 text-xs font-semibold">
        <span className="relative z-10 gradient-text">In progress</span>
      </span>
    );
  }
  return <span className="rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">Not started</span>;
}
