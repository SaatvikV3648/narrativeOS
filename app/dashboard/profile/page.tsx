import Link from 'next/link';
import { ArrowRight, CircleAlert } from 'lucide-react';
import { redirect } from 'next/navigation';

import ProfileEditor from '@/components/dashboard/ProfileEditor';
import DashboardShell from '@/components/layout/DashboardShell';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Activities, Profiles } from '@/lib/supabase/types';

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect('/login');
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  const profile = profileData as Profiles | null;

  if (profileError || !profile) {
    return (
      <DashboardShell>
        <section className="spikd-card p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-amber-400">
            <CircleAlert className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-zinc-50">No profile found yet.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">
            Complete onboarding first so Spikd can create your editable profile and activities.
          </p>
          <Link
            href="/onboarding"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-zinc-50 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-white"
          >
            Go to onboarding
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </DashboardShell>
    );
  }

  const { data: activityData } = await supabase
    .from('activities')
    .select('*')
    .eq('profile_id', profile.id)
    .order('sort_order', { ascending: true });

  const activities = (activityData as Activities[] | null) ?? [];

  return (
    <DashboardShell>
      <ProfileEditor profile={profile} initialActivities={activities} />
    </DashboardShell>
  );
}
