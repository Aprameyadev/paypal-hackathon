'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container, Box, Title, Card, Badge } from '@mantine/core';
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
  ShieldCheck,
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
  Paid: '#14532D',
  Pending: '#B45309',
  Overdue: '#991B1B',
};

// Mock Escrow milestones for demonstration
interface EscrowMilestone {
  id: string;
  title: string;
  contract: string;
  amount: number;
  status: 'RELEASED' | 'HELD' | 'DISPUTED';
  date: string;
}

const SAMPLE_ESCROW_ITEMS: EscrowMilestone[] = [
  {
    id: 'ESC-2026-01',
    title: 'Brand Identity & Design System',
    contract: 'TechCraft Studios',
    amount: 150.0,
    status: 'HELD',
    date: 'Pending verification',
  },
  {
    id: 'ESC-2026-02',
    title: 'API Integration & Auth Layer',
    contract: 'Nova Fintech Labs',
    amount: 420.0,
    status: 'HELD',
    date: 'Held in escrow',
  },
  {
    id: 'ESC-2026-03',
    title: 'Q1 Growth Strategy & Audit',
    contract: 'Miller Advisory Group',
    amount: 250.0,
    status: 'DISPUTED',
    date: '5 days overdue',
  },
  {
    id: 'ESC-2026-04',
    title: 'UI Kit & Component Delivery',
    contract: 'Smith Brand & Design',
    amount: 100.0,
    status: 'RELEASED',
    date: 'Funds released via PayPal',
  },
];

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
      <Box className="flex h-96 items-center justify-center text-stone-500">
        <RefreshCw className="h-6 w-6 animate-spin text-[#1C1C19]" />
      </Box>
    );
  }

  return (
    <Container size="xl" p={0} className="space-y-8 pb-10">
      {/* Top Banner / Welcome */}
      <Box className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#1C1C19] pb-6">
        <Box>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 mb-1">
            PayPilot AI · Financial Copilot
          </p>
          <Title order={1} className="font-serif text-[#1C1C19] text-3xl sm:text-4xl tracking-tight">
            Autonomous Cashflow Dashboard
          </Title>
          <p className="mt-1 text-xs text-stone-600 sm:text-sm">
            Real-time receivables, verified PayPal payments, and predictive cash analytics.
          </p>
        </Box>
        <Box className="flex items-center gap-3">
          <Link
            href="/assistant"
            className="flex items-center gap-2 border-2 border-[#1C1C19] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#1C1C19] shadow-[4px_4px_0px_0px_#1C1C19] transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Bot className="h-4 w-4" />
            <span>Ask Copilot</span>
          </Link>
          <Link
            href="/invoices?new=1"
            className="flex items-center gap-2 border-2 border-[#1C1C19] bg-[#1C1C19] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FBFBF9] shadow-[4px_4px_0px_0px_#1C1C19] transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create Invoice</span>
          </Link>
        </Box>
      </Box>

      {/* Metric Cards Row */}
      <Box className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="bg-[#FBFBF9] p-5 border-2 border-[#1C1C19] shadow-[4px_4px_0px_0px_#1C1C19]">
          <Box className="flex items-center justify-between text-stone-600">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <Box className="border-2 border-[#1C1C19] bg-white p-1.5 text-[#1C1C19]">
              <DollarSign className="h-4 w-4" />
            </Box>
          </Box>
          <Box className="mt-3">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#1C1C19]">
              ${data.totalRevenue.toFixed(2)}
            </span>
            <Box className="mt-2 flex items-center gap-1.5 text-xs font-bold" style={{ color: '#14532D' }}>
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{data.paidInvoicesCount} invoices collected</span>
            </Box>
          </Box>
        </Card>

        {/* Outstanding Payments */}
        <Card className="bg-[#FBFBF9] p-5 border-2 border-[#1C1C19] shadow-[4px_4px_0px_0px_#1C1C19]">
          <Box className="flex items-center justify-between text-stone-600">
            <span className="text-xs font-bold uppercase tracking-wider">Waiting to Receive</span>
            <Box className="border-2 border-[#1C1C19] bg-white p-1.5 text-[#1C1C19]">
              <Clock className="h-4 w-4" />
            </Box>
          </Box>
          <Box className="mt-3">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#1C1C19]">
              ${data.outstandingPayments.toFixed(2)}
            </span>
            <Box className="mt-2 flex items-center gap-1.5 text-xs font-bold" style={{ color: '#B45309' }}>
              <span>{data.pendingInvoicesCount} pending invoices</span>
            </Box>
          </Box>
        </Card>

        {/* Overdue Invoices */}
        <Card className="bg-[#FBFBF9] p-5 border-2 border-[#1C1C19] shadow-[4px_4px_0px_0px_#1C1C19]">
          <Box className="flex items-center justify-between text-stone-600">
            <span className="text-xs font-bold uppercase tracking-wider">Overdue Balance</span>
            <Box className="border-2 border-[#1C1C19] bg-white p-1.5 text-[#991B1B]">
              <AlertTriangle className="h-4 w-4" />
            </Box>
          </Box>
          <Box className="mt-3">
            <span className="font-serif text-3xl font-bold tracking-tight" style={{ color: '#991B1B' }}>
              ${data.overduePayments.toFixed(2)}
            </span>
            <Box className="mt-2 flex items-center gap-1.5 text-xs font-bold" style={{ color: '#991B1B' }}>
              <span>{data.overdueInvoicesCount} overdue (action required)</span>
            </Box>
          </Box>
        </Card>

        {/* Total Customers */}
        <Card className="bg-[#FBFBF9] p-5 border-2 border-[#1C1C19] shadow-[4px_4px_0px_0px_#1C1C19]">
          <Box className="flex items-center justify-between text-stone-600">
            <span className="text-xs font-bold uppercase tracking-wider">Active Customers</span>
            <Box className="border-2 border-[#1C1C19] bg-white p-1.5 text-[#1C1C19]">
              <Users className="h-4 w-4" />
            </Box>
          </Box>
          <Box className="mt-3">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#1C1C19]">
              {data.totalCustomers}
            </span>
            <Box className="mt-2 flex items-center gap-1.5 text-xs font-medium text-stone-600">
              <span>Client payment accounts</span>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Escrow Status Tracking Section */}
      <Card className="bg-[#FBFBF9] p-6 border-2 border-[#1C1C19] shadow-[4px_4px_0px_0px_#1C1C19]">
        <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b-2 border-stone-200 pb-4">
          <Box className="flex items-center gap-3">
            <Box className="border-2 border-[#1C1C19] bg-white p-2 text-[#1C1C19]">
              <ShieldCheck className="h-5 w-5" />
            </Box>
            <Box>
              <h2 className="font-serif text-xl font-bold text-[#1C1C19]">
                Escrow &amp; Milestone Settlement
              </h2>
              <p className="text-xs text-stone-600">
                PayPal authorization holds and proof-verified auto-releases
              </p>
            </Box>
          </Box>
          <Link
            href="/milestones"
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#1C1C19] hover:underline"
          >
            <span>Manage Milestones</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Box>

        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_ESCROW_ITEMS.map((item) => {
            const isReleased = item.status === 'RELEASED';
            const isHeld = item.status === 'HELD';

            const badgeBg = isReleased ? '#14532D' : isHeld ? '#B45309' : '#991B1B';
            const badgeLabel = isReleased
              ? 'Success Release'
              : isHeld
              ? 'Pending Hold'
              : 'Alert: Disputed';

            return (
              <Box
                key={item.id}
                className="bg-white border-2 border-[#1C1C19] p-4 flex flex-col justify-between"
              >
                <Box>
                  <Box className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold uppercase text-stone-500">
                      {item.id}
                    </span>
                    <Badge
                      radius={0}
                      className="font-bold uppercase text-[9px] text-white tracking-widest px-2 py-0.5 border border-[#1C1C19]"
                      style={{ backgroundColor: badgeBg }}
                    >
                      {badgeLabel}
                    </Badge>
                  </Box>
                  <h3 className="font-serif text-base font-bold text-[#1C1C19] leading-snug mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-600">{item.contract}</p>
                </Box>
                <Box className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">{item.date}</span>
                  <span className="font-bold text-sm text-[#1C1C19]">${item.amount.toFixed(2)}</span>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Card>

      {/* Visual Charts Row */}
      <Box className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Revenue Area Chart */}
        <Card className="bg-[#FBFBF9] p-6 border-2 border-[#1C1C19] shadow-[4px_4px_0px_0px_#1C1C19] lg:col-span-2">
          <Box className="flex items-center justify-between mb-4 border-b-2 border-stone-200 pb-3">
            <Box>
              <h2 className="font-serif text-xl font-bold text-[#1C1C19]">Cashflow Velocity</h2>
              <p className="text-xs text-stone-600">Monthly revenue trends and verified captures</p>
            </Box>
            <Badge
              radius={0}
              className="border-2 border-[#1C1C19] bg-white text-[#1C1C19] font-bold text-[10px] uppercase tracking-wider px-2 py-1"
            >
              Live Ledger
            </Badge>
          </Box>

          <Box className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1C1C19" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1C1C19" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#78716C" fontSize={11} tickLine={false} />
                <YAxis stroke="#78716C" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FBFBF9',
                    border: '2px solid #1C1C19',
                    borderRadius: '0px',
                    boxShadow: '4px 4px 0px 0px #1C1C19',
                    fontSize: '12px',
                    color: '#1C1C19',
                  }}
                  itemStyle={{ color: '#1C1C19', fontWeight: 'bold' }}
                  formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1C1C19" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        {/* Status Breakdown Donut Chart */}
        <Card className="bg-[#FBFBF9] p-6 border-2 border-[#1C1C19] shadow-[4px_4px_0px_0px_#1C1C19] flex flex-col justify-between">
          <Box className="border-b-2 border-stone-200 pb-3 mb-2">
            <h2 className="font-serif text-xl font-bold text-[#1C1C19]">Receivables Health</h2>
            <p className="text-xs text-stone-600">Payment status distribution</p>
          </Box>

          <Box className="h-44 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusDistribution}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.statusDistribution.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#1C1C19'} stroke="#1C1C19" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FBFBF9',
                    border: '2px solid #1C1C19',
                    borderRadius: '0px',
                    boxShadow: '4px 4px 0px 0px #1C1C19',
                    fontSize: '12px',
                    color: '#1C1C19',
                  }}
                  formatter={(val: any) => [`$${Number(val || 0).toFixed(2)}`, 'Total']}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Box className="grid grid-cols-3 gap-2 border-t-2 border-stone-200 pt-3 text-center">
            {data.statusDistribution.map((item) => (
              <Box key={item.status}>
                <Box className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-stone-700 uppercase tracking-wide">
                  <span
                    className="h-2.5 w-2.5 border border-[#1C1C19]"
                    style={{ backgroundColor: STATUS_COLORS[item.status] }}
                  ></span>
                  <span>{item.status}</span>
                </Box>
                <p className="mt-1 font-mono text-xs font-bold text-[#1C1C19]">
                  ${item.value.toFixed(0)}
                </p>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      {/* Recent Invoices & Transactions Row */}
      <Box className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Invoices */}
        <Card className="bg-[#FBFBF9] p-6 border-2 border-[#1C1C19] shadow-[4px_4px_0px_0px_#1C1C19]">
          <Box className="flex items-center justify-between mb-4 border-b-2 border-stone-200 pb-3">
            <Box className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#1C1C19]" />
              <h2 className="font-serif text-xl font-bold text-[#1C1C19]">Recent Invoices</h2>
            </Box>
            <Link
              href="/invoices"
              className="text-xs font-bold uppercase tracking-wider text-[#1C1C19] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Box>

          <Box className="divide-y-2 divide-stone-200">
            {data.recentInvoices.map((inv) => (
              <Box key={inv.id} className="py-3 flex items-center justify-between text-xs">
                <Box>
                  <Box className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#1C1C19]">{inv.invoiceNumber}</span>
                    <Badge
                      radius={0}
                      className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-[#1C1C19] text-white"
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
                  <p className="text-[11px] text-stone-600 mt-0.5">{inv.customerName}</p>
                </Box>
                <Box className="text-right">
                  <p className="font-bold text-[#1C1C19]">${inv.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-stone-500">Due {inv.dueDate}</p>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-[#FBFBF9] p-6 border-2 border-[#1C1C19] shadow-[4px_4px_0px_0px_#1C1C19]">
          <Box className="flex items-center justify-between mb-4 border-b-2 border-stone-200 pb-3">
            <Box className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#1C1C19]" />
              <h2 className="font-serif text-xl font-bold text-[#1C1C19]">Verified PayPal Transactions</h2>
            </Box>
            <Link
              href="/transactions"
              className="text-xs font-bold uppercase tracking-wider text-[#1C1C19] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Box>

          <Box className="divide-y-2 divide-stone-200">
            {data.recentTransactions.map((tx) => (
              <Box key={tx.id} className="py-3 flex items-center justify-between text-xs">
                <Box>
                  <Box className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#14532D' }} />
                    <span className="font-bold text-[#1C1C19]">{tx.customerName || 'PayPal Buyer'}</span>
                    {tx.isDemo && (
                      <span className="border border-[#1C1C19] bg-stone-200 px-1.5 py-0.2 text-[9px] font-bold uppercase text-[#1C1C19]">
                        Demo
                      </span>
                    )}
                  </Box>
                  <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                    {tx.paypalOrderId || tx.invoiceNumber}
                  </p>
                </Box>
                <Box className="text-right">
                  <p className="font-bold" style={{ color: '#14532D' }}>+${tx.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-stone-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>
    </Container>
  );
}