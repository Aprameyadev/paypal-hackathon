import { NextResponse } from 'next/server';
import { getInvoiceById, markInvoiceAsPaid } from '@/lib/db';
import { isPayPalConfigured, captureInvoiceOrder, getOrderDetails } from '@/lib/paypal/client';
import { readJsonObject } from '@/lib/http';
import { getSessionUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = getSessionUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (process.env.NODE_ENV === 'production' && !isPayPalConfigured()) {
      return NextResponse.json({ error: 'PayPal is not configured' }, { status: 503 });
    }

    const body = await readJsonObject(request);
    if (!body || typeof body.invoiceId !== 'string' || typeof body.orderId !== 'string') {
      return NextResponse.json({ error: 'invoiceId and orderId are required' }, { status: 400 });
    }

    const { invoiceId, orderId } = body;
    const invoice = await getInvoiceById(invoiceId, user.id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Invoice has already been marked as paid' }, { status: 400 });
    }

    if (process.env.NODE_ENV === 'production' && orderId.startsWith('SANDBOX_ORDER_')) {
      return NextResponse.json({ error: 'Demo payment orders cannot be captured in production' }, { status: 400 });
    }

    // Real PayPal order capture
    if (isPayPalConfigured() && !orderId.startsWith('SANDBOX_ORDER_')) {
      try {
        const captureResult = await captureInvoiceOrder(orderId);
        let verifiedOrder = captureResult;
        let purchaseUnit = verifiedOrder?.purchase_units?.[0];
        const capture = purchaseUnit?.payments?.captures?.[0];

        if (capture?.status !== 'COMPLETED') {
          verifiedOrder = await getOrderDetails(orderId);
          purchaseUnit = verifiedOrder?.purchase_units?.[0];
          if (verifiedOrder?.status !== 'COMPLETED') {
            return NextResponse.json(
              { error: `Payment was not completed. Status: ${capture?.status || verifiedOrder?.status || 'UNKNOWN'}` },
              { status: 402 }
            );
          }
        }

        const orderInvoiceId = purchaseUnit?.custom_id || purchaseUnit?.reference_id;
        const paidAmount = Number(purchaseUnit?.payments?.captures?.[0]?.amount?.value || purchaseUnit?.amount?.value);
        const paidCurrency = purchaseUnit?.payments?.captures?.[0]?.amount?.currency_code || purchaseUnit?.amount?.currency_code;
        if (orderInvoiceId !== invoice.id) {
          return NextResponse.json({ error: 'PayPal order does not belong to this invoice' }, { status: 409 });
        }
        if (!Number.isFinite(paidAmount) || Math.round(paidAmount * 100) !== Math.round(invoice.amount * 100) || paidCurrency !== invoice.currency) {
          return NextResponse.json({ error: 'PayPal payment amount or currency does not match the invoice' }, { status: 409 });
        }
        const captureId = purchaseUnit?.payments?.captures?.[0]?.id;
        if (!captureId) return NextResponse.json({ error: 'PayPal did not return a capture ID' }, { status: 502 });
        const result = await markInvoiceAsPaid(invoice.id, orderId, captureId, 'PAYPAL_SANDBOX', false, user.id);
        if (!result) return NextResponse.json({ error: 'Invoice was not found for this account' }, { status: 404 });

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

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Demo payment capture is disabled in production' }, { status: 400 });
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
