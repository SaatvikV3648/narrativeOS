import Link from 'next/link';
import type { ReactNode } from 'react';

export function LightDashboardFrame({ children, maxWidth = '800px' }: { children: ReactNode; maxWidth?: string }) {
  return (
    <div className="onboarding-bg min-h-screen px-5 py-8 text-black sm:px-8">
      <div className="relative z-10 mx-auto" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}

export function PageHeader({
  before,
  gradient,
  after = '.',
  subtext,
  action,
}: {
  before: string;
  gradient: string;
  after?: string;
  subtext: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-serif text-[28px] font-semibold tracking-[-0.03em] text-black">
          {before}<span className="gradient-text">{gradient}</span>{after}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{subtext}</p>
      </div>
      {action}
    </header>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <p className="shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">{children}</p>
      <div className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}

export function GradientButton({
  children,
  onClick,
  href,
  disabled,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
}) {
  const classes = `inline-flex h-12 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)] bg-[length:200%_200%] px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 ${className}`;
  const style = { animation: 'shimmer 6s ease infinite' };
  if (href) {
    return <Link href={href} className={classes} style={style}>{children}</Link>;
  }
  return <button type="button" onClick={onClick} disabled={disabled} className={classes} style={style}>{children}</button>;
}

export function GlassButton({
  children,
  onClick,
  href,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}) {
  const classes = "glass-button inline-flex h-12 items-center justify-center px-5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60";
  if (href) return <Link href={href} className={classes}>{children}</Link>;
  return <button type="button" onClick={onClick} disabled={disabled} className={classes}>{children}</button>;
}

export function GradientBadge({ children }: { children: ReactNode }) {
  return (
    <span className="gradient-border-card inline-flex w-fit items-center px-3 py-1 text-xs font-semibold">
      <span className="relative z-10 gradient-text">{children}</span>
    </span>
  );
}

export function EmptyState({
  title,
  copy,
  cta,
  onClick,
}: {
  title: string;
  copy: string;
  cta?: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
      <div className="h-12 w-12 rounded-[10px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)', animation: 'pulse-diamond 1.8s ease-in-out infinite' }} />
      <h2 className="mt-8 font-serif text-xl font-semibold text-black">{title}</h2>
      <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">{copy}</p>
      {cta && onClick ? <GradientButton onClick={onClick} className="mt-8">{cta}</GradientButton> : null}
    </div>
  );
}

export function DashboardDiamondLoading({ title, steps }: { title: string; steps: string[] }) {
  return (
    <LightDashboardFrame>
      <div className="flex min-h-[620px] flex-col items-center justify-center text-center">
        <div className="h-20 w-20 rounded-[18px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" style={{ transform: 'rotate(45deg)', animation: 'pulse-diamond 1.8s ease-in-out infinite' }} />
        <h1 className="mt-12 font-serif text-[28px] font-semibold tracking-[-0.02em] text-black">{title}</h1>
        <div className="mt-8 grid gap-4 text-left">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3" style={{ animation: `stepFade 0.2s ease ${index * 600}ms both` }}>
              <span className="h-2 w-2 rounded-full bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)]" />
              <span className="text-sm font-medium text-black">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </LightDashboardFrame>
  );
}
