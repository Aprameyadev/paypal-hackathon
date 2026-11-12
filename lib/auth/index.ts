import { UserProfile } from '@/types';

export function isSupabaseAuthConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

/**
 * Server-side helper to resolve user from cookie or authorization header
 */
export function getSessionUserFromRequest(request: Request): UserProfile | null {
  const id = request.headers.get('x-paypilot-authenticated-user-id');
  const email = request.headers.get('x-paypilot-authenticated-user-email');
  if (!id || !email) return null;
  return { id, email, fullName: email.split('@')[0], isDemo: false };
}
