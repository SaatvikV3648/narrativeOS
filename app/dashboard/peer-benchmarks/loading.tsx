import { DashboardDiamondLoading } from '@/components/dashboard/LightDashboardPrimitives';
import DashboardShell from '@/components/layout/DashboardShell';

export default function PeerBenchmarksLoading() {
  return (
    <DashboardShell>
      <DashboardDiamondLoading
        title="Loading your matches..."
        steps={['Matching your archetype', 'Finding similar profiles', 'Loading peer data']}
      />
    </DashboardShell>
  );
}
