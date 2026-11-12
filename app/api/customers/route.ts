import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCustomers, createCustomer } from '@/lib/db';
import { readJsonObject } from '@/lib/http';
import { getSessionUserFromRequest } from '@/lib/auth';

const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const user = getSessionUserFromRequest(request);
    const userId = user?.id;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase();

    let customers = await getCustomers(userId);

    if (search) {
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        (c.company && c.company.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getSessionUserFromRequest(request);
    const userId = user?.id;
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

    const parsed = createCustomerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Validation failed' }, { status: 400 });
    }

    const newCustomer = await createCustomer(parsed.data, userId);
    return NextResponse.json({ customer: newCustomer }, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create customer' },
      { status: 500 }
    );
  }
}
