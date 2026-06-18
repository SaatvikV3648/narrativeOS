'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';

import SpikdLogo from '@/components/brand/SpikdLogo';

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="onboarding-bg flex min-h-screen items-center justify-center px-5 py-12 font-sans text-black">
      <div className="relative z-10 w-full max-w-[440px]">
        {children}
      </div>
    </main>
  );
}

export function AuthCard({
  title,
  gradientWord,
  suffix = '',
  subtext,
  children,
}: {
  title: string;
  gradientWord: string;
  suffix?: string;
  subtext: string;
  children: ReactNode;
}) {
  return (
    <section className="glass-card p-10">
      <header>
        <SpikdLogo href="/" className="mb-8 text-[22px]" />
        <h1 className="font-serif text-[32px] font-bold leading-tight tracking-[-0.03em] text-black">
          {title}{' '}
          <span className="gradient-text">{gradientWord}</span>{suffix}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          {subtext}
        </p>
      </header>
      <div className="mt-8">
        {children}
      </div>
    </section>
  );
}

export function AuthTextInput({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`spikd-liquid-input ${className}`} />;
}

export function PasswordInput({
  value,
  onChange,
  placeholder,
  name,
  autoComplete,
}: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  name?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <AuthTextInput
        type={visible ? 'text' : 'password'}
        name={name}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        required
        minLength={6}
        placeholder={placeholder}
        className="pr-16"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--text-muted)] transition hover:text-black"
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

export function GradientAuthButton({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="h-12 w-full rounded-[10px] bg-[linear-gradient(135deg,#667eea,#f64f59,#12c2e9)] bg-[length:200%_200%] text-sm font-semibold text-white transition duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
      style={{ animation: 'shimmer 6s ease infinite' }}
    >
      {children}
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-[var(--border)]" />
      <span className="text-xs font-semibold text-[var(--text-muted)]">or</span>
      <div className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}

export function AuthSwitchLink({
  copy,
  href,
  label,
}: {
  copy: string;
  href: string;
  label: string;
}) {
  return (
    <p className="mt-5 text-center text-[13px] text-[var(--text-muted)]">
      {copy}{' '}
      <Link href={href} className="gradient-text font-semibold">
        {label}
      </Link>
    </p>
  );
}
