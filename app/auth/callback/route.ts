import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';

import type { Database } from '@/lib/supabase/types';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const requestedNext = requestUrl.searchParams.get('next');
  const safeNext = requestedNext?.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : null;
  const origin = (headers().get('origin') || process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin).replace(/\/$/, '');

  console.info('[auth/callback] hit', {
    codeExists: Boolean(code),
    requestedNext: safeNext ?? null,
    origin,
  });

  if (!code) {
    console.warn('[auth/callback] missing code');
    return NextResponse.redirect(new URL('/login?error=missing_code', origin));
  }

  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('[auth/callback] exchange failed', {
      message: exchangeError.message,
      status: exchangeError.status,
    });
    return NextResponse.redirect(new URL('/login?error=auth_exchange_failed', origin));
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    console.error('[auth/callback] session unavailable after exchange', {
      message: userError?.message ?? 'No user returned',
    });
    return NextResponse.redirect(new URL('/login?error=session_missing', origin));
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('onboarded')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (profileError) {
    console.error('[auth/callback] profile lookup failed', {
      message: profileError.message,
    });
  }

  const profile = profileData as { onboarded: boolean } | null;
  let destination = safeNext ?? (profile?.onboarded ? '/dashboard' : '/onboarding');

  if (profile?.onboarded && destination === '/onboarding') {
    destination = '/dashboard';
  }

  if (!profile?.onboarded && destination.startsWith('/dashboard')) {
    destination = '/onboarding';
  }

  console.info('[auth/callback] exchange succeeded', {
    redirectDestination: destination,
    onboarded: Boolean(profile?.onboarded),
  });

  return NextResponse.redirect(new URL(destination, origin));
}
