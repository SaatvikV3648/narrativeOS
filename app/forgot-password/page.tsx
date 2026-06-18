'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';

import {
  AuthCard,
  AuthPageShell,
  AuthTextInput,
  GradientAuthButton,
} from '@/components/auth/AuthShell';
import { supabaseClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    setStatus(error ? error.message : 'Check your email for the reset link.');
    setLoading(false);
  };

  return (
    <AuthPageShell>
      <AuthCard
        title="Reset your"
        gradientWord="password"
        suffix="."
        subtext="Enter your email and we'll send you a reset link."
      >
        <form className="grid gap-[14px]" onSubmit={handleSubmit}>
          <AuthTextInput
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="Email address"
          />
          <div className="mt-[18px]">
            <GradientAuthButton disabled={loading || !email}>
              {loading ? 'Sending...' : 'Send reset link →'}
            </GradientAuthButton>
          </div>
        </form>

        {status ? (
          <p className="mt-5 rounded-[10px] border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            {status}
          </p>
        ) : null}

        <div className="mt-6 text-center">
          <Link href="/login" className="gradient-text text-sm font-semibold">
            ← Back to sign in
          </Link>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
}
