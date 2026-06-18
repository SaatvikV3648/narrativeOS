'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import {
  AuthCard,
  AuthDivider,
  AuthPageShell,
  AuthSwitchLink,
  AuthTextInput,
  GradientAuthButton,
  PasswordInput,
} from '@/components/auth/AuthShell';
import { supabaseClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const routeAfterAuth = async (userId: string) => {
    const { data: profileData } = await supabaseClient
      .from('profiles')
      .select('onboarded')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const profile = profileData as { onboarded: boolean } | null;

    router.replace(profile?.onboarded ? '/dashboard' : '/onboarding');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus(error.message || 'Unable to sign in. Please check your email and password.');
      setLoading(false);
      return;
    }

    if (data.user) {
      await routeAfterAuth(data.user.id);
      return;
    }

    setStatus('Signed in, but we could not load your account. Please try again.');
    setLoading(false);
  };

  return (
    <AuthPageShell>
      <AuthCard
        title="Welcome"
        gradientWord="back"
        suffix="."
        subtext="Sign in to continue building your spike."
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
          <div>
            <PasswordInput
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete="current-password"
            />
            <div className="mt-2 text-right">
              <Link href="/forgot-password" className="text-xs font-semibold text-[var(--text-muted)] transition hover:text-black">
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="mt-[18px]">
            <GradientAuthButton disabled={loading || !email || !password}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </GradientAuthButton>
          </div>
        </form>

        {status ? (
          <p className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {status}
          </p>
        ) : null}

        <AuthSwitchLink copy="Don't have an account?" href="/signup" label="Create one" />
        <AuthDivider />
        <GoogleSignInButton />
      </AuthCard>
    </AuthPageShell>
  );
}
