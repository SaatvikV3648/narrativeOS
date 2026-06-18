import { redirect } from 'next/navigation';

import ActivitiesManager from '@/components/dashboard/ActivitiesManager';
import { LightDashboardFrame, GradientButton } from '@/components/dashboard/LightDashboardPrimitives';
import DashboardShell from '@/components/layout/DashboardShell';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Activities, Profiles } from '@/lib/supabase/types';

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) redirect('/login');

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  const profile = profileData as Profiles | null;

  if (profileError || !profile) {
    return (
      <DashboardShell>
        <LightDashboardFrame>
          <h1 className="font-serif text-2xl font-semibold text-black">No profile found yet.</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Complete onboarding first so your activities can attach to your saved profile.</p>
          <GradientButton href="/onboarding" className="mt-8">Go to onboarding →</GradientButton>
        </LightDashboardFrame>
      </DashboardShell>
    );
  }

  const { data: activityData } = await supabase
    .from('activities')
    .select('*')
    .eq('profile_id', profile.id)
    .order('sort_order', { ascending: true });

  return (
    <DashboardShell>
      <ActivitiesManager profileId={profile.id} initialActivities={(activityData as Activities[] | null) ?? []} />
    </DashboardShell>
  );
}
