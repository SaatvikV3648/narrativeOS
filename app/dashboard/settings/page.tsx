import { redirect } from 'next/navigation';

import LogoutButton from '@/components/auth/LogoutButton';
import { LightDashboardFrame, PageHeader, SectionLabel } from '@/components/dashboard/LightDashboardPrimitives';
import DashboardShell from '@/components/layout/DashboardShell';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect('/login');
  }

  return (
    <DashboardShell>
      <LightDashboardFrame maxWidth="720px">
        <PageHeader
          before="Account "
          gradient="settings"
          subtext="Manage the basics for your Spikd workspace."
        />

        <section className="glass-card p-6">
          <SectionLabel>Signed In</SectionLabel>
          <div className="mt-5 rounded-[14px] border border-[var(--border)] bg-white px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Email</p>
            <p className="mt-2 break-words text-sm font-semibold text-black">
              {userData.user.email || 'No email available'}
            </p>
          </div>
        </section>

        <section className="glass-card mt-4 p-6">
          <SectionLabel>Session</SectionLabel>
          <div className="mt-5 max-w-sm">
            <LogoutButton />
          </div>
        </section>
      </LightDashboardFrame>
    </DashboardShell>
  );
}
