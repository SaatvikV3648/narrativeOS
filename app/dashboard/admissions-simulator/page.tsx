import { GradientButton, LightDashboardFrame } from '@/components/dashboard/LightDashboardPrimitives';
import DashboardShell from '@/components/layout/DashboardShell';

export const dynamic = "force-dynamic";

export default function AdmissionsSimulatorPage() {
  return (
    <DashboardShell>
      <LightDashboardFrame maxWidth="600px">
        <section className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-[18px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)', animation: 'pulse-diamond 1.8s ease-in-out infinite' }} />
          <h1 className="mt-12 font-serif text-[32px] font-semibold tracking-[-0.03em] text-black">
            Coming <span className="gradient-text">soon</span>.
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-7 text-[var(--text-secondary)]">
            The Admissions Simulator is being built. Soon you will be able to simulate exactly how an admissions officer reads your application — signal by signal, doubt by doubt.
          </p>

          <div className="gradient-border-card mt-8 w-full max-w-[400px]">
            <div className="glass-card relative z-10 p-6 text-left">
              <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">What to expect</p>
              <div className="mt-5 grid gap-3">
                {[
                  'A simulated committee room read of your application',
                  'Signal by signal analysis of what AOs notice and question',
                  'Specific language admissions officers use when discussing profiles like yours',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm font-semibold leading-6 text-black">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-[3px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)' }} />
                    {item}
                  </div>
                ))}
              </div>
              <div className="my-5 h-px bg-[var(--border)]" />
              <p className="text-[13px] font-medium text-[var(--text-secondary)]">Get notified when it launches:</p>
              <input className="spikd-liquid-input mt-3 w-full" placeholder="Your email address" />
              <GradientButton className="mt-4 w-full">Notify me →</GradientButton>
              <p className="mt-3 text-center text-xs text-[var(--text-muted)]">No spam. One email when it ships.</p>
            </div>
          </div>
        </section>
      </LightDashboardFrame>
    </DashboardShell>
  );
}
