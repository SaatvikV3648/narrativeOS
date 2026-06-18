import { DashboardDiamondLoading } from '@/components/dashboard/LightDashboardPrimitives';
import DashboardShell from '@/components/layout/DashboardShell';

export default function SchoolsLoading() {
  return (
    <DashboardShell>
      <DashboardDiamondLoading title="Loading your spike..." steps={['Loading your schools', 'Fetching benchmark data', 'Preparing your comparison']} />
    </DashboardShell>
  );
}
