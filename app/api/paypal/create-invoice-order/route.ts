import { NextResponse } from 'next/server';
import { getInvoiceById } from '@/lib/db';
import { isPayPalConfigured, createInvoicePaymentOrder } from '@/lib/paypal/client';
import { readJsonObject } from '@/lib/http';
import { getSessionUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    if (!body || typeof body.invoiceId !== 'string') {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Safely check for logged-in user session
    const user = getSessionUserFromRequest(request);

    // If logged in, scope lookup to the seller; if public client/buyer, perform public invoice lookup
    const invoice = user 
      ? await getInvoiceById(body.invoiceId, user.id)
      : await getInvoiceById(body.invoiceId);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'This invoice has already been paid' }, { status: 400 });
    }

    // Live / Sandbox PayPal API Execution
    if (isPayPalConfigured()) {
      try {
        const order = await createInvoicePaymentOrder({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          currency: invoice.currency,
          description: `PayPilot AI Invoice ${invoice.invoiceNumber}: ${invoice.description}`,
        });

        return NextResponse.json({
          id: order.id,
          status: order.status,
          links: order.links,
          isDemo: false,
        });
      } catch (paypalError) {
        console.error('PayPal API error while creating invoice order:', paypalError);
        return NextResponse.json(
          { error: 'Could not create the PayPal payment order' },
          { status: 502 }
        );
      }
    }

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'PayPal is not configured' }, { status: 503 });
    }

    // Demo / Local Sandbox Simulator Order Fallback
    const demoOrderId = `SANDBOX_ORDER_${Date.now()}`;
    return NextResponse.json({
      id: demoOrderId,
      status: 'CREATED',
      links: [],
      isDemo: true,
      message:
        'Running in Demo Sandbox Mode (Configure PAYPAL_CLIENT_ID & SECRET in .env.local for live Sandbox API)',
    });
  } catch (error) {
    console.error('Error creating invoice payment order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment order' },
      { status: 500 }
    );
  }
}