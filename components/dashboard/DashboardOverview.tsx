'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  Users,
  ArrowUpRight,
  TrendingUp,
  FileText,
  CreditCard,
  Bot,
  Plus,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardSummary } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  Paid: '#10B981',
  Pending: '#3B82F6',
  Overdue: '#F43F5E',
};

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchSummary() {
    try {
      const res = await fetch('/api/dashboard/summary');
      const json = await res.json();
      if (json.summary) {
        setData(json.summary);
      }
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Autonomous Cashflow Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Real-time receivables, verified PayPal payments, and predictive cash analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/assistant"
            className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-600/10 px-4 py-2.5 text-xs font-semibold text-blue-400 transition-all hover:bg-blue-600/20"
          >
            <Bot className="h-4 w-4" />
            <span>Ask Copilot</span>
          </Link>
          <Link
            href="/invoices?new=1"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            <span>Create Invoice</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Revenue</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-white">
              ${data.totalRevenue.toFixed(2)}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>{data.paidInvoicesCount} invoices collected</span>
            </div>
          </div>
        </div>

        {/* Outstanding Payments */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Waiting to Receive</span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-white">
              ${data.outstandingPayments.toFixed(2)}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-400">
              <span>{data.pendingInvoicesCount} pending invoices</span>
            </div>
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Overdue Balance</span>
            <div className="rounded-xl bg-rose-500/10 p-2 text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-rose-400">
              ${data.overduePayments.toFixed(2)}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-rose-400">
              <span>{data.overdueInvoicesCount} overdue (action required)</span>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Active Customers</span>
            <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-white">
              {data.totalCustomers}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>Client payment accounts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Revenue Area Chart */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Cashflow Velocity</h2>
              <p className="text-xs text-slate-400">Monthly revenue trends and verified captures</p>
            </div>
            <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
              Live Ledger
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#38BDF8' }}
                  formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Donut Chart */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Receivables Health</h2>
            <p className="text-xs text-slate-400">Payment status distribution</p>
          </div>

          <div className="h-44 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusDistribution}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.statusDistribution.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#64748B'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`$${Number(val || 0).toFixed(2)}`, 'Total']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-center">
            {data.statusDistribution.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-300">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[item.status] }}
                  ></span>
                  <span>{item.status}</span>
                </div>
                <p className="mt-1 font-mono text-xs font-bold text-white">
                  ${item.value.toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices & Transactions Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Invoices */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Recent Invoices</h2>
            </div>
            <Link
              href="/invoices"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <span>View all</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {data.recentInvoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-white">{inv.invoiceNumber}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : inv.status === 'OVERDUE'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{inv.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">${inv.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-500">Due {inv.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Verified PayPal Transactions</h2>
            </div>
            <Link
              href="/transactions"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <span>View all</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {data.recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-medium text-white">{tx.customerName || 'PayPal Buyer'}</span>
                    {tx.isDemo && (
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-400">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {tx.paypalOrderId || tx.invoiceNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-400">+${tx.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
