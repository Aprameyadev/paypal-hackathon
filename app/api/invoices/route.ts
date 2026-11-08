import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getInvoices, createInvoice } from '@/lib/db';
import { readJsonObject } from '@/lib/http';

const createInvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  description: z.string().min(3, 'Description must be at least 3 characters').max(500),
  amount: z.number().positive('Amount must be greater than zero'),
  currency: z.string().length(3).default('USD'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format'),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const search = searchParams.get('search')?.toLowerCase();

    let invoices = await getInvoices();

    if (status && status !== 'ALL') {
      invoices = invoices.filter(i => i.status.toUpperCase() === status.toUpperCase());
    }

    if (customerId) {
      invoices = invoices.filter(i => i.customerId === customerId);
    }

    if (search) {
      invoices = invoices.filter(i =>
        i.invoiceNumber.toLowerCase().includes(search) ||
        i.description.toLowerCase().includes(search) ||
        (i.customerName && i.customerName.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

    const parsed = createInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Validation failed' }, { status: 400 });
    }

    const newInvoice = await createInvoice(parsed.data);
    return NextResponse.json({ invoice: newInvoice }, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
