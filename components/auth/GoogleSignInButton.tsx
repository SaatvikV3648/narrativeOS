'use client';

import { useState } from 'react';

import { supabaseClient } from '@/lib/supabase/client';

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '');
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteOrigin}/auth/callback?next=/onboarding`,
      },
    });

    if (error) {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="glass-button inline-flex h-12 w-full items-center justify-center gap-3 px-6 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleIcon />
      {loading ? 'Opening Google...' : 'Continue with Google'}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.89-1.74 2.99-4.3 2.99-7.52z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.89 6.61-2.42l-3.22-2.51c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.75-5.58-4.11H3.09v2.59A9.99 9.99 0 0 0 12 22z" />
      <path fill="#FBBC05" d="M6.42 13.91A6.01 6.01 0 0 1 6.1 12c0-.66.11-1.3.32-1.91V7.5H3.09A9.99 9.99 0 0 0 2 12c0 1.61.39 3.13 1.09 4.5l3.33-2.59z" />
      <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.82 1.49l2.86-2.86C16.95 3 14.69 2 12 2a9.99 9.99 0 0 0-8.91 5.5l3.33 2.59C7.2 7.73 9.4 5.98 12 5.98z" />
    </svg>
  );
}
