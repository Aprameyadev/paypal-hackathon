import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paypal/client';
import { markInvoiceAsPaid, getInvoices } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let event: Record<string, any>;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();

    // Verify signature if webhook ID is configured
    if (webhookId) {
      const authAlgo = request.headers.get('PAYPAL-AUTH-ALGO') || '';
      const certUrl = request.headers.get('PAYPAL-CERT-URL') || '';
      const transmissionId = request.headers.get('PAYPAL-TRANSMISSION-ID') || '';
      const transmissionSig = request.headers.get('PAYPAL-TRANSMISSION-SIG') || '';
      const transmissionTime = request.headers.get('PAYPAL-TRANSMISSION-TIME') || '';

      const isValid = await verifyWebhookSignature({
        authAlgo,
        certUrl,
        transmissionId,
        transmissionSig,
        transmissionTime,
        webhookId,
        webhookEvent: event,
      });

      if (!isValid) {
        console.warn('PayPal Webhook verification failed');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    const eventType = event.event_type;
    console.log(`Received PayPal Webhook: ${eventType}`);

    // Handle Payment Capture Completed
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
      const resource = event.resource;
      const customId = resource?.custom_id || resource?.supplementary_data?.related_ids?.order_id;
      const orderId = resource?.id || resource?.supplementary_data?.related_ids?.order_id;
      const captureId = resource?.id;

      if (customId) {
        await markInvoiceAsPaid(customId, orderId, captureId, 'PAYPAL_WEBHOOK', false);
      } else {
        // Fallback: match by invoice number or order ID
        const invoices = await getInvoices();
        const matched = invoices.find(i => i.paypalOrderId === orderId);
        if (matched) {
          await markInvoiceAsPaid(matched.id, orderId, captureId, 'PAYPAL_WEBHOOK', false);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling PayPal webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
