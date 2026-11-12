import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const USER_ID_HEADER = 'x-paypilot-authenticated-user-id';
const USER_EMAIL_HEADER = 'x-paypilot-authenticated-user-email';

function isPublicApiPath(pathname: string) {
  return (
    pathname.startsWith('/api/auth/') ||
    pathname === '/api/health' ||
    pathname === '/api/paypal/webhook'
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  // These headers are internal identity claims and must never come from the client.
  requestHeaders.delete(USER_ID_HEADER);
  requestHeaders.delete(USER_EMAIL_HEADER);

  if (isPublicApiPath(pathname) || pathname === '/milestones') {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isAuthPage) return NextResponse.next({ request: { headers: requestHeaders } });
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Authentication service is not configured' }, { status: 503 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({
            name,
            value,
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          });
        });
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    if (isAuthPage) return response;
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  requestHeaders.set(USER_ID_HEADER, user.id);
  if (user.email) requestHeaders.set(USER_EMAIL_HEADER, user.email);
  const refreshedCookies = response.cookies.getAll();
  response = NextResponse.next({ request: { headers: requestHeaders } });
  refreshedCookies.forEach(cookie => response.cookies.set(cookie));

  if (isAuthPage) {
    const redirect = NextResponse.redirect(new URL('/', request.url));
    refreshedCookies.forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
