import { NextResponse } from 'next/server';
import { resetDemoStore } from '@/lib/db';

export async function POST() {
  resetDemoStore();
  return NextResponse.json({ success: true, message: 'Demo data has been reset to defaults.' });
}
