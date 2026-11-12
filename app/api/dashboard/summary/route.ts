import { NextResponse } from 'next/server';
import { getDashboardSummary } from '@/lib/db';
import { getSessionUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = getSessionUserFromRequest(request);
    const userId = user?.id;
    const summary = await getDashboardSummary(userId);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard summary' }, { status: 500 });
  }
}
