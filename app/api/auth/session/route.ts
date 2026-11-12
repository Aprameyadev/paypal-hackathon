import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isSupabaseAuthConfigured } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { UserProfile } from '@/types';

export async function GET() {
  await cookies();
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json({ user: null, configured: false });
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ user: null, configured: true });

    const profile: UserProfile = {
      id: user.id,
      email: user.email || '',
      fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      isDemo: false,
    };
    return NextResponse.json({ user: profile, configured: true });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ user: null, error: 'Failed to retrieve session' }, { status: 500 });
  }
}
