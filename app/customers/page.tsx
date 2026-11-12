'use client';

import React, { useEffect, useState } from 'react';
import { Container, Box, Title, Card, Badge } from '@mantine/core';
import AppLayout from '@/components/layout/AppLayout';
import {
  Users,
  Plus,
  Search,
  Mail,
  Building,
  Phone,
  RefreshCw,
  X,
  AlertCircle,
} from 'lucide-react';
import { CustomerWithMetrics } from '@/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCustomers() {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.customers) setCustomers(data.customers);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleCreateCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create customer');

      setModalOpen(false);
      setName('');
      setEmail('');
      setCompany('');
      setPhone('');
      loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating customer');
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout>
      <Container size="xl" p={0} className="space-y-6 pb-12">
        {/* Header */}
        <Box className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#1C1C19] pb-6">
          <Box>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 mb-1">
              Client Directory
            </p>
            <Title order={1} className="font-serif text-[#1C1C19] text-3xl sm:text-4xl tracking-tight">
              Customer Accounts
            </Title>
            <p className="text-xs text-stone-600 mt-1">
              Track lifetime value, pending receivables, and customer payment histories.
            </p>
          </Box>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 border-2 border-[#1C1C19] bg-[#1C1C19] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FBFBF9] shadow-[4px_4px_0px_0px_#1C1C19] transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </Box>

        {/* Search */}
        <Box className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, or email..."
            className="w-full border-2 border-[#1C1C19] bg-white py-2 pl-9 pr-4 text-xs font-medium text-[#1C1C19] placeholder:text-stone-400 shadow-[3px_3px_0px_0px_#1C1C19] focus:outline-none"
          />
        </Box>

        {/* Customer Cards Grid */}
        {loading ? (
          <Box className="flex h-64 items-center justify-center text-stone-500">
            <RefreshCw className="h-6 w-6 animate-spin text-[#1C1C19]" />
          </Box>
        ) : filtered.length === 0 ? (
          <Card className="flex h-64 flex-col items-center justify-center bg-[#FBFBF9] border-2 border-dashed border-[#1C1C19] p-6 text-center">
            <Users className="h-10 w-10 text-stone-400 mb-2" />
            <p className="font-serif text-lg font-bold text-[#1C1C19]">No customers found</p>
            <p className="text-xs text-stone-600 mt-1">
              Click &quot;Add Customer&quot; above to create your first client record.
            </p>
          </Card>
        ) : (
          <Box className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Card
                key={c.id}
                className="bg-[#FBFBF9] p-5 border-2 border-[#1C1C19] shadow-[4px_4px_0px_0px_#1C1C19] flex flex-col justify-between"
              >
                <Box>
                  <Box className="flex items-start justify-between mb-3 border-b-2 border-stone-200 pb-3">
                    <Box>
                      <h3 className="font-serif text-xl font-bold text-[#1C1C19]">{c.name}</h3>
                      {c.company && (
                        <p className="text-xs font-bold text-stone-600 flex items-center gap-1.5 mt-0.5">
                          <Building className="h-3.5 w-3.5" />
                          <span>{c.company}</span>
                        </p>
                      )}
                    </Box>
                    <Badge
                      radius={0}
                      className="border border-[#1C1C19] bg-white text-[#1C1C19] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5"
                    >
                      {c.invoiceCount} {c.invoiceCount === 1 ? 'invoice' : 'invoices'}
                    </Badge>
                  </Box>

                  <Box className="space-y-1.5 text-xs text-stone-600 mb-4">
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-stone-500" />
                      <span className="font-mono text-[11px] truncate">{c.email}</span>
                    </p>
                    {c.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-stone-500" />
                        <span>{c.phone}</span>
                      </p>
                    )}
                  </Box>
                </Box>

                <Box className="grid grid-cols-2 gap-2 border-t-2 border-stone-200 pt-3 text-center">
                  <Box className="border-r-2 border-stone-200 pr-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Total Paid</span>
                    <p className="font-serif text-base font-bold text-[#14532D]">
                      ${c.totalPaid.toFixed(2)}
                    </p>
                  </Box>
                  <Box>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Outstanding</span>
                    <p
                      className="font-serif text-base font-bold"
                      style={{ color: c.totalOutstanding > 0 ? '#B45309' : '#1C1C19' }}
                    >
                      ${c.totalOutstanding.toFixed(2)}
                    </p>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}

        {/* New Customer Modal */}
        {modalOpen && (
          <Box
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !submitting) setModalOpen(false);
            }}
          >
            <Box className="relative w-full max-w-md border-2 border-[#1C1C19] bg-[#FBFBF9] p-6 text-[#1C1C19] shadow-[6px_6px_0px_0px_#1C1C19]">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                className="absolute right-4 top-4 p-1.5 text-stone-500 hover:bg-stone-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <Box className="mb-5 flex items-center gap-2.5 border-b-2 border-stone-200 pb-3">
                <Box className="border-2 border-[#1C1C19] bg-white p-2 text-[#1C1C19]">
                  <Users className="h-5 w-5" />
                </Box>
                <Box>
                  <Title order={3} className="font-serif text-xl font-bold text-[#1C1C19]">Add Client Account</Title>
                  <p className="text-xs text-stone-600">Save client contact and invoicing details</p>
                </Box>
              </Box>

              {error && (
                <Box className="mb-4 flex items-center gap-2 border-2 border-[#991B1B] bg-rose-50 p-3 text-xs text-[#991B1B]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </Box>
              )}

              <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs font-medium">
                <Box>
                  <label className="block text-stone-700 mb-1 font-bold uppercase tracking-wider text-[11px]">Client Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full border-2 border-[#1C1C19] bg-white p-2.5 text-[#1C1C19] shadow-[2px_2px_0px_0px_#1C1C19] focus:outline-none"
                  />
                </Box>

                <Box>
                  <label className="block text-stone-700 mb-1 font-bold uppercase tracking-wider text-[11px]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full border-2 border-[#1C1C19] bg-white p-2.5 text-[#1C1C19] shadow-[2px_2px_0px_0px_#1C1C19] focus:outline-none"
                  />
                </Box>

                <Box>
                  <label className="block text-stone-700 mb-1 font-bold uppercase tracking-wider text-[11px]">Company / Studio (Optional)</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. TechCraft Studios"
                    className="w-full border-2 border-[#1C1C19] bg-white p-2.5 text-[#1C1C19] shadow-[2px_2px_0px_0px_#1C1C19] focus:outline-none"
                  />
                </Box>

                <Box>
                  <label className="block text-stone-700 mb-1 font-bold uppercase tracking-wider text-[11px]">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full border-2 border-[#1C1C19] bg-white p-2.5 text-[#1C1C19] shadow-[2px_2px_0px_0px_#1C1C19] focus:outline-none"
                  />
                </Box>

                <Box className="pt-2 flex justify-end gap-3 border-t-2 border-stone-200">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-[#1C1C19]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="border-2 border-[#1C1C19] bg-[#1C1C19] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FBFBF9] shadow-[3px_3px_0px_0px_#1C1C19] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Client'}
                  </button>
                </Box>
              </form>
            </Box>
          </Box>
        )}
      </Container>
    </AppLayout>
  );
}
