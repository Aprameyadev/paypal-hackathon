'use client';

import React, { useEffect, useState } from 'react';
import { Container, Box, Title, Card, Badge } from '@mantine/core';
import AppLayout from '@/components/layout/AppLayout';
import {
  CreditCard,
  RefreshCw,
  Search,
  ArrowDownLeft,
} from 'lucide-react';
import { Transaction } from '@/types';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function loadTransactions() {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      if (data.transactions) setTransactions(data.transactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const filtered = transactions.filter(
    (t) =>
      (t.invoiceNumber && t.invoiceNumber.toLowerCase().includes(search.toLowerCase())) ||
      (t.customerName && t.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (t.paypalOrderId && t.paypalOrderId.toLowerCase().includes(search.toLowerCase()))
  );

  const totalCaptured = transactions
    .filter((t) => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <AppLayout>
      <Container size="xl" p={0} className="space-y-6 pb-12">
        {/* Header */}
        <Box className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#1C1C19] pb-6">
          <Box>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 mb-1">
              Audit &amp; Reconciliation
            </p>
            <Title order={1} className="font-serif text-[#1C1C19] text-3xl sm:text-4xl tracking-tight">
              Transaction Ledger
            </Title>
            <p className="text-xs text-stone-600 mt-1">
              Immutable audit log of all verified PayPal Sandbox capture IDs, order IDs, and timestamps.
            </p>
          </Box>
          <Box className="border-2 border-[#1C1C19] bg-[#FBFBF9] px-4 py-2.5 shadow-[4px_4px_0px_0px_#1C1C19]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Total Settled Funds</p>
            <p className="font-serif text-xl font-bold text-[#14532D]">
              +${totalCaptured.toFixed(2)} USD
            </p>
          </Box>
        </Box>

        {/* Search */}
        <Box className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, Invoice #, or Client..."
            className="w-full border-2 border-[#1C1C19] bg-white py-2 pl-9 pr-4 text-xs font-medium text-[#1C1C19] placeholder:text-stone-400 shadow-[3px_3px_0px_0px_#1C1C19] focus:outline-none"
          />
        </Box>

        {/* Ledger Table / List */}
        {loading ? (
          <Box className="flex h-64 items-center justify-center text-stone-500">
            <RefreshCw className="h-6 w-6 animate-spin text-[#1C1C19]" />
          </Box>
        ) : filtered.length === 0 ? (
          <Card className="flex h-64 flex-col items-center justify-center bg-[#FBFBF9] border-2 border-dashed border-[#1C1C19] p-6 text-center">
            <CreditCard className="h-10 w-10 text-stone-400 mb-2" />
            <p className="font-serif text-lg font-bold text-[#1C1C19]">No transactions found</p>
            <p className="text-xs text-stone-600 mt-1">
              Complete a payment on an invoice to record a verified transaction.
            </p>
          </Card>
        ) : (
          <Card className="divide-y-2 divide-stone-200 border-2 border-[#1C1C19] bg-[#FBFBF9] p-0 shadow-[4px_4px_0px_0px_#1C1C19] overflow-hidden">
            {filtered.map((t) => (
              <Box
                key={t.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-stone-50"
              >
                <Box className="space-y-1">
                  <Box className="flex items-center gap-2.5">
                    <Box className="border border-[#1C1C19] bg-white p-1 text-[#14532D]">
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                    </Box>
                    <span className="font-bold text-sm text-[#1C1C19]">
                      {t.customerName || 'PayPal Customer'}
                    </span>
                    <Badge
                      radius={0}
                      className="border border-[#1C1C19] bg-[#14532D] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5"
                    >
                      {t.status}
                    </Badge>
                    {t.isDemo && (
                      <span className="border border-[#1C1C19] bg-stone-200 px-1.5 py-0.2 text-[9px] font-bold uppercase text-[#1C1C19]">
                        Simulator
                      </span>
                    )}
                  </Box>
                  <Box className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-stone-600">
                    <span>Order: <strong>{t.paypalOrderId || 'N/A'}</strong></span>
                    <span>•</span>
                    <span>Capture: <strong>{t.paypalCaptureId || 'N/A'}</strong></span>
                    <span>•</span>
                    <span>Invoice: <strong>{t.invoiceNumber || 'N/A'}</strong></span>
                  </Box>
                </Box>

                <Box className="text-right shrink-0">
                  <p className="font-serif text-lg font-bold text-[#14532D]">
                    +${t.amount.toFixed(2)} {t.currency}
                  </p>
                  <p className="text-[10px] text-stone-500 font-mono">
                    {new Date(t.createdAt).toLocaleString()}
                  </p>
                </Box>
              </Box>
            ))}
          </Card>
        )}
      </Container>
    </AppLayout>
  );
}
