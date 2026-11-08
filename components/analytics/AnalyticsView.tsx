'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, ColDef, GridApi } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {
  BarChart3,
  Download,
  Search,
  Filter,
  FileText,
  CreditCard,
  Users,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Invoice, Transaction, CustomerWithMetrics } from '@/types';

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

export default function AnalyticsView() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'transactions' | 'customers'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<CustomerWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickFilter, setQuickFilter] = useState('');

  const gridRef = useRef<AgGridReact>(null);

  async function loadAllData() {
    try {
      const [invRes, txRes, custRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/transactions'),
        fetch('/api/customers'),
      ]);
      const [invData, txData, custData] = await Promise.all([
        invRes.json(),
        txRes.json(),
        custRes.json(),
      ]);

      if (invData.invoices) setInvoices(invData.invoices);
      if (txData.transactions) setTransactions(txData.transactions);
      if (custData.customers) setCustomers(custData.customers);
    } catch (err) {
      console.error('Failed to load analytics data', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  function handleExportCsv() {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `paypilot_${activeTab}_${Date.now()}.csv`,
      });
    }
  }

  // AG Grid Column Definitions
  const invoiceColumns: ColDef<Invoice>[] = useMemo(
    () => [
      { field: 'invoiceNumber', headerName: 'Invoice #', sortable: true, filter: true, width: 150 },
      { field: 'customerName', headerName: 'Customer', sortable: true, filter: true, width: 170 },
      { field: 'description', headerName: 'Description', sortable: true, filter: true, flex: 1 },
      {
        field: 'amount',
        headerName: 'Amount',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 130,
        valueFormatter: (params) => `$${Number(params.value || 0).toFixed(2)}`,
        cellStyle: { fontWeight: 'bold', color: '#10B981' },
      },
      {
        field: 'status',
        headerName: 'Status',
        sortable: true,
        filter: true,
        width: 120,
        cellRenderer: (params: any) => {
          const s = params.value;
          const bg =
            s === 'PAID'
              ? 'bg-emerald-500/10 text-emerald-400'
              : s === 'OVERDUE'
              ? 'bg-rose-500/10 text-rose-400'
              : 'bg-blue-500/10 text-blue-400';
          return `<span class="rounded px-2 py-0.5 text-[10px] font-semibold ${bg}">${s}</span>`;
        },
      },
      { field: 'dueDate', headerName: 'Due Date', sortable: true, filter: true, width: 130 },
      { field: 'issueDate', headerName: 'Issue Date', sortable: true, filter: true, width: 130 },
    ],
    []
  );

  const transactionColumns: ColDef<Transaction>[] = useMemo(
    () => [
      { field: 'invoiceNumber', headerName: 'Invoice #', sortable: true, filter: true, width: 140 },
      { field: 'customerName', headerName: 'Customer / Buyer', sortable: true, filter: true, width: 180 },
      { field: 'paypalOrderId', headerName: 'PayPal Order ID', sortable: true, filter: true, width: 200 },
      { field: 'paypalCaptureId', headerName: 'Capture ID', sortable: true, filter: true, width: 200 },
      {
        field: 'amount',
        headerName: 'Captured',
        sortable: true,
        width: 130,
        valueFormatter: (params) => `+$${Number(params.value || 0).toFixed(2)}`,
        cellStyle: { fontWeight: 'bold', color: '#10B981' },
      },
      { field: 'paymentSource', headerName: 'Source', sortable: true, filter: true, width: 150 },
      {
        field: 'createdAt',
        headerName: 'Timestamp',
        sortable: true,
        width: 160,
        valueFormatter: (p) => new Date(p.value).toLocaleString(),
      },
    ],
    []
  );

  const customerColumns: ColDef<CustomerWithMetrics>[] = useMemo(
    () => [
      { field: 'name', headerName: 'Customer Name', sortable: true, filter: true, width: 180 },
      { field: 'company', headerName: 'Company', sortable: true, filter: true, width: 180 },
      { field: 'email', headerName: 'Email', sortable: true, filter: true, flex: 1 },
      {
        field: 'totalPaid',
        headerName: 'Total Paid',
        sortable: true,
        width: 140,
        valueFormatter: (p) => `$${Number(p.value || 0).toFixed(2)}`,
        cellStyle: { fontWeight: 'bold', color: '#10B981' },
      },
      {
        field: 'totalOutstanding',
        headerName: 'Outstanding',
        sortable: true,
        width: 140,
        valueFormatter: (p) => `$${Number(p.value || 0).toFixed(2)}`,
        cellStyle: { fontWeight: 'bold', color: '#38BDF8' },
      },
      { field: 'invoiceCount', headerName: 'Invoices', sortable: true, width: 110 },
    ],
    []
  );

  // Chart data: revenue by customer
  const customerRevenueChart = customers.map((c) => ({
    name: c.name.split(' ')[0],
    paid: c.totalPaid,
    outstanding: c.totalOutstanding,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Interactive Financial Analytics
            <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
              AG Grid 36
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise-grade sorting, filtering, column resizing, and CSV data export.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Recharts Customer Value Chart */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white">Customer Value & Exposure</h3>
          <p className="text-xs text-slate-400">Paid revenue vs outstanding receivables by customer</p>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={customerRevenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                formatter={(v: any) => [`$${Number(v || 0).toFixed(2)}`, '']}
              />
              <Bar dataKey="paid" name="Paid Revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outstanding" name="Outstanding" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs and Quick Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'invoices'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'bg-[#0c1220] text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Invoices Ledger ({invoices.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'transactions'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'bg-[#0c1220] text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Transactions ({transactions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'customers'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'bg-[#0c1220] text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Customers ({customers.length})</span>
          </button>
        </div>

        {/* Global Quick Filter */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
            placeholder="Quick search table records..."
            className="w-full rounded-xl border border-slate-800 bg-[#0c1220] py-2 pl-9 pr-4 text-xs text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* AG Grid Container */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-4">
        {loading ? (
          <div className="flex h-96 items-center justify-center text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="ag-theme-quartz-dark h-[450px] w-full text-xs">
            {activeTab === 'invoices' && (
              <AgGridReact<Invoice>
                ref={gridRef}
                rowData={invoices}
                columnDefs={invoiceColumns}
                quickFilterText={quickFilter}
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 20, 50]}
                animateRows={true}
                defaultColDef={{ resizable: true }}
              />
            )}
            {activeTab === 'transactions' && (
              <AgGridReact<Transaction>
                ref={gridRef}
                rowData={transactions}
                columnDefs={transactionColumns}
                quickFilterText={quickFilter}
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 20, 50]}
                animateRows={true}
                defaultColDef={{ resizable: true }}
              />
            )}
            {activeTab === 'customers' && (
              <AgGridReact<CustomerWithMetrics>
                ref={gridRef}
                rowData={customers}
                columnDefs={customerColumns}
                quickFilterText={quickFilter}
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 20, 50]}
                animateRows={true}
                defaultColDef={{ resizable: true }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
