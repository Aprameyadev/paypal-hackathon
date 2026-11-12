import { Customer, CustomerWithMetrics, Invoice, Reminder, Transaction, DashboardSummary } from '@/types';
import { randomUUID } from 'node:crypto';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

// Initial Demo Seed Records
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    userId: DEFAULT_USER_ID,
    name: 'Alex Johnson',
    email: 'alex.johnson@techcraft.io',
    company: 'TechCraft Studios',
    phone: '+1 (555) 234-5678',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    userId: DEFAULT_USER_ID,
    name: 'Sarah Miller',
    email: 'sarah@millerconsulting.com',
    company: 'Miller Advisory Group',
    phone: '+1 (555) 345-6789',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    userId: DEFAULT_USER_ID,
    name: 'John Smith',
    email: 'john.smith@smithdesign.co',
    company: 'Smith Brand & Design',
    phone: '+1 (555) 456-7890',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000004',
    userId: DEFAULT_USER_ID,
    name: 'Elena Rostova',
    email: 'elena@novafintech.org',
    company: 'Nova Fintech Labs',
    phone: '+1 (555) 567-8901',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'i1000000-0000-0000-0000-000000000001',
    userId: DEFAULT_USER_ID,
    customerId: 'c1000000-0000-0000-0000-000000000001',
    customerName: 'Alex Johnson',
    customerEmail: 'alex.johnson@techcraft.io',
    invoiceNumber: 'INV-2026-001',
    description: 'Website development - Homepage & Responsive Layout',
    amount: 150.00,
    currency: 'USD',
    issueDate: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    status: 'PENDING',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'i1000000-0000-0000-0000-000000000002',
    userId: DEFAULT_USER_ID,
    customerId: 'c1000000-0000-0000-0000-000000000002',
    customerName: 'Sarah Miller',
    customerEmail: 'sarah@millerconsulting.com',
    invoiceNumber: 'INV-2026-002',
    description: 'Consulting services - Q1 Growth Strategy & Cashflow Audit',
    amount: 250.00,
    currency: 'USD',
    issueDate: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    status: 'OVERDUE',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'i1000000-0000-0000-0000-000000000003',
    userId: DEFAULT_USER_ID,
    customerId: 'c1000000-0000-0000-0000-000000000003',
    customerName: 'John Smith',
    customerEmail: 'john.smith@smithdesign.co',
    invoiceNumber: 'INV-2026-003',
    description: 'Design services - Brand Identity & UI Kit Delivery',
    amount: 100.00,
    currency: 'USD',
    issueDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    status: 'PAID',
    paypalOrderId: 'DEMO_ORDER_78901',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'i1000000-0000-0000-0000-000000000004',
    userId: DEFAULT_USER_ID,
    customerId: 'c1000000-0000-0000-0000-000000000004',
    customerName: 'Elena Rostova',
    customerEmail: 'elena@novafintech.org',
    invoiceNumber: 'INV-2026-004',
    description: 'API Integration & Security Audit',
    amount: 420.00,
    currency: 'USD',
    issueDate: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
    status: 'PENDING',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1000000-0000-0000-0000-000000000001',
    userId: DEFAULT_USER_ID,
    invoiceId: 'i1000000-0000-0000-0000-000000000003',
    invoiceNumber: 'INV-2026-003',
    customerName: 'John Smith',
    paypalOrderId: 'DEMO_ORDER_78901',
    paypalCaptureId: 'DEMO_CAP_78901',
    amount: 100.00,
    currency: 'USD',
    status: 'COMPLETED',
    paymentSource: 'PAYPAL_SANDBOX',
    isDemo: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'r1000000-0000-0000-0000-000000000001',
    userId: DEFAULT_USER_ID,
    invoiceId: 'i1000000-0000-0000-0000-000000000002',
    customerName: 'Sarah Miller',
    message: 'Hi Sarah, friendly reminder that invoice INV-2026-002 for $250.00 was due on 5 days ago. Please review and pay at your earliest convenience.',
    status: 'PREPARED',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// In-Memory Global Store to preserve data across serverless route invocations during dev/demo
interface StoreState {
  customers: Customer[];
  invoices: Invoice[];
  transactions: Transaction[];
  reminders: Reminder[];
}

declare global {
  var __paypilot_store__: StoreState | undefined;
}

function getLocalStore(): StoreState {
  if (!global.__paypilot_store__) {
    global.__paypilot_store__ = {
      customers: [...INITIAL_CUSTOMERS],
      invoices: [...INITIAL_INVOICES],
      transactions: [...INITIAL_TRANSACTIONS],
      reminders: [...INITIAL_REMINDERS],
    };
  }
  return global.__paypilot_store__;
}

export function resetDemoStore(): void {
  global.__paypilot_store__ = {
    customers: [...INITIAL_CUSTOMERS],
    invoices: [...INITIAL_INVOICES],
    transactions: [...INITIAL_TRANSACTIONS],
    reminders: [...INITIAL_REMINDERS],
  };
}

export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
}

function assertProductionDatabaseConfigured(): void {
  if (process.env.NODE_ENV === 'production' && !isSupabaseConfigured()) {
    throw new Error('Supabase must be configured for production data access.');
  }
}

function handleDatabaseFailure(message: string, error: unknown): void {
  if (process.env.NODE_ENV === 'production') throw new Error(message, { cause: error });
  console.warn(message, error);
}

// Data Access Layer with Automatic Fallback
export async function getCustomers(userId: string = DEFAULT_USER_ID): Promise<CustomerWithMetrics[]> {
  assertProductionDatabaseConfigured();
  if (isSupabaseConfigured()) {
    try {
      const db = await createSupabaseServerClient();
      const { data, error } = await db.from('customers').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      if (!error && data) {
        const invoices = await getInvoices(userId);
        return data.map((c: any) => {
          const custInvoices = invoices.filter(i => i.customerId === c.id);
          const totalPaid = custInvoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
          const totalOutstanding = custInvoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0);
          return {
            id: c.id,
            userId: c.user_id,
            name: c.name,
            email: c.email,
            company: c.company,
            phone: c.phone,
            createdAt: c.created_at,
            totalPaid,
            totalOutstanding,
            invoiceCount: custInvoices.length,
          };
        });
      }
    } catch (e) {
      handleDatabaseFailure('Supabase customers query failed', e);
    }
  }

  const store = getLocalStore();
  const invoices = store.invoices;
  return store.customers.filter(c => c.userId === userId).map(c => {
    const custInvoices = invoices.filter(i => i.customerId === c.id);
    const totalPaid = custInvoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
    const totalOutstanding = custInvoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0);
    return {
      ...c,
      totalPaid,
      totalOutstanding,
      invoiceCount: custInvoices.length,
    };
  });
}

export async function getCustomerById(id: string, userId: string = DEFAULT_USER_ID): Promise<CustomerWithMetrics | null> {
  const customers = await getCustomers(userId);
  return customers.find(c => c.id === id) || null;
}

export async function createCustomer(data: Omit<Customer, 'id' | 'userId' | 'createdAt'>, userId: string = DEFAULT_USER_ID): Promise<Customer> {
  assertProductionDatabaseConfigured();
  const newCustomer: Customer = {
    id: randomUUID(),
    userId,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    company: data.company?.trim(),
    phone: data.phone?.trim(),
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const db = await createSupabaseServerClient();
      const { data: inserted, error } = await db.from('customers').insert({
        id: newCustomer.id,
        user_id: userId,
        name: newCustomer.name,
        email: newCustomer.email,
        company: newCustomer.company,
        phone: newCustomer.phone,
      }).select().single();
      if (error) throw error;
      if (inserted) return { ...newCustomer, id: inserted.id };
    } catch (e) {
      handleDatabaseFailure('Supabase customer insert failed', e);
    }
  }

  const store = getLocalStore();
  store.customers.unshift(newCustomer);
  return newCustomer;
}

export async function getInvoices(userId: string = DEFAULT_USER_ID): Promise<Invoice[]> {
  assertProductionDatabaseConfigured();
  const now = new Date().toISOString().split('T')[0];

  if (isSupabaseConfigured()) {
    try {
      const db = await createSupabaseServerClient();
      const { data, error } = await db.from('invoices').select('*, customers(name, email)').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      if (!error && data) {
        return data.map((inv: any) => {
          let status = inv.status;
          if (status === 'PENDING' && inv.due_date < now) {
            status = 'OVERDUE';
          }
          return {
            id: inv.id,
            userId: inv.user_id,
            customerId: inv.customer_id,
            customerName: inv.customers?.name || 'Customer',
            customerEmail: inv.customers?.email || '',
            invoiceNumber: inv.invoice_number,
            description: inv.description,
            amount: Number(inv.amount),
            currency: inv.currency,
            issueDate: inv.issue_date,
            dueDate: inv.due_date,
            status,
            paypalOrderId: inv.paypal_order_id,
            createdAt: inv.created_at,
            updatedAt: inv.updated_at,
          };
        });
      }
    } catch (e) {
      handleDatabaseFailure('Supabase invoices query failed', e);
    }
  }

  const store = getLocalStore();
  // Auto-update overdue status
  store.invoices.forEach(inv => {
    if (inv.status === 'PENDING' && inv.dueDate < now) {
      inv.status = 'OVERDUE';
    }
  });

  return store.invoices.filter(inv => inv.userId === userId);
}

export async function getInvoiceById(id: string, userId: string = DEFAULT_USER_ID): Promise<Invoice | null> {
  const invoices = await getInvoices(userId);
  return invoices.find(i => i.id === id || i.invoiceNumber.toLowerCase() === id.toLowerCase()) || null;
}

export async function createInvoice(
  data: {
    customerId: string;
    description: string;
    amount: number;
    currency?: string;
    dueDate: string;
    issueDate?: string;
    status?: Invoice['status'];
  },
  userId: string = DEFAULT_USER_ID
): Promise<Invoice> {
  assertProductionDatabaseConfigured();
  const store = getLocalStore();
  const customer = store.customers.find(c => c.id === data.customerId && c.userId === userId);
  const invoiceNumber = `INV-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const now = new Date().toISOString();
  const issueDate = data.issueDate || now.split('T')[0];

  const newInvoice: Invoice = {
    id: randomUUID(),
    userId,
    customerId: data.customerId,
    customerName: customer?.name || 'Customer',
    customerEmail: customer?.email || '',
    invoiceNumber,
    description: data.description.trim(),
    amount: Number(data.amount),
    currency: (data.currency || 'USD').toUpperCase(),
    issueDate,
    dueDate: data.dueDate,
    status: data.status || 'PENDING',
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseConfigured()) {
    try {
      const db = await createSupabaseServerClient();
      const { data: ownedCustomer, error: customerError } = await db
        .from('customers')
        .select('id')
        .eq('id', data.customerId)
        .eq('user_id', userId)
        .maybeSingle();
      if (customerError) throw customerError;
      if (!ownedCustomer) throw new Error('Customer not found for this account');
      const { error: insertError } = await db.from('invoices').insert({
        id: newInvoice.id,
        user_id: userId,
        customer_id: newInvoice.customerId,
        invoice_number: newInvoice.invoiceNumber,
        description: newInvoice.description,
        amount: newInvoice.amount,
        currency: newInvoice.currency,
        issue_date: newInvoice.issueDate,
        due_date: newInvoice.dueDate,
        status: newInvoice.status,
      });
      if (insertError) throw insertError;
      return newInvoice;
    } catch (e) {
      handleDatabaseFailure('Supabase invoice insert failed', e);
    }
  }

  store.invoices.unshift(newInvoice);
  return newInvoice;
}

export async function markInvoiceAsPaid(
  invoiceId: string,
  paypalOrderId: string,
  paypalCaptureId: string,
  paymentSource: string = 'PAYPAL_SANDBOX',
  isDemo: boolean = false,
  userId?: string
): Promise<{ invoice: Invoice; transaction: Transaction } | null> {
  assertProductionDatabaseConfigured();
  const store = getLocalStore();
  const invoice = userId
    ? await getInvoiceById(invoiceId, userId)
    : store.invoices.find(i => i.id === invoiceId || i.invoiceNumber === invoiceId);
  if (!invoice) return null;

  invoice.status = 'PAID';
  invoice.paypalOrderId = paypalOrderId;
  invoice.updatedAt = new Date().toISOString();

  const newTransaction: Transaction = {
    id: randomUUID(),
    userId: invoice.userId,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    customerName: invoice.customerName,
    paypalOrderId,
    paypalCaptureId,
    amount: invoice.amount,
    currency: invoice.currency,
    status: 'COMPLETED',
    paymentSource,
    isDemo,
    createdAt: new Date().toISOString(),
  };

  store.transactions.unshift(newTransaction);

  if (isSupabaseConfigured()) {
    try {
      const db = await createSupabaseServerClient();
      const { data: updatedInvoice, error: invoiceUpdateError } = await db
        .from('invoices')
        .update({ status: 'PAID', paypal_order_id: paypalOrderId, updated_at: invoice.updatedAt })
        .eq('id', invoice.id)
        .eq('user_id', invoice.userId)
        .neq('status', 'PAID')
        .select('id')
        .maybeSingle();
      if (invoiceUpdateError) throw invoiceUpdateError;
      if (!updatedInvoice) throw new Error('Invoice is missing, already paid, or does not belong to this account');
      const { error: transactionError } = await db.from('transactions').insert({
          id: newTransaction.id,
          user_id: invoice.userId,
          invoice_id: invoice.id,
          paypal_order_id: paypalOrderId,
          paypal_capture_id: paypalCaptureId,
          amount: newTransaction.amount,
          currency: newTransaction.currency,
          status: 'COMPLETED',
          payment_source: paymentSource,
        });
      if (transactionError) throw transactionError;
    } catch (e) {
      handleDatabaseFailure('Supabase payment recording failed', e);
      return null;
    }
  }

  return { invoice, transaction: newTransaction };
}

export async function getTransactions(userId: string = DEFAULT_USER_ID): Promise<Transaction[]> {
  assertProductionDatabaseConfigured();
  if (isSupabaseConfigured()) {
    try {
      const db = await createSupabaseServerClient();
      const { data, error } = await db.from('transactions').select('*, invoices(invoice_number, customer_id, customers(name))').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      if (!error && data) {
        return data.map((t: any) => ({
          id: t.id,
          userId: t.user_id,
          invoiceId: t.invoice_id,
          invoiceNumber: t.invoices?.invoice_number || 'INV-UNKNOWN',
          customerName: t.invoices?.customers?.name || 'Customer',
          paypalOrderId: t.paypal_order_id,
          paypalCaptureId: t.paypal_capture_id,
          amount: Number(t.amount),
          currency: t.currency,
          status: t.status,
          paymentSource: t.payment_source || 'PAYPAL',
          isDemo: t.payment_source === 'DEMO',
          createdAt: t.created_at,
        }));
      }
    } catch (e) {
      handleDatabaseFailure('Supabase transactions query failed', e);
    }
  }

  const store = getLocalStore();
  return store.transactions.filter(transaction => transaction.userId === userId);
}

export async function getReminders(userId: string = DEFAULT_USER_ID): Promise<Reminder[]> {
  const store = getLocalStore();
  return store.reminders.filter((reminder) => reminder.userId === userId);
}

export async function saveReminder(invoiceId: string, message: string, userId: string = DEFAULT_USER_ID): Promise<Reminder> {
  const store = getLocalStore();
  const invoice = store.invoices.find(i => i.id === invoiceId);
  const reminder: Reminder = {
    id: `r${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    invoiceId,
    customerName: invoice?.customerName,
    message,
    status: 'PREPARED',
    createdAt: new Date().toISOString(),
  };
  store.reminders.unshift(reminder);
  return reminder;
}

export async function getDashboardSummary(userId: string = DEFAULT_USER_ID): Promise<DashboardSummary> {
  const invoices = await getInvoices(userId);
  const customers = await getCustomers(userId);
  const transactions = await getTransactions(userId);

  const totalRevenue = transactions.filter(t => t.status === 'COMPLETED').reduce((acc, t) => acc + t.amount, 0);
  const outstandingPayments = invoices.filter(i => i.status === 'PENDING').reduce((acc, i) => acc + i.amount, 0);
  const overduePayments = invoices.filter(i => i.status === 'OVERDUE').reduce((acc, i) => acc + i.amount, 0);

  const paidInvoicesCount = invoices.filter(i => i.status === 'PAID').length;
  const pendingInvoicesCount = invoices.filter(i => i.status === 'PENDING').length;
  const overdueInvoicesCount = invoices.filter(i => i.status === 'OVERDUE').length;

  // Monthly Revenue Calculation (last 6 months)
  const monthMap = new Map<string, { revenue: number; invoiceCount: number }>();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const curDate = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(curDate.getFullYear(), curDate.getMonth() - i, 1);
    const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
    monthMap.set(key, { revenue: 0, invoiceCount: 0 });
  }

  transactions.forEach(t => {
    if (t.status === 'COMPLETED') {
      const d = new Date(t.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      if (monthMap.has(key)) {
        const item = monthMap.get(key)!;
        item.revenue += t.amount;
        item.invoiceCount += 1;
      }
    }
  });

  const monthlyRevenue = Array.from(monthMap.entries()).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    invoiceCount: data.invoiceCount,
  }));

  const statusDistribution = [
    { status: 'Paid', count: paidInvoicesCount, value: totalRevenue },
    { status: 'Pending', count: pendingInvoicesCount, value: outstandingPayments },
    { status: 'Overdue', count: overdueInvoicesCount, value: overduePayments },
  ];

  return {
    totalRevenue,
    outstandingPayments,
    overduePayments,
    totalCustomers: customers.length,
    paidInvoicesCount,
    pendingInvoicesCount,
    overdueInvoicesCount,
    currency: 'USD',
    recentInvoices: invoices.slice(0, 5),
    recentTransactions: transactions.slice(0, 5),
    monthlyRevenue,
    statusDistribution,
  };
}
