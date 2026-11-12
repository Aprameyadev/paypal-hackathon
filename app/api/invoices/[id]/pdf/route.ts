/**
 * GET /api/invoices/[id]/pdf
 *
 * Streams a PDF invoice directly to the browser for download.
 * Uses @react-pdf/renderer renderToBuffer() which runs on the Node.js runtime.
 *
 * Example: GET /api/invoices/INV-2026-001/pdf
 */
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { getInvoiceById } from '@/lib/db';
import { getSessionUserFromRequest } from '@/lib/auth';
import { InvoicePDFDocument } from '@/lib/pdf/invoice-template';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Resolve session user
    const user = getSessionUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Resolve route param
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Fetch invoice
    const invoice = await getInvoiceById(decodeURIComponent(id), user.id);
    if (!invoice) {
      return NextResponse.json({ error: `Invoice "${id}" not found` }, { status: 404 });
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      InvoicePDFDocument({
        invoice,
        businessName: user?.fullName || 'Your Business',
        businessEmail: user?.email,
      })
    );

    // Build safe filename
    const filename = `${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.byteLength),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
