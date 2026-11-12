import { NextResponse } from 'next/server';
import { resetDemoStore } from '@/lib/db';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Demo reset is disabled in production' }, { status: 404 });
  }
  resetDemoStore();
  return NextResponse.json({ success: true, message: 'Demo data has been reset to defaults.' });
}
