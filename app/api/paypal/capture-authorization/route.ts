import { NextResponse } from 'next/server';
import { captureAuthorization } from '@/lib/paypal/client';
import { getSupabase } from '@/lib/supabase/client';
import { readJsonObject } from '@/lib/http';

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Request body must be a valid JSON object' }, { status: 400 });
    const { milestoneId, contractId, authorizationId } = body;
    if (typeof milestoneId !== 'string' || typeof contractId !== 'string' || typeof authorizationId !== 'string' || !milestoneId || !contractId || !authorizationId) return NextResponse.json({ error: 'Milestone, contract, and authorization IDs are required' }, { status: 400 });

    const db = getSupabase();
    const [{ data: milestone, error: milestoneError }, { data: contract, error: contractError }] = await Promise.all([
      db.from('milestones').select('id,contract_id,amount,status,paypal_capture_id').eq('id', milestoneId).single(),
      db.from('contracts').select('id,status,currency,paypal_authorization_id').eq('id', contractId).single(),
    ]);
    if (milestoneError || !milestone) return NextResponse.json({ error: 'Milestone record not found' }, { status: 404 });
    if (contractError || !contract) return NextResponse.json({ error: 'Contract record not found' }, { status: 404 });
    if (milestone.contract_id !== contract.id) return NextResponse.json({ error: 'Milestone does not belong to this contract' }, { status: 409 });
    if (contract.paypal_authorization_id !== authorizationId) return NextResponse.json({ error: 'Authorization does not belong to this contract' }, { status: 409 });
    if (contract.status !== 'AUTHORIZED_HOLD' && contract.status !== 'IN_PROGRESS') return NextResponse.json({ error: 'Contract is not in an authorized state' }, { status: 409 });
    if (milestone.status !== 'VERIFIED' || milestone.paypal_capture_id) return NextResponse.json({ error: 'Milestone must be verified and not previously captured' }, { status: 409 });

    const { data: milestones, error: listError } = await db.from('milestones').select('id,status').eq('contract_id', contractId);
    if (listError || !milestones?.length) return NextResponse.json({ error: 'Could not load contract milestones' }, { status: 500 });
    const isFinalCapture = milestones.every((item: { id: string; status: string }) => item.id === milestoneId || item.status === 'RELEASED');
    const capture = await captureAuthorization(authorizationId, Number(milestone.amount), contract.currency || 'USD', isFinalCapture, milestoneId);
    if (!capture?.id) return NextResponse.json({ error: 'PayPal did not return a capture ID' }, { status: 502 });
    const { error: updateMilestoneError } = await db.from('milestones').update({ status: 'RELEASED', paypal_capture_id: capture.id }).eq('id', milestoneId).eq('status', 'VERIFIED');
    if (updateMilestoneError) return NextResponse.json({ error: 'Payment was captured but the milestone could not be updated' }, { status: 500 });
    const completed = isFinalCapture;
    const { error: updateContractError } = await db.from('contracts').update({ status: completed ? 'COMPLETED' : 'IN_PROGRESS' }).eq('id', contractId);
    if (updateContractError) return NextResponse.json({ error: 'Payment was captured but the contract status could not be updated' }, { status: 500 });
    return NextResponse.json({ success: true, captureId: capture.id, status: capture.status, contractCompleted: completed });
  } catch (error) {
    console.error('Error in /api/paypal/capture-authorization:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to capture authorization' }, { status: 500 });
  }
}
