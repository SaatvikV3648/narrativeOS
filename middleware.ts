import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

import type { Database } from '@/lib/supabase/types';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req: request, res: response });
  const { data } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isProtectedRoute =
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/analysis');

  if (!data.session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (data.session && isAuthRoute) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('onboarded')
      .eq('user_id', data.session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const profile = profileData as { onboarded: boolean } | null;

    return NextResponse.redirect(new URL(profile?.onboarded ? '/dashboard' : '/onboarding', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/analysis/:path*', '/login', '/signup'],
};
