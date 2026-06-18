import { DashboardDiamondLoading } from '@/components/dashboard/LightDashboardPrimitives';
import DashboardShell from '@/components/layout/DashboardShell';

export default function EssaysLoading() {
  return (
    <DashboardShell>
      <DashboardDiamondLoading title="Loading your spike..." steps={['Loading your essays', 'Fetching your prompts', 'Preparing your workspace']} />
    </DashboardShell>
  );
}
