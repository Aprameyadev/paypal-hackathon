import { NextResponse } from 'next/server';
import { getInvoiceById, markInvoiceAsPaid } from '@/lib/db';
import { isPayPalConfigured, captureInvoiceOrder, getOrderDetails } from '@/lib/paypal/client';
import { readJsonObject } from '@/lib/http';

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    if (!body || typeof body.invoiceId !== 'string' || typeof body.orderId !== 'string') {
      return NextResponse.json({ error: 'invoiceId and orderId are required' }, { status: 400 });
    }

    const { invoiceId, orderId } = body;
    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Invoice has already been marked as paid' }, { status: 400 });
    }

    // Real PayPal Sandbox Capture
    if (isPayPalConfigured() && !orderId.startsWith('SANDBOX_ORDER_')) {
      try {
        const captureResult = await captureInvoiceOrder(orderId);
        const purchaseUnit = captureResult?.purchase_units?.[0];
        const capture = purchaseUnit?.payments?.captures?.[0];

        if (capture?.status !== 'COMPLETED') {
          // Double check order details if capture status isn't immediately returned
          const orderDetails = await getOrderDetails(orderId);
          if (orderDetails?.status !== 'COMPLETED') {
            return NextResponse.json(
              { error: `Payment was not completed. Status: ${capture?.status || orderDetails?.status || 'UNKNOWN'}` },
              { status: 402 }
            );
          }
        }

        const captureId = capture?.id || `CAP_${orderId}`;
        const result = await markInvoiceAsPaid(invoice.id, orderId, captureId, 'PAYPAL_SANDBOX', false);

        return NextResponse.json({
          success: true,
          orderId,
          captureId,
          status: 'COMPLETED',
          isDemo: false,
          invoice: result?.invoice,
          transaction: result?.transaction,
        });
      } catch (err) {
        console.error('PayPal Capture failed:', err);
        return NextResponse.json(
          { error: err instanceof Error ? err.message : 'PayPal capture execution failed' },
          { status: 502 }
        );
      }
    }

    // Demo Mode Payment Capture
    const demoCaptureId = `SANDBOX_CAP_${Date.now()}`;
    const result = await markInvoiceAsPaid(invoice.id, orderId, demoCaptureId, 'PAYPAL_SANDBOX_SIMULATOR', true);

    return NextResponse.json({
      success: true,
      orderId,
      captureId: demoCaptureId,
      status: 'COMPLETED',
      isDemo: true,
      invoice: result?.invoice,
      transaction: result?.transaction,
    });
  } catch (error) {
    console.error('Error capturing invoice payment order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture payment order' },
      { status: 500 }
    );
  }
}
