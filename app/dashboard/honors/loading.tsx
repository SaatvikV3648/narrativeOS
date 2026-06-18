import { DashboardDiamondLoading } from '@/components/dashboard/LightDashboardPrimitives';
import DashboardShell from '@/components/layout/DashboardShell';

export default function HonorsLoading() {
  return (
    <DashboardShell>
      <DashboardDiamondLoading title="Loading your spike..." steps={['Loading your honors', 'Fetching recognition data', 'Preparing your awards']} />
    </DashboardShell>
  );
}
