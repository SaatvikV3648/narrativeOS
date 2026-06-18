'use client';

import { useState, type FormEvent } from 'react';
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

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    setStatus('');

    if (password !== confirmPassword) {
      setStatus('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      setStatus(error.message || 'Unable to create account. Please try again.');
      setLoading(false);
      return;
    }

    if (data.user) {
      await routeAfterAuth(data.user.id);
      return;
    }

    setStatus('Account created, but we could not start your session. Please sign in.');
    setLoading(false);
  };

  return (
    <AuthPageShell>
      <AuthCard
        title="Create your"
        gradientWord="account"
        subtext="Start building your spike today."
      >
        <form className="grid gap-[14px]" onSubmit={handleSubmit}>
          <AuthTextInput
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            autoComplete="name"
            placeholder="Full name"
          />
          <AuthTextInput
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="Email address"
          />
          <PasswordInput
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete="new-password"
          />
          <PasswordInput
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm password"
            autoComplete="new-password"
          />

          <div className="mt-[18px]">
            <GradientAuthButton disabled={loading || !fullName || !email || !password || !confirmPassword}>
              {loading ? 'Creating account...' : 'Create account →'}
            </GradientAuthButton>
          </div>
        </form>

        {status ? (
          <p className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {status}
          </p>
        ) : null}

        <AuthSwitchLink copy="Already have an account?" href="/login" label="Sign in" />
        <AuthDivider />
        <GoogleSignInButton />
      </AuthCard>
    </AuthPageShell>
  );
}
