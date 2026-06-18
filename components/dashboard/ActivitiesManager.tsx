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
import type { Activities } from '@/lib/supabase/types';

type ActivityInput = {
  id: string;
  activity_name: string;
  role: string;
  years_involved: number;
  hours_per_week: number;
  description: string;
  biggest_achievement: string;
  created_at?: string;
};

const durationOptions = [
  { label: 'Under 6 months', value: 1 },
  { label: '6-12 months', value: 1 },
  { label: '1-2 years', value: 2 },
  { label: '3+ years', value: 3 },
];

const emptyActivity = (): ActivityInput => ({
  id: crypto.randomUUID(),
  activity_name: '',
  role: '',
  years_involved: 1,
  hours_per_week: 0,
  description: '',
  biggest_achievement: '',
});

function activityFromRow(activity: Activities): ActivityInput {
  return {
    id: activity.id,
    activity_name: activity.activity_name,
    role: activity.role,
    years_involved: activity.years_involved,
    hours_per_week: activity.hours_per_week,
    description: activity.description || '',
    biggest_achievement: activity.biggest_achievement || '',
    created_at: activity.created_at,
  };
}

function spikeTag(activity: ActivityInput) {
  const text = `${activity.activity_name} ${activity.role} ${activity.biggest_achievement}`.toLowerCase();
  if (text.includes('ai') || text.includes('machine')) return 'AI/ML';
  if (text.includes('research') || text.includes('paper')) return 'Research';
  if (text.includes('business') || text.includes('startup') || text.includes('finance')) return 'Business';
  if (text.includes('community') || text.includes('nonprofit')) return 'Impact';
  return 'Spike';
}

export default function ActivitiesManager({ profileId, initialActivities }: { profileId: string; initialActivities: Activities[] }) {
  const [activities, setActivities] = useState<ActivityInput[]>(initialActivities.map(activityFromRow));
  const [draft, setDraft] = useState<ActivityInput>(emptyActivity());
  const [editing, setEditing] = useState<ActivityInput | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [message, setMessage] = useState('');

  const saveActivity = async (activity: ActivityInput, isNew = false) => {
    if (!activity.activity_name.trim()) return;

    const optimistic = { ...activity, created_at: activity.created_at || new Date().toISOString() };
    if (isNew) {
      setActivities((current) => [optimistic, ...current].slice(0, 10));
      setDraft(emptyActivity());
      setShowAdd(false);
    } else {
      setActivities((current) => current.map((item) => (item.id === activity.id ? optimistic : item)));
      setEditing(null);
    }

    const row = {
      id: activity.id,
      profile_id: profileId,
      activity_name: activity.activity_name.trim(),
      role: activity.role.trim(),
      years_involved: activity.years_involved,
      hours_per_week: activity.hours_per_week,
      description: activity.description.trim() || null,
      biggest_achievement: activity.biggest_achievement.trim() || null,
      sort_order: isNew ? 0 : activities.findIndex((item) => item.id === activity.id),
    };

    const { error } = await supabaseClient.from('activities').upsert(row as any, { onConflict: 'id' });
    setMessage(error ? 'Could not save activity yet.' : 'Saved.');
  };

  const deleteActivity = async (activity: ActivityInput) => {
    setActivities((current) => current.filter((item) => item.id !== activity.id));
    const { error } = await supabaseClient.from('activities').delete().eq('id', activity.id).eq('profile_id', profileId);
    setMessage(error ? 'Could not delete activity yet.' : 'Deleted.');
  };

  return (
    <LightDashboardFrame maxWidth="800px">
      <PageHeader
        before="Your "
        gradient="activities"
        subtext="These are the building blocks of your spike."
        action={<GlassButton onClick={() => setShowAdd(true)}>+ Add activity</GlassButton>}
      />

      {showAdd ? (
        <div className="gradient-border-card glass-card mb-4 p-6">
          <ActivityForm
            activity={draft}
            setActivity={setDraft}
            submitLabel="Add activity"
            onCancel={() => setShowAdd(false)}
            onSubmit={() => saveActivity(draft, true)}
          />
        </div>
      ) : null}

      {activities.length ? (
        <div className="grid gap-4">
          {activities.map((activity) => (
            <div key={activity.id} className="glass-card border-l-[3px] border-l-transparent bg-[linear-gradient(white,white)_padding-box,linear-gradient(180deg,#667eea,#f64f59,#12c2e9)_border-box] p-6">
              {editing?.id === activity.id ? (
                <ActivityForm
                  activity={editing}
                  setActivity={setEditing}
                  submitLabel="Save changes"
                  onCancel={() => setEditing(null)}
                  onSubmit={() => editing && saveActivity(editing)}
                />
              ) : (
                <div className="grid gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-serif text-lg font-semibold text-black">{activity.activity_name || 'Untitled activity'}</h2>
                    <GradientBadge>{spikeTag(activity)}</GradientBadge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-[var(--text-secondary)]">{activity.role || 'No role yet'}</p>
                    <span className="rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-xs font-semibold text-black">{activity.years_involved}+ yrs</span>
                  </div>
                  <p className="text-[15px] font-semibold leading-7 text-black">{activity.biggest_achievement || 'Add a concrete achievement to strengthen this signal.'}</p>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs text-[var(--text-muted)]">Added {formatDate(activity.created_at)}</p>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setEditing(activity)} className="text-sm text-[var(--text-muted)] transition hover:text-black">Edit</button>
                      <button type="button" onClick={() => deleteActivity(activity)} className="text-sm text-[var(--text-muted)] transition hover:text-red-500">Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No activities yet."
          copy="Add your first activity to start building your spike."
          cta="+ Add your first activity"
          onClick={() => setShowAdd(true)}
        />
      )}

      {message ? <p className="mt-4 text-sm font-medium text-[var(--text-muted)]">{message}</p> : null}
    </LightDashboardFrame>
  );
}

function ActivityForm({
  activity,
  setActivity,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  activity: ActivityInput;
  setActivity: (activity: ActivityInput) => void;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="grid gap-4">
      <input className="spikd-liquid-input" value={activity.activity_name} onChange={(event) => setActivity({ ...activity, activity_name: event.target.value })} placeholder="Activity name" />
      <input className="spikd-liquid-input" value={activity.role} onChange={(event) => setActivity({ ...activity, role: event.target.value })} placeholder="Your role" />
      <div className="grid grid-cols-2 gap-2">
        {durationOptions.map((option) => (
          <button key={option.label} type="button" onClick={() => setActivity({ ...activity, years_involved: option.value })} className={`spikd-pill ${activity.years_involved === option.value ? 'spikd-pill-active' : ''}`}>
            {option.label}
          </button>
        ))}
      </div>
      <input className="spikd-liquid-input" value={activity.biggest_achievement} onChange={(event) => setActivity({ ...activity, biggest_achievement: event.target.value })} placeholder="Biggest achievement" />
      <div className="flex items-center justify-end gap-4">
        <button type="button" onClick={onCancel} className="gradient-text text-sm font-semibold">Cancel</button>
        <GradientButton onClick={onSubmit} className="h-10">{submitLabel}</GradientButton>
      </div>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return 'today';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
