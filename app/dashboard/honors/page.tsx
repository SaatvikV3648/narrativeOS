import { redirect } from 'next/navigation';

import HonorsManager from '@/components/dashboard/HonorsManager';
import { LightDashboardFrame } from '@/components/dashboard/LightDashboardPrimitives';
import DashboardShell from '@/components/layout/DashboardShell';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Honors, Profiles } from '@/lib/supabase/types';

export default async function HonorsPage() {
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
        <LightDashboardFrame>
          <p className="text-sm text-[var(--text-secondary)]">Complete onboarding before adding honors.</p>
        </LightDashboardFrame>
      </DashboardShell>
    );
  }

  const { data: honorsData } = await supabase
    .from('honors')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false });

  return (
    <DashboardShell>
      <HonorsManager profileId={profile.id} initialHonors={(honorsData as Honors[] | null) ?? []} />
    </DashboardShell>
  );
}
