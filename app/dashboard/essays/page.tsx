import { redirect } from 'next/navigation';

import EssaysManager from '@/components/dashboard/EssaysManager';
import { LightDashboardFrame } from '@/components/dashboard/LightDashboardPrimitives';
import DashboardShell from '@/components/layout/DashboardShell';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Essays, Profiles } from '@/lib/supabase/types';

export default async function EssaysPage() {
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
          <p className="text-sm text-[var(--text-secondary)]">Complete onboarding before adding essays.</p>
        </LightDashboardFrame>
      </DashboardShell>
    );
  }

  const { data: essaysData } = await supabase
    .from('essays')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false });

  return (
    <DashboardShell>
      <EssaysManager profileId={profile.id} initialEssays={(essaysData as Essays[] | null) ?? []} />
    </DashboardShell>
  );
}
