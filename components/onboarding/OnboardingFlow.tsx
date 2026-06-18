'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { supabaseClient } from '@/lib/supabase/client';
import type { Activities, Honors, Profiles } from '@/lib/supabase/types';

type ActivityInput = {
  id: string;
  activity_name: string;
  role: string;
  years_involved: number;
  hours_per_week: number;
  description: string;
  biggest_achievement: string;
};

const grades = [
  { label: 'Freshman', value: 9 },
  { label: 'Sophomore', value: 10 },
  { label: 'Junior', value: 11 },
  { label: 'Senior', value: 12 },
];

const durationOptions = [
  { label: 'Under 6 months', value: 1 },
  { label: '6-12 months', value: 1 },
  { label: '1-2 years', value: 2 },
  { label: '3+ years', value: 3 },
];

const majorSuggestions = [
  'Computer Science',
  'Business',
  'Finance',
  'Economics',
  'Data Science',
  'Engineering',
  'Biology',
  'Neuroscience',
  'Political Science',
  'Psychology',
  'Mathematics',
  'Pre-Med',
  'Design',
  'Public Policy',
];

const schoolSuggestions = [
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
  'Georgia Tech',
  'USC',
  'University of Michigan',
];

const loadingSteps = [
  'Identifying your archetype',
  'Scoring narrative coherence',
  'Finding your key signals',
  'Detecting your story gap',
  'Building your spike profile',
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

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

export default function OnboardingFlow({ initialProfile }: { initialProfile: Partial<Profiles> | null }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profileId, setProfileId] = useState<string | null>(initialProfile?.id || null);
  const [firstName, setFirstName] = useState((initialProfile?.full_name || '').split(' ')[0] || '');
  const [gradeYear, setGradeYear] = useState(initialProfile?.grade_year || 11);
  const [intendedMajor, setIntendedMajor] = useState(initialProfile?.intended_major || '');
  const [majorFocused, setMajorFocused] = useState(false);
  const [targetSchools, setTargetSchools] = useState<string[]>((initialProfile?.target_schools || []).slice(0, 5));
  const [schoolQuery, setSchoolQuery] = useState('');
  const [schoolFocused, setSchoolFocused] = useState(false);
  const [activities, setActivities] = useState<ActivityInput[]>([emptyActivity()]);
  const [honors, setHonors] = useState<Pick<Honors, 'id' | 'title'>[]>(
    (initialProfile?.awards || []).map((title) => ({ id: `profile-${title}`, title })),
  );
  const [awardInput, setAwardInput] = useState('');
  const [passionStatement, setPassionStatement] = useState(initialProfile?.passion_statement || '');
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [loadingActivities, setLoadingActivities] = useState(Boolean(initialProfile?.id));
  const [savingAward, setSavingAward] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profileId) return;

    let cancelled = false;
    const currentProfileId = profileId;

    async function loadActivities() {
      setLoadingActivities(true);
      try {
        const { data } = await supabaseClient
          .from('activities')
          .select('*')
          .eq('profile_id', currentProfileId)
          .order('sort_order', { ascending: true });

        if (!cancelled && data?.length) {
          const rows = data as Activities[];
          setActivities(rows.map((activity) => ({
            id: activity.id,
            activity_name: activity.activity_name,
            role: activity.role,
            years_involved: activity.years_involved,
            hours_per_week: activity.hours_per_week,
            description: activity.description || '',
            biggest_achievement: activity.biggest_achievement || '',
          })));
        }
      } catch {
        setError('Could not load your saved activities yet. You can continue editing and save again.');
      } finally {
        if (!cancelled) setLoadingActivities(false);
      }
    }

    loadActivities();

    return () => {
      cancelled = true;
    };
  }, [profileId]);

  useEffect(() => {
    if (!profileId) return;

    let cancelled = false;
    const currentProfileId = profileId;

    async function loadHonors() {
      const { data, error: honorsError } = await supabaseClient
        .from('honors')
        .select('id,title')
        .eq('profile_id', currentProfileId)
        .order('created_at', { ascending: true });

      if (cancelled) return;
      if (honorsError) {
        setError('Could not load saved awards yet.');
        return;
      }

      if (data) {
        setHonors(data as Pick<Honors, 'id' | 'title'>[]);
      }
    }

    loadHonors();

    return () => {
      cancelled = true;
    };
  }, [profileId]);

  useEffect(() => {
    if (!saving) {
      setLoadingIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingIndex((current) => Math.min(current + 1, loadingSteps.length));
    }, 600);

    return () => window.clearInterval(interval);
  }, [saving]);

  const majorMatches = useMemo(() => (
    majorSuggestions
      .filter((major) => major.toLowerCase().includes(intendedMajor.toLowerCase()))
      .slice(0, 6)
  ), [intendedMajor]);

  const schoolMatches = useMemo(() => (
    schoolSuggestions
      .filter((school) => !targetSchools.includes(school))
      .filter((school) => school.toLowerCase().includes(schoolQuery.toLowerCase()))
      .slice(0, 6)
  ), [schoolQuery, targetSchools]);

  const canAddActivity = activities.length < 10;
  const activitiesValid = useMemo(
    () => activities.every((activity) => activity.activity_name.trim() && activity.role.trim()),
    [activities],
  );
  const progress = `${((Math.min(step, 5) + 1) / 6) * 100}%`;

  const setActivityField = (id: string, field: keyof ActivityInput, value: string | number) => {
    setActivities((current) => current.map((activity) => (
      activity.id === id ? { ...activity, [field]: value } : activity
    )));
  };

  const addActivity = () => {
    if (!canAddActivity) return;
    const nextActivity = emptyActivity();
    setActivities((current) => [...current, nextActivity]);
    setActiveActivityId(nextActivity.id);
  };

  const removeActivity = (id: string) => {
    setActivities((current) => (current.length > 1 ? current.filter((activity) => activity.id !== id) : current));
  };

  const addSchool = (school: string) => {
    const trimmed = school.trim();
    if (!trimmed || targetSchools.includes(trimmed) || targetSchools.length >= 5) return;
    setTargetSchools((current) => [...current, trimmed]);
    setSchoolQuery('');
  };

  const syncAwardsColumn = async (currentProfileId: string, titles: string[]) => {
    await (supabaseClient.from('profiles') as any)
      .update({ awards: titles })
      .eq('id', currentProfileId);
  };

  const addAward = async (award: string) => {
    const trimmed = award.trim();
    if (!trimmed || honors.some((item) => item.title.toLowerCase() === trimmed.toLowerCase()) || savingAward) return;

    setSavingAward(true);
    setError('');

    try {
      const currentProfileId = profileId || await saveProfile();
      const { data, error: insertHonorError } = await (supabaseClient.from('honors') as any)
        .insert({
          profile_id: currentProfileId,
          title: trimmed,
        })
        .select('id,title')
        .single();

      if (insertHonorError) throw insertHonorError;

      const savedHonor = data as Pick<Honors, 'id' | 'title'>;
      const nextHonors = [...honors, savedHonor];
      setHonors(nextHonors);
      setAwardInput('');
      await syncAwardsColumn(currentProfileId, nextHonors.map((item) => item.title));
    } catch (awardError) {
      setError(getErrorMessage(awardError, 'Could not save that award yet.'));
    } finally {
      setSavingAward(false);
    }
  };

  const removeAward = async (honor: Pick<Honors, 'id' | 'title'>) => {
    if (savingAward) return;

    setSavingAward(true);
    setError('');

    try {
      const nextHonors = honors.filter((item) => item.id !== honor.id);

      if (!honor.id.startsWith('profile-')) {
        const { error: deleteHonorError } = await supabaseClient
          .from('honors')
          .delete()
          .eq('id', honor.id);

        if (deleteHonorError) throw deleteHonorError;
      }

      setHonors(nextHonors);
      if (profileId) await syncAwardsColumn(profileId, nextHonors.map((item) => item.title));
    } catch (awardError) {
      setError(getErrorMessage(awardError, 'Could not remove that award yet.'));
    } finally {
      setSavingAward(false);
    }
  };

  const goBack = () => {
    if (saving) return;
    setError('');
    if (step === 0) {
      router.push('/');
      return;
    }
    setStep((current) => current - 1);
  };

  const goNext = () => {
    if (step === 0 && !firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    if (step === 0 && !intendedMajor.trim()) {
      setError('Please choose or enter an intended major.');
      return;
    }
    if (step === 1 && targetSchools.length < 1) {
      setError('Add at least one target school.');
      return;
    }
    if (step === 2 && !activitiesValid) {
      setError('Each activity needs a name and role.');
      return;
    }

    setError('');
    setStep((current) => Math.min(current + 1, 4));
  };

  const saveProfile = async () => {
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData?.user) {
      throw userError || new Error('No signed-in user found.');
    }

    const profileData = {
      user_id: userData.user.id,
      full_name: firstName.trim(),
      grade_year: gradeYear,
      intended_major: intendedMajor.trim(),
      target_schools: targetSchools,
      awards: honors.map((honor) => honor.title),
      passion_statement: passionStatement.trim(),
      onboarded: false,
      activities_complete: false,
    };

    const { data: savedProfileData, error: saveError } = await (supabaseClient.from('profiles') as any)
      .upsert(profileData, { onConflict: 'user_id' })
      .select('id')
      .single();

    if (saveError) throw saveError;

    const savedProfile = savedProfileData as { id: string } | null;
    if (!savedProfile?.id) throw new Error('Profile saved, but no profile id was returned.');

    setProfileId(savedProfile.id);
    return savedProfile.id;
  };

  const handleComplete = async () => {
    if (!passionStatement.trim()) {
      setError('Write a short passion statement before revealing your spike.');
      return;
    }

    setError('');
    setSaving(true);
    setStep(5);

    try {
      const savedProfileId = await saveProfile();
      const sanitizedActivities = activities.map((activity, index) => ({
        profile_id: savedProfileId,
        activity_name: activity.activity_name.trim(),
        role: activity.role.trim(),
        years_involved: activity.years_involved,
        hours_per_week: activity.hours_per_week,
        description: activity.description.trim() || null,
        biggest_achievement: activity.biggest_achievement.trim() || null,
        sort_order: index,
      }));

      const { error: deleteError } = await supabaseClient
        .from('activities')
        .delete()
        .eq('profile_id', savedProfileId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabaseClient
        .from('activities')
        .insert(sanitizedActivities as any);

      if (insertError) throw insertError;

      const { error: completeError } = await (supabaseClient.from('profiles') as any)
        .update({ activities_complete: true, onboarded: true })
        .eq('id', savedProfileId);

      if (completeError) throw completeError;

      router.replace('/dashboard');
      router.refresh();
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Could not save onboarding. Please try again.'));
      setStep(4);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen px-5 py-5 font-sans text-[var(--text-primary)] sm:px-8">
      <div className="fixed left-0 top-0 z-30 h-0.5 w-full bg-[var(--border)]">
        <div className="h-full bg-[linear-gradient(90deg,#667eea,#f64f59,#12c2e9)] transition-all duration-200 ease-out" style={{ width: progress }} />
      </div>

      <button
        type="button"
        onClick={goBack}
        disabled={saving}
        className="absolute left-5 top-8 z-20 text-sm font-medium text-[var(--text-muted)] transition duration-200 hover:text-black disabled:opacity-40 sm:left-8"
      >
        Back
      </button>

      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col justify-center py-16">
        <div key={step} className="animate-step-fade">
          {step === 0 ? (
            <StepShell
              title={<><span>Let&apos;s build your </span><span className="gradient-text">spike</span><span>.</span></>}
              subtext="We'll analyze what story your application is already telling - and what's missing."
            >
              <div className="grid gap-4">
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="spikd-liquid-input"
                  placeholder="First name"
                />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {grades.map((grade) => (
                    <button
                      key={grade.value}
                      type="button"
                      onClick={() => setGradeYear(grade.value)}
                      className={`spikd-pill ${gradeYear === grade.value ? 'spikd-pill-active' : ''}`}
                    >
                      {grade.label}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    value={intendedMajor}
                    onChange={(event) => setIntendedMajor(event.target.value)}
                    onFocus={() => setMajorFocused(true)}
                    onBlur={() => window.setTimeout(() => setMajorFocused(false), 140)}
                    className="spikd-liquid-input"
                    placeholder="Intended major"
                  />
                  {majorFocused && majorMatches.length ? (
                    <div className="glass-card absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden p-1">
                      {majorMatches.map((major) => (
                        <button
                          key={major}
                          type="button"
                          onMouseDown={() => setIntendedMajor(major)}
                          className="w-full rounded-[10px] px-3 py-2 text-left text-sm font-medium text-black transition hover:bg-white/80"
                        >
                          {major}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <BlackButton onClick={goNext}>Start building -&gt;</BlackButton>
            </StepShell>
          ) : null}

          {step === 1 ? (
            <StepShell
              title={<><span>Where are you </span><span className="gradient-text">aiming</span><span>?</span></>}
              subtext="We'll benchmark your narrative against real admitted students at these schools."
            >
              <div className="grid gap-4">
                <div className="relative">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-[var(--text-muted)] after:absolute after:-bottom-1 after:-right-1 after:h-1.5 after:w-1.5 after:rotate-45 after:bg-[var(--text-muted)]" />
                    <input
                      value={schoolQuery}
                      onChange={(event) => setSchoolQuery(event.target.value)}
                      onFocus={() => setSchoolFocused(true)}
                      onBlur={() => window.setTimeout(() => setSchoolFocused(false), 140)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addSchool(schoolQuery);
                        }
                      }}
                      className="spikd-liquid-input pl-10"
                      placeholder={targetSchools.length >= 5 ? 'Maximum 5 schools selected' : 'Search target schools'}
                      disabled={targetSchools.length >= 5}
                    />
                  </div>
                  {schoolFocused && schoolMatches.length && targetSchools.length < 5 ? (
                    <div className="glass-card absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden p-1">
                      {schoolMatches.map((school) => (
                        <button
                          key={school}
                          type="button"
                          onMouseDown={() => addSchool(school)}
                          className="w-full rounded-[10px] px-3 py-2 text-left text-sm font-medium text-black transition hover:bg-white/80"
                        >
                          {school}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {targetSchools.map((school) => (
                    <Pill key={school} onRemove={() => setTargetSchools((current) => current.filter((item) => item !== school))}>
                      {school}
                    </Pill>
                  ))}
                </div>
              </div>
              <BlackButton onClick={goNext}>Continue -&gt;</BlackButton>
            </StepShell>
          ) : null}

          {step === 2 ? (
            <StepShell
              title={<><span>What have you been </span><span className="gradient-text">building</span><span>?</span></>}
              subtext="Be specific. Vague inputs get vague analysis."
            >
              {loadingActivities ? <p className="text-sm text-[var(--text-muted)]">Loading saved activities...</p> : null}
              <div className="grid gap-3">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`glass-card relative p-4 transition duration-200 ${activeActivityId === activity.id ? 'gradient-border-card' : ''}`}
                    onFocus={() => setActiveActivityId(activity.id)}
                  >
                    {activities.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeActivity(activity.id)}
                        className="absolute right-3 top-3 text-xl leading-none text-[var(--text-muted)] transition hover:text-black"
                        aria-label={`Delete activity ${index + 1}`}
                      >
                        x
                      </button>
                    ) : null}
                    <div className="grid gap-3 pr-7">
                      <input
                        value={activity.activity_name}
                        onChange={(event) => setActivityField(activity.id, 'activity_name', event.target.value)}
                        className="spikd-liquid-input"
                        placeholder="Activity name"
                      />
                      <input
                        value={activity.role}
                        onChange={(event) => setActivityField(activity.id, 'role', event.target.value)}
                        className="spikd-liquid-input"
                        placeholder="Your role"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        {durationOptions.map((duration) => (
                          <button
                            key={duration.label}
                            type="button"
                            onClick={() => setActivityField(activity.id, 'years_involved', duration.value)}
                            className={`spikd-pill ${activity.years_involved === duration.value && (duration.value !== 1 || duration.label === '6-12 months') ? 'spikd-pill-active' : ''}`}
                          >
                            {duration.label}
                          </button>
                        ))}
                      </div>
                      <input
                        value={activity.biggest_achievement}
                        onChange={(event) => setActivityField(activity.id, 'biggest_achievement', event.target.value)}
                        className="spikd-liquid-input"
                        placeholder="e.g. grew to 400 users, won state competition, published paper - this is the most important field"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addActivity}
                  disabled={!canAddActivity}
                  className="rounded-[16px] border border-dashed border-[var(--border-hover)] bg-white/45 py-6 text-sm font-semibold text-black transition duration-200 hover:-translate-y-px hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="mr-2 text-lg">+</span>
                  Add activity
                </button>
              </div>
              <BlackButton onClick={goNext}>Continue -&gt;</BlackButton>
            </StepShell>
          ) : null}

          {step === 3 ? (
            <StepShell
              title="What have you earned?"
              subtext="External recognition is one of the strongest narrative signals."
            >
              <div className="grid gap-3">
                <input
                  value={awardInput}
                  onChange={(event) => setAwardInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addAward(awardInput);
                    }
                  }}
                  className="spikd-liquid-input"
                  placeholder="Type an award or honor and hit Enter"
                />
                <div className="flex flex-wrap gap-2">
                  {honors.map((honor) => (
                    <Pill key={honor.id} onRemove={() => removeAward(honor)}>
                      {honor.title}
                    </Pill>
                  ))}
                </div>
                <p className="text-sm leading-6 text-[var(--text-muted)]">
                  e.g. USACO Gold, Regeneron STS, NHS, Team Captain
                </p>
              </div>
              <BlackButton onClick={goNext}>Continue -&gt;</BlackButton>
            </StepShell>
          ) : null}

          {step === 4 ? (
            <StepShell
              title={<><span>In </span><span className="gradient-text">your own words</span><span>.</span></>}
              subtext="What are you most obsessed with right now? Don't perform. Just say it."
            >
              <div className="relative">
                <textarea
                  value={passionStatement}
                  maxLength={400}
                  onChange={(event) => setPassionStatement(event.target.value)}
                  className="spikd-liquid-input min-h-[170px] resize-none py-3"
                  placeholder="e.g. I'm obsessed with how AI can accelerate drug discovery. I run a podcast and I'm building a protein folding tool..."
                />
                <span className="absolute bottom-3 right-3 text-xs font-medium text-[var(--text-muted)]">
                  {passionStatement.length}/400
                </span>
              </div>
              <button
                type="button"
                onClick={handleComplete}
                disabled={saving}
                className="mt-8 h-[52px] w-full rounded-[10px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)] bg-[length:200%_200%] text-sm font-semibold text-white transition duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                style={{ animation: 'shimmer 6s ease infinite' }}
              >
                Reveal my spike -&gt;
              </button>
            </StepShell>
          ) : null}

          {step === 5 ? (
            <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
              <div className="h-20 w-20 rounded-[18px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)', animation: 'pulse-diamond 1.8s ease-in-out infinite' }} />
              <h1 className="mt-12 font-serif text-[28px] font-semibold tracking-[-0.02em] text-black">
                Reading your story...
              </h1>
              <div className="mt-8 grid gap-4 text-left">
                {loadingSteps.map((label, index) => {
                  const complete = index <= loadingIndex;
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${complete ? 'bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]' : 'bg-[var(--border)]'}`} />
                      <span className={`text-sm font-medium ${complete ? 'text-black' : 'text-[var(--text-muted)]'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StepShell({
  title,
  subtext,
  children,
}: {
  title: ReactNode;
  subtext: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div>
        <h1 className="font-serif text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-black">
          {title}
        </h1>
        <p className="mt-5 text-[15px] leading-7 text-[var(--text-secondary)]">
          {subtext}
        </p>
      </div>
      <div className="mt-12">
        {children}
      </div>
    </section>
  );
}

function BlackButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative mt-8 h-12 w-full overflow-hidden rounded-[10px] bg-black text-sm font-semibold text-white transition duration-200 before:absolute before:inset-0 before:rounded-[10px] before:border before:border-transparent before:opacity-0 before:transition before:duration-200 hover:-translate-y-px hover:before:border-white/30 hover:before:opacity-100"
    >
      {children}
    </button>
  );
}

function Pill({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <span className="gradient-border-card inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-black">
      <span className="relative z-10">{children}</span>
      <button type="button" onClick={onRemove} className="relative z-10 text-[var(--text-muted)] transition hover:text-black">
        x
      </button>
    </span>
  );
}
