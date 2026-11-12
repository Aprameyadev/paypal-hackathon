import { NextResponse } from 'next/server';
import { voidAuthorization } from '@/lib/paypal/client';
import { createClient } from '@/lib/supabase/server';
import { getSessionUserFromRequest } from '@/lib/auth';
import { readJsonObject } from '@/lib/http';

export async function POST(request: Request) {
  try {
    const user = getSessionUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Request body must be a valid JSON object' }, { status: 400 });
    const { contractId, authorizationId } = body;
    if (typeof contractId !== 'string' || typeof authorizationId !== 'string' || !contractId || !authorizationId) return NextResponse.json({ error: 'Contract ID and Authorization ID are required' }, { status: 400 });
    const db = await createClient();
    const [{ data: contract, error: contractError }, { data: milestones, error: milestoneError }] = await Promise.all([
      db.from('contracts').select('id,status,paypal_authorization_id').eq('id', contractId).eq('user_id', user.id).single(),
      db.from('milestones').select('id,status,paypal_capture_id').eq('contract_id', contractId),
    ]);
    if (contractError || !contract) return NextResponse.json({ error: 'Contract record not found' }, { status: 404 });
    if (milestoneError) return NextResponse.json({ error: 'Could not load contract milestones' }, { status: 500 });
    if (contract.paypal_authorization_id !== authorizationId) return NextResponse.json({ error: 'Authorization does not belong to this contract' }, { status: 409 });
    if (contract.status === 'CANCELLED') return NextResponse.json({ error: 'Contract is already cancelled' }, { status: 409 });
    if (milestones?.some((milestone: { status: string; paypal_capture_id: string | null }) => milestone.status === 'RELEASED' || milestone.paypal_capture_id)) return NextResponse.json({ error: 'An authorization with captured milestone funds cannot be voided' }, { status: 409 });

    await voidAuthorization(authorizationId);
    const { error: contractUpdateError } = await db.from('contracts').update({ status: 'CANCELLED' }).eq('id', contractId).eq('user_id', user.id);
    if (contractUpdateError) return NextResponse.json({ error: 'Authorization was voided but the contract could not be updated' }, { status: 500 });
    const { error: milestoneUpdateError } = await db.from('milestones').update({ status: 'PENDING' }).eq('contract_id', contractId);
    if (milestoneUpdateError) return NextResponse.json({ error: 'Authorization was voided but milestones could not be updated' }, { status: 500 });
    return NextResponse.json({ success: true, status: 'CANCELLED', message: 'Authorization voided successfully' });
  } catch (error) {
    console.error('Error in /api/paypal/void-authorization:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to void authorization' }, { status: 500 });
  }
}
