import { createSupabaseServerClient } from '@/lib/supabase/server';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { redirect } from 'next/navigation';
import type { Profiles } from '@/lib/supabase/types';

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data } = userData.user
    ? await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };
  const profile = (data as Profiles | null) ?? null;

  if (profile?.onboarded) {
    redirect('/dashboard');
  }

  return (
    <main className="onboarding-bg min-h-screen text-black">
      <OnboardingFlow initialProfile={profile} />
    </main>
  );
}
