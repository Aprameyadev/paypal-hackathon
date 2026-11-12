import { NextResponse } from 'next/server';
import { getTransactions } from '@/lib/db';
import { getSessionUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = getSessionUserFromRequest(request);
    const userId = user?.id;
    const transactions = await getTransactions(userId);
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
