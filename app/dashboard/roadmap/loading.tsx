import { DashboardDiamondLoading } from '@/components/dashboard/LightDashboardPrimitives';
import DashboardShell from '@/components/layout/DashboardShell';

export default function RoadmapLoading() {
  return (
    <DashboardShell>
      <DashboardDiamondLoading
        title="Loading your roadmap..."
        steps={['Fetching your roadmap', 'Loading proof scores', 'Preparing your actions']}
      />
    </DashboardShell>
  );
}
