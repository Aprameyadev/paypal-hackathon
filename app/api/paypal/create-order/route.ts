import { NextResponse } from 'next/server';
import { createAuthorizationOrder } from '@/lib/paypal/client';
import { getSupabase } from '@/lib/supabase/client';
import { readJsonObject } from '@/lib/http';

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Request body must be a valid JSON object' }, { status: 400 });
    const { contractId } = body;
    if (typeof contractId !== 'string' || !contractId.trim()) return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    const db = getSupabase();
    const [{ data: contract, error }, { data: milestones, error: milestoneError }] = await Promise.all([
      db.from('contracts').select('id,total_amount,currency,status,paypal_order_id').eq('id', contractId).single(),
      db.from('milestones').select('amount').eq('contract_id', contractId),
    ]);
    if (error || !contract) return NextResponse.json({ error: 'Contract record not found' }, { status: 404 });
    if (milestoneError) return NextResponse.json({ error: 'Could not load contract milestones' }, { status: 500 });
    if (!Number.isFinite(Number(contract.total_amount)) || Number(contract.total_amount) <= 0) return NextResponse.json({ error: 'Contract has an invalid amount' }, { status: 400 });
    if (!/^[A-Z]{3}$/.test(contract.currency || 'USD')) return NextResponse.json({ error: 'Contract has an invalid currency' }, { status: 400 });
    const totalMilestoneCents = milestones?.reduce((sum: number, milestone: { amount: number }) => sum + Math.round(Number(milestone.amount) * 100), 0) ?? 0;
    if (!milestones?.length || milestones.some((milestone: { amount: number }) => !Number.isFinite(Number(milestone.amount)) || Number(milestone.amount) <= 0) || totalMilestoneCents !== Math.round(Number(contract.total_amount) * 100)) return NextResponse.json({ error: 'Milestone amounts must add up to the contract total before payment' }, { status: 400 });
    if (contract.status !== 'DRAFT') return NextResponse.json({ error: 'A payment order can only be created for a draft contract' }, { status: 409 });
    if (contract.paypal_order_id) return NextResponse.json({ error: 'This contract already has a PayPal order' }, { status: 409 });

    const order = await createAuthorizationOrder(Number(contract.total_amount), contract.currency || 'USD', contract.id, contract.id);
    if (!order?.id) return NextResponse.json({ error: 'PayPal did not return an order ID' }, { status: 502 });
    const { error: updateError } = await db.from('contracts').update({ paypal_order_id: order.id }).eq('id', contractId);
    if (updateError) return NextResponse.json({ error: 'Order was created but could not be linked to the contract' }, { status: 500 });
    return NextResponse.json({ id: order.id, status: order.status, links: order.links });
  } catch (error) {
    console.error('Error in /api/paypal/create-order:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create authorization order' }, { status: 500 });
  }
}
