import { NextResponse } from 'next/server';
import { isSupabaseAuthConfigured } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json({ success: true, message: 'Signed out successfully' });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Signed out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
