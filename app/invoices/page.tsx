'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import PayPalCheckoutModal from '@/components/paypal/PayPalCheckoutModal';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  ExternalLink,
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

  async function loadData() {
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
  }

  useEffect(() => {
    loadData();
  }, [statusFilter]);

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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Invoices</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your accounts receivable and generate instant PayPal Sandbox checkout links.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['ALL', 'PENDING', 'OVERDUE', 'PAID'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'bg-[#0c1220] text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice # or customer..."
            className="w-full rounded-xl border border-slate-800 bg-[#0c1220] py-2 pl-9 pr-4 text-xs text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Invoices List / Cards */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-[#0c1220]/50 p-6 text-center">
          <FileText className="h-10 w-10 text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">No invoices found</p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or filter.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80 rounded-2xl border border-slate-800 bg-[#0c1220] overflow-hidden">
          {filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-800/20"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-sm text-white">
                    {inv.invoiceNumber}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : inv.status === 'OVERDUE'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-300">{inv.description}</p>
                <p className="text-[11px] text-slate-500">
                  Client: <strong className="text-slate-400">{inv.customerName}</strong> ({inv.customerEmail}) · Due: {inv.dueDate}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-base font-bold text-white">
                    ${inv.amount.toFixed(2)}{' '}
                    <span className="text-xs text-slate-500">{inv.currency}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">Issued {inv.issueDate}</p>
                </div>

                {inv.status !== 'PAID' ? (
                  <button
                    type="button"
                    onClick={() => setPayModalInvoice(inv)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white px-3.5 py-2 text-xs font-semibold transition-all shadow-md shadow-blue-950"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Pay with PayPal</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Paid</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Invoice Modal */}
      {createModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !formSubmitting) setCreateModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0e1626] p-6 text-slate-100 shadow-2xl">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              disabled={formSubmitting}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5 flex items-center gap-2.5">
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400 border border-blue-500/20">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Create New Invoice</h3>
                <p className="text-xs text-slate-400">Set amounts, customer, and payment terms</p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Customer</label>
                <select
                  value={formCustomerId}
                  onChange={(e) => setFormCustomerId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#070b14] p-2.5 text-slate-200 focus:border-blue-500 focus:outline-none"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Website design milestone 1"
                  className="w-full rounded-xl border border-slate-800 bg-[#070b14] p-2.5 text-slate-200 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Amount (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="150.00"
                    className="w-full rounded-xl border border-slate-800 bg-[#070b14] p-2.5 text-slate-200 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#070b14] p-2.5 text-slate-200 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={formSubmitting}
                  className="rounded-xl px-4 py-2 font-medium text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : 'Save & Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading invoices...</div>}>
        <InvoicesContent />
      </Suspense>
    </AppLayout>
  );
}
