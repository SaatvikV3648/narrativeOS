'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import Input from '@/components/ui/Input';
import TagInput from '@/components/ui/TagInput';
import Textarea from '@/components/ui/Textarea';
import { supabaseClient } from '@/lib/supabase/client';
import type { Activities, Profiles } from '@/lib/supabase/types';

type ActivityInput = {
  id: string;
  activity_name: string;
  role: string;
  years_involved: number;
  hours_per_week: number;
  description: string;
  biggest_achievement: string;
};

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
  };
}

export default function ProfileEditor({
  profile,
  initialActivities,
}: {
  profile: Profiles;
  initialActivities: Activities[];
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name);
  const [gradeYear, setGradeYear] = useState(profile.grade_year);
  const [intendedMajor, setIntendedMajor] = useState(profile.intended_major || '');
  const [targetSchools, setTargetSchools] = useState<string[]>(profile.target_schools || []);
  const [passionStatement, setPassionStatement] = useState(profile.passion_statement || '');
  const [activities, setActivities] = useState<ActivityInput[]>(
    initialActivities.length ? initialActivities.map(activityFromRow) : [emptyActivity()],
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const initialActivityIds = useMemo(() => new Set(initialActivities.map((activity) => activity.id)), [initialActivities]);

  const canAddActivity = activities.length < 10;
  const activitiesValid = useMemo(() => activities.every((activity) => activity.activity_name.trim() && activity.role.trim()), [activities]);
  const proofCount = activities.filter((activity) => activity.biggest_achievement.trim()).length;

  const setActivityField = (id: string, field: keyof ActivityInput, value: string | number) => {
    setActivities((current) => current.map((activity) => (
      activity.id === id ? { ...activity, [field]: value } : activity
    )));
  };

  const addActivity = () => {
    if (!canAddActivity || saving) return;
    setActivities((current) => [...current, emptyActivity()]);
  };

  const removeActivity = (id: string) => {
    if (saving) return;
    setActivities((current) => (current.length > 1 ? current.filter((activity) => activity.id !== id) : current));
  };

  const handleSave = async () => {
    if (saving) return;

    if (!fullName.trim()) {
      setError('Please enter your name.');
      setMessage('');
      return;
    }

    if (!activitiesValid) {
      setError('Every activity needs a name and role.');
      setMessage('');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const { error: profileError } = await (supabaseClient.from('profiles') as any)
        .update({
          full_name: fullName.trim(),
          grade_year: gradeYear,
          intended_major: intendedMajor.trim() || null,
          target_schools: targetSchools,
          passion_statement: passionStatement.trim() || null,
          activities_complete: true,
          onboarded: true,
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      const sanitizedActivities = activities.map((activity, index) => ({
        id: activity.id,
        profile_id: profile.id,
        activity_name: activity.activity_name.trim(),
        role: activity.role.trim(),
        years_involved: activity.years_involved,
        hours_per_week: activity.hours_per_week,
        description: activity.description.trim() || null,
        biggest_achievement: activity.biggest_achievement.trim() || null,
        sort_order: index,
      }));

      const { error: upsertError } = await supabaseClient.from('activities').upsert(sanitizedActivities as any, { onConflict: 'id' });
      if (upsertError) throw upsertError;

      const currentIds = new Set(activities.map((activity) => activity.id));
      const removedIds = [...initialActivityIds].filter((id) => !currentIds.has(id));

      if (removedIds.length) {
        const { error: deleteError } = await supabaseClient.from('activities').delete().eq('profile_id', profile.id).in('id', removedIds);
        if (deleteError) throw deleteError;
      }

      setMessage('Saved.');
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="onboarding-bg -m-6 min-h-screen p-5 font-sans text-black sm:-m-8 sm:p-8">
      <section className="glass-card mx-auto max-w-5xl p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Profile</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.04em] text-black">
              Refine your <span className="gradient-text">spike</span>.
            </h1>
          </div>
          <button type="button" onClick={handleSave} disabled={saving} className="h-12 rounded-[10px] bg-black px-6 text-sm font-semibold text-white transition duration-200 hover:-translate-y-px disabled:opacity-50">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Metric label="Grade" value={String(gradeYear)} />
          <Metric label="Major" value={intendedMajor || 'Unset'} />
          <Metric label="Schools" value={String(targetSchools.length)} />
          <Metric label="Proof" value={`${proofCount}/${activities.length}`} />
        </div>

        {message || error ? (
          <p className={`mt-5 rounded-[10px] border px-4 py-3 text-sm font-semibold ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {error || message}
          </p>
        ) : null}
      </section>

      <section className="mx-auto mt-6 grid max-w-5xl gap-6 lg:grid-cols-[0.72fr_1fr]">
        <div className="glass-card p-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-[-0.03em] text-black">Identity</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Keep the baseline accurate so each analysis reads the right story.</p>
          </div>
          <div className="mt-6 grid gap-4">
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" />
            <div className="grid gap-4 sm:grid-cols-2">
              <select value={gradeYear} onChange={(event) => setGradeYear(Number(event.target.value))} className="spikd-liquid-input">
                {[9, 10, 11, 12].map((year) => <option key={year} value={year}>{`Grade ${year}`}</option>)}
              </select>
              <Input value={intendedMajor} onChange={(event) => setIntendedMajor(event.target.value)} placeholder="Intended major" />
            </div>
            <TagInput value={targetSchools} onChange={setTargetSchools} label="Target schools" placeholder="Type a school and press Enter" hint="Press Enter or comma to add." />
            <details className="rounded-[16px] border border-[var(--border)] bg-white p-4">
              <summary className="cursor-pointer text-sm font-semibold text-black">Passion statement</summary>
              <Textarea className="mt-4" value={passionStatement} onChange={(event) => setPassionStatement(event.target.value)} placeholder="Optional: what problem, field, or community keeps pulling you back?" />
            </details>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h2 className="font-serif text-2xl font-semibold tracking-[-0.03em] text-black">Activities</h2>
            <button type="button" onClick={addActivity} disabled={!canAddActivity || saving} className="glass-button px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">
              + Add
            </button>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {activities.map((activity, index) => (
              <details key={activity.id}>
                <summary className="grid cursor-pointer list-none grid-cols-[34px_1fr_0.55fr_0.4fr] gap-3 px-5 py-4 transition hover:bg-[var(--bg-secondary)]">
                  <span className="text-sm font-semibold text-[var(--text-muted)]">{index + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-black">{activity.activity_name || 'Untitled activity'}</span>
                    <span className="mt-1 block truncate text-xs text-[var(--text-muted)]">{activity.role || 'No role'}</span>
                  </span>
                  <span className="text-sm text-[var(--text-secondary)]">{activity.years_involved} yrs</span>
                  <span className={activity.biggest_achievement ? 'text-sm font-semibold text-emerald-600' : 'text-sm text-[var(--text-muted)]'}>
                    {activity.biggest_achievement ? 'Proof' : 'Gap'}
                  </span>
                </summary>
                <div className="grid gap-4 border-t border-[var(--border)] bg-white p-5 sm:grid-cols-2">
                  <Input value={activity.activity_name} onChange={(event) => setActivityField(activity.id, 'activity_name', event.target.value)} placeholder="Activity name" />
                  <Input value={activity.role} onChange={(event) => setActivityField(activity.id, 'role', event.target.value)} placeholder="Role" />
                  <Input type="number" min={1} max={10} value={activity.years_involved} onChange={(event) => setActivityField(activity.id, 'years_involved', Number(event.target.value))} />
                  <Input type="number" min={0} max={168} value={activity.hours_per_week} onChange={(event) => setActivityField(activity.id, 'hours_per_week', Number(event.target.value))} />
                  <Textarea value={activity.description} onChange={(event) => setActivityField(activity.id, 'description', event.target.value)} placeholder="Description" />
                  <Textarea value={activity.biggest_achievement} onChange={(event) => setActivityField(activity.id, 'biggest_achievement', event.target.value)} placeholder="Biggest proof point" />
                  {activities.length > 1 ? (
                    <button type="button" onClick={() => removeActivity(activity.id)} disabled={saving} className="inline-flex w-fit items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">
                      Remove
                    </button>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[16px] border border-[var(--border)] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 truncate text-xl font-semibold tracking-[-0.03em] text-black">{value}</p>
    </div>
  );
}
