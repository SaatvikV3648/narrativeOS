import DashboardShell from '@/components/layout/DashboardShell';

const loadingSteps = [
  'Fetching your narrative score',
  'Loading spike progress',
  'Building your overview',
];

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <main className="onboarding-bg flex min-h-screen items-center justify-center px-5 py-8 text-black">
        <div className="relative z-10 text-center">
          <div className="mx-auto h-20 w-20 rounded-[18px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)', animation: 'pulse-diamond 1.8s ease-in-out infinite' }} />
          <h1 className="mt-12 font-serif text-[28px] font-semibold tracking-[-0.02em] text-black">
            Loading your spike...
          </h1>
          <div className="mt-8 grid gap-4 text-left">
            {loadingSteps.map((label, index) => (
              <div key={label} className="flex items-center gap-3" style={{ animation: `stepFade 0.2s ease ${index * 600}ms both` }}>
                <span className="h-2 w-2 rounded-full bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" />
                <span className="text-sm font-medium text-black">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
