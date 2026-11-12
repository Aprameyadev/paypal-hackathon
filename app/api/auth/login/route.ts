import { NextResponse } from 'next/server';
import { isSupabaseAuthConfigured } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { readJsonObject } from '@/lib/http';
import type { UserProfile } from '@/types';

export async function POST(request: Request) {
  const body = await readJsonObject(request);
  if (body?.isDemo) {
    return NextResponse.json({ error: 'Demo sign-in is disabled. Configure Supabase Auth to sign in.' }, { status: 403 });
  }
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json({ error: 'Supabase Auth is not configured.' }, { status: 503 });
  }

  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user || !data.session) {
      return NextResponse.json({ error: error?.message || 'Invalid email or password' }, { status: 401 });
    }

    const user: UserProfile = {
      id: data.user.id,
      email: data.user.email || email,
      fullName: data.user.user_metadata?.full_name || email.split('@')[0],
      isDemo: false,
    };
    return NextResponse.json({ success: true, user, message: 'Signed in successfully' });
  } catch (error) {
    console.error('Supabase auth sign-in error:', error);
    return NextResponse.json({ error: 'Sign-in failed' }, { status: 500 });
  }
}
