'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  CreditCard,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
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
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Transactions</h1>
            <p className="text-xs text-slate-400 mt-1">
              Audit log of captured payments and verified PayPal Sandbox transfers.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold">Total Verified: ${totalCaptured.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice # or order ID..."
            className="w-full rounded-xl border border-slate-800 bg-[#0c1220] py-2 pl-9 pr-4 text-xs text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="flex h-64 items-center justify-center text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-[#0c1220]/50 p-6 text-center">
            <CreditCard className="h-10 w-10 text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No transactions recorded yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Pay an invoice using PayPal Sandbox to view instant capture entries here.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-[#0c1220] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Transaction / Customer</th>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">PayPal Order ID</th>
                    <th className="py-3 px-4">Capture ID</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filtered.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                        <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <span>{tx.customerName || 'PayPal Buyer'}</span>
                          <p className="text-[10px] text-emerald-400 font-mono">STATUS: {tx.status}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                        {tx.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {tx.paypalOrderId || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {tx.paypalCaptureId || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                            tx.isDemo
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {tx.paymentSource || 'PAYPAL'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        +${tx.amount.toFixed(2)} {tx.currency}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
