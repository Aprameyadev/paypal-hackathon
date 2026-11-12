import { NextResponse } from 'next/server';
import { isSupabaseAuthConfigured } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { readJsonObject } from '@/lib/http';
import type { UserProfile } from '@/types';

export async function POST(request: Request) {
  const body = await readJsonObject(request);
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  const fullName = String(body?.fullName || '').trim() || email.split('@')[0];

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json({ error: 'Supabase Auth is not configured.' }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error || !data.user) {
      return NextResponse.json({ error: error?.message || 'Failed to create account' }, { status: 400 });
    }
    if (!data.session) {
      return NextResponse.json(
        { message: 'Account created. Confirm your email, then sign in.' },
        { status: 202 }
      );
    }

    const user: UserProfile = {
      id: data.user.id,
      email: data.user.email || email,
      fullName,
      isDemo: false,
    };
    return NextResponse.json({ success: true, user, message: 'Account created successfully' });
  } catch (error) {
    console.error('Supabase sign-up error:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
