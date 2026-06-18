import { DashboardDiamondLoading } from '@/components/dashboard/LightDashboardPrimitives';
import DashboardShell from '@/components/layout/DashboardShell';

export default function NarrativeLoading() {
  return (
    <DashboardShell>
      <DashboardDiamondLoading title="Loading your spike..." steps={['Loading your archetype', 'Fetching narrative analysis', 'Preparing your signals']} />
    </DashboardShell>
  );
}
