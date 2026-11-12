import { NextResponse } from 'next/server';
import { authorizeOrder } from '@/lib/paypal/client';
import { createClient } from '@/lib/supabase/server';
import { getSessionUserFromRequest } from '@/lib/auth';
import { readJsonObject } from '@/lib/http';

export async function POST(request: Request) {
  try {
    const user = getSessionUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Request body must be a valid JSON object' }, { status: 400 });
    const { orderId, contractId } = body;
    if (typeof orderId !== 'string' || typeof contractId !== 'string' || !orderId || !contractId) return NextResponse.json({ error: 'Order ID and Contract ID are required' }, { status: 400 });
    const db = await createClient();
    const { data: contract, error } = await db.from('contracts').select('id,paypal_order_id,paypal_authorization_id,status').eq('id', contractId).eq('user_id', user.id).single();
    if (error || !contract) return NextResponse.json({ error: 'Contract record not found' }, { status: 404 });
    if (contract.paypal_order_id !== orderId) return NextResponse.json({ error: 'Order does not belong to this contract' }, { status: 409 });
    if (contract.paypal_authorization_id) return NextResponse.json({ error: 'Contract is already authorized' }, { status: 409 });
    if (contract.status !== 'DRAFT') return NextResponse.json({ error: 'Contract is not awaiting authorization' }, { status: 409 });

    const authorization = await authorizeOrder(orderId);
    const authorizationId = authorization?.purchase_units?.[0]?.payments?.authorizations?.[0]?.id;
    if (!authorizationId) return NextResponse.json({ error: 'PayPal authorization response did not contain an authorization ID' }, { status: 502 });
    const { error: updateError } = await db.from('contracts').update({ paypal_authorization_id: authorizationId, status: 'AUTHORIZED_HOLD' }).eq('id', contractId).eq('user_id', user.id);
    if (updateError) return NextResponse.json({ error: 'Payment was authorized but could not be recorded' }, { status: 500 });
    return NextResponse.json({ success: true, authorizationId, status: 'AUTHORIZED_HOLD' });
  } catch (error) {
    console.error('Error in /api/paypal/authorize-order:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to authorize payment' }, { status: 500 });
  }
}
