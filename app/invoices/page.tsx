'use client';

import React, { useCallback, useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Box, Title, Card, Badge } from '@mantine/core';
import AppLayout from '@/components/layout/AppLayout';
import PayPalCheckoutModal from '@/components/paypal/PayPalCheckoutModal';
import {
  FileText,
  Plus,
  Search,
  CreditCard,
  CheckCircle2,
  RefreshCw,
  X,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Invoice, Customer } from '@/types';

function InvoicesContent() {
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [payModalInvoice, setPayModalInvoice] = useState<Invoice | null>(null);

  // New Invoice form state
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDueDate, setFormDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const url = statusFilter !== 'ALL' ? `/api/invoices?status=${statusFilter}` : '/api/invoices';
      const [invRes, custRes] = await Promise.all([
        fetch(url),
        fetch('/api/customers'),
      ]);
      const invData = await invRes.json();
      const custData = await custRes.json();

      if (invData.invoices) setInvoices(invData.invoices);
      if (custData.customers) {
        setCustomers(custData.customers);
        if (custData.customers.length > 0 && !formCustomerId) {
          setFormCustomerId(custData.customers[0].id);
        }
      }

      // Check if URL specified an invoice to pay
      const payInvoiceId = searchParams.get('pay');
      if (payInvoiceId && invData.invoices) {
        const target = invData.invoices.find((i: Invoice) => i.id === payInvoiceId);
        if (target) setPayModalInvoice(target);
      }
    } catch (err) {
      console.error('Failed to load invoices', err);
    } finally {
      setLoading(false);
    }
  }, [formCustomerId, searchParams, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!formCustomerId || !formDescription || !formAmount || formSubmitting) return;

    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: formCustomerId,
          description: formDescription,
          amount: parseFloat(formAmount),
          dueDate: formDueDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create invoice');

      setCreateModalOpen(false);
      setFormDescription('');
      setFormAmount('');
      loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error creating invoice');
    } finally {
      setFormSubmitting(false);
    }
  }

  const filteredInvoices = invoices.filter((inv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.description.toLowerCase().includes(q) ||
      inv.customerName?.toLowerCase().includes(q)
    );
  });

  return (
    <Container size="xl" p={0} className="space-y-6 pb-12">
      {/* Header */}
      <Box className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#1C1C19] pb-6">
        <Box>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 mb-1">
            Accounts Receivable
          </p>
          <Title order={1} className="font-serif text-[#1C1C19] text-3xl sm:text-4xl tracking-tight">
            Invoices &amp; Billing
          </Title>
          <p className="text-xs text-stone-600 mt-1">
            Manage your receivables, download formal PDF receipts, and trigger instant PayPal checkouts.
          </p>
        </Box>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 border-2 border-[#1C1C19] bg-[#1C1C19] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FBFBF9] shadow-[4px_4px_0px_0px_#1C1C19] transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Invoice</span>
        </button>
      </Box>

      {/* Filter and Search Bar */}
      <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Pills */}
        <Box className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['ALL', 'PENDING', 'OVERDUE', 'PAID'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`border-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === status
                  ? 'border-[#1C1C19] bg-[#1C1C19] text-[#FBFBF9] shadow-[3px_3px_0px_0px_#1C1C19]'
                  : 'border-[#1C1C19] bg-white text-[#1C1C19] hover:bg-stone-100 shadow-[2px_2px_0px_0px_#1C1C19]'
              }`}
            >
              {status}
            </button>
          ))}
        </Box>

        {/* Search Input */}
        <Box className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice # or client..."
            className="w-full border-2 border-[#1C1C19] bg-white py-2 pl-9 pr-4 text-xs font-medium text-[#1C1C19] placeholder:text-stone-400 shadow-[3px_3px_0px_0px_#1C1C19] focus:outline-none"
          />
        </Box>
      </Box>

      {/* Invoices List / Cards */}
      {loading ? (
        <Box className="flex h-64 items-center justify-center text-stone-500">
          <RefreshCw className="h-6 w-6 animate-spin text-[#1C1C19]" />
        </Box>
      ) : filteredInvoices.length === 0 ? (
        <Card className="flex h-64 flex-col items-center justify-center bg-[#FBFBF9] border-2 border-dashed border-[#1C1C19] p-6 text-center">
          <FileText className="h-10 w-10 text-stone-400 mb-2" />
          <p className="font-serif text-lg font-bold text-[#1C1C19]">No invoices found</p>
          <p className="text-xs text-stone-600 mt-1">
            Try adjusting your search query or filter.
          </p>
        </Card>
      ) : (
        <Card className="divide-y-2 divide-stone-200 border-2 border-[#1C1C19] bg-[#FBFBF9] p-0 shadow-[4px_4px_0px_0px_#1C1C19] overflow-hidden">
          {filteredInvoices.map((inv) => (
            <Box
              key={inv.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-stone-50"
            >
              <Box className="space-y-1">
                <Box className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-sm text-[#1C1C19]">
                    {inv.invoiceNumber}
                  </span>
                  <Badge
                    radius={0}
                    className="border border-[#1C1C19] text-[9px] font-bold uppercase tracking-wider text-white px-2 py-0.5"
                    style={{
                      backgroundColor:
                        inv.status === 'PAID'
                          ? '#14532D'
                          : inv.status === 'OVERDUE'
                          ? '#991B1B'
                          : '#B45309',
                    }}
                  >
                    {inv.status}
                  </Badge>
                </Box>
                <p className="text-xs font-bold text-[#1C1C19]">{inv.description}</p>
                <p className="text-[11px] text-stone-600">
                  Client: <strong className="text-[#1C1C19]">{inv.customerName}</strong> ({inv.customerEmail}) · Due: {inv.dueDate}
                </p>
              </Box>

              <Box className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <Box className="text-right">
                  <p className="font-serif text-lg font-bold text-[#1C1C19]">
                    ${inv.amount.toFixed(2)}{' '}
                    <span className="font-sans text-xs text-stone-500">{inv.currency}</span>
                  </p>
                  <p className="text-[10px] text-stone-500">Issued {inv.issueDate}</p>
                </Box>

                {/* Download PDF button */}
                <a
                  href={`/api/invoices/${encodeURIComponent(inv.invoiceNumber)}/pdf`}
                  download
                  className="flex items-center gap-1.5 border-2 border-[#1C1C19] bg-white hover:bg-stone-100 text-[#1C1C19] px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#1C1C19] transition-transform hover:-translate-y-0.5 active:translate-y-0"
                  title="Download PDF invoice"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </a>

                {inv.status !== 'PAID' ? (
                  <button
                    type="button"
                    onClick={() => setPayModalInvoice(inv)}
                    className="flex items-center gap-1.5 border-2 border-[#1C1C19] bg-[#0070BA] hover:bg-[#005ea6] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#1C1C19] transition-transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Pay with PayPal</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#14532D]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Settled</span>
                  </span>
                )}
              </Box>
            </Box>
          ))}
        </Card>
      )}

      {/* New Invoice Modal */}
      {createModalOpen && (
        <Box
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !formSubmitting) setCreateModalOpen(false);
          }}
        >
          <Box className="relative w-full max-w-md border-2 border-[#1C1C19] bg-[#FBFBF9] p-6 text-[#1C1C19] shadow-[6px_6px_0px_0px_#1C1C19]">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              disabled={formSubmitting}
              className="absolute right-4 top-4 p-1.5 text-stone-500 hover:bg-stone-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <Box className="mb-5 flex items-center gap-2.5 border-b-2 border-stone-200 pb-3">
              <Box className="border-2 border-[#1C1C19] bg-white p-2 text-[#1C1C19]">
                <FileText className="h-5 w-5" />
              </Box>
              <Box>
                <Title order={3} className="font-serif text-xl font-bold text-[#1C1C19]">Create New Invoice</Title>
                <p className="text-xs text-stone-600">Set amounts, customer, and payment terms</p>
              </Box>
            </Box>

            {formError && (
              <Box className="mb-4 flex items-center gap-2 border-2 border-[#991B1B] bg-rose-50 p-3 text-xs text-[#991B1B]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </Box>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs font-medium">
              <Box>
                <label className="block text-stone-700 mb-1 font-bold uppercase tracking-wider text-[11px]">Customer</label>
                <select
                  value={formCustomerId}
                  onChange={(e) => setFormCustomerId(e.target.value)}
                  className="w-full border-2 border-[#1C1C19] bg-white p-2.5 text-[#1C1C19] shadow-[2px_2px_0px_0px_#1C1C19] focus:outline-none"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </Box>

              <Box>
                <label className="block text-stone-700 mb-1 font-bold uppercase tracking-wider text-[11px]">Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Website design milestone 1"
                  className="w-full border-2 border-[#1C1C19] bg-white p-2.5 text-[#1C1C19] shadow-[2px_2px_0px_0px_#1C1C19] focus:outline-none"
                  required
                />
              </Box>

              <Box className="grid grid-cols-2 gap-3">
                <Box>
                  <label className="block text-stone-700 mb-1 font-bold uppercase tracking-wider text-[11px]">Amount (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="150.00"
                    className="w-full border-2 border-[#1C1C19] bg-white p-2.5 text-[#1C1C19] shadow-[2px_2px_0px_0px_#1C1C19] focus:outline-none"
                    required
                  />
                </Box>
                <Box>
                  <label className="block text-stone-700 mb-1 font-bold uppercase tracking-wider text-[11px]">Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full border-2 border-[#1C1C19] bg-white p-2.5 text-[#1C1C19] shadow-[2px_2px_0px_0px_#1C1C19] focus:outline-none"
                    required
                  />
                </Box>
              </Box>

              <Box className="pt-2 flex justify-end gap-3 border-t-2 border-stone-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-[#1C1C19]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="border-2 border-[#1C1C19] bg-[#1C1C19] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FBFBF9] shadow-[3px_3px_0px_0px_#1C1C19] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : 'Save & Issue Invoice'}
                </button>
              </Box>
            </form>
          </Box>
        </Box>
      )}

      {/* PayPal Checkout Modal */}
      <PayPalCheckoutModal
        isOpen={!!payModalInvoice}
        onClose={() => setPayModalInvoice(null)}
        invoice={payModalInvoice}
        onSuccess={() => {
          loadData();
        }}
      />
    </Container>
  );
}

export default function InvoicesPage() {
  return (
    <AppLayout>
      <Suspense fallback={<Box className="p-8 text-center text-stone-500 font-bold uppercase text-xs">Loading invoices...</Box>}>
        <InvoicesContent />
      </Suspense>
    </AppLayout>
  );
}
