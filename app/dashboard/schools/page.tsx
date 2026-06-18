import { redirect } from 'next/navigation';

import SchoolsEditor from '@/components/dashboard/SchoolsEditor';
import { GradientButton, LightDashboardFrame } from '@/components/dashboard/LightDashboardPrimitives';
import DashboardShell from '@/components/layout/DashboardShell';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Profiles } from '@/lib/supabase/types';

export const dynamic = "force-dynamic";

export default async function SchoolsPage() {
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
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Complete onboarding first so Spikd can save your target schools.</p>
          <GradientButton href="/onboarding" className="mt-8">Go to onboarding →</GradientButton>
        </LightDashboardFrame>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <SchoolsEditor profileId={profile.id} initialSchools={profile.target_schools || []} />
    </DashboardShell>
  );
}
