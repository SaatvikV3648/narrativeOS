import { DashboardDiamondLoading } from '@/components/dashboard/LightDashboardPrimitives';
import DashboardShell from '@/components/layout/DashboardShell';

export default function ActivitiesLoading() {
  return (
    <DashboardShell>
      <DashboardDiamondLoading title="Loading your spike..." steps={['Loading your activities', 'Calculating spike tags', 'Preparing your profile']} />
    </DashboardShell>
  );
}
