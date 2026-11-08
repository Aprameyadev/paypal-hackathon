'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Invoice } from '@/types';

interface PayPalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSuccess: () => void;
}

export default function PayPalCheckoutModal({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}: PayPalCheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    orderId: string;
    captureId: string;
    isDemo: boolean;
  } | null>(null);

  if (!isOpen || !invoice) return null;

  async function handleProcessPayment() {
    if (!invoice || loading) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Create order
      const orderRes = await fetch('/api/paypal/create-invoice-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to initialize PayPal order');

      // 2. Capture order
      const captureRes = await fetch('/api/paypal/capture-invoice-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          orderId: orderData.id,
        }),
      });
      const captureData = await captureRes.json();
      if (!captureRes.ok) throw new Error(captureData.error || 'Failed to capture PayPal payment');

      setSuccessData({
        orderId: captureData.orderId,
        captureId: captureData.captureId,
        isDemo: captureData.isDemo,
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment process failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0e1626] p-6 text-slate-100 shadow-2xl shadow-black/80">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#003087]/20 border border-[#0079C1]/30 text-[#0079C1]">
            <span className="font-extrabold text-base italic tracking-tighter text-blue-400">P</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              PayPal Checkout
              <span className="text-[10px] rounded bg-blue-500/10 px-2 py-0.5 text-blue-400 border border-blue-500/20 font-medium">
                Sandbox
              </span>
            </h3>
            <p className="text-xs text-slate-400">Secure Orders API v2 Payment Authorization</p>
          </div>
        </div>

        {/* Invoice Summary Box */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-[#070b14] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Invoice Number</span>
            <span className="font-mono font-semibold text-white">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Customer</span>
            <span className="font-medium text-slate-200">{invoice.customerName}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Description</span>
            <span className="max-w-[180px] truncate text-slate-300">{invoice.description}</span>
          </div>
          <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Total Due</span>
            <span className="text-lg font-bold text-emerald-400">
              ${invoice.amount.toFixed(2)} {invoice.currency}
            </span>
          </div>
        </div>

        {/* Success View */}
        {successData ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Payment Verified & Captured!</span>
              </div>
              <p className="text-xs text-emerald-300/80">
                Invoice {invoice.invoiceNumber} has been updated to <strong className="text-emerald-300">PAID</strong> and recorded in your transaction ledger.
              </p>
              <div className="pt-2 text-[11px] font-mono text-emerald-400 space-y-0.5 border-t border-emerald-500/20">
                <p>Order ID: {successData.orderId}</p>
                <p>Capture ID: {successData.captureId}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Back to Invoices
            </button>
          </div>
        ) : (
          /* Action View */
          <div className="space-y-4">
            {error && (
              <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleProcessPayment}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white py-3 text-xs font-bold transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing PayPal Sandbox Capture...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Complete Sandbox Payment (${invoice.amount.toFixed(2)})</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-500">
              Verified sandbox test execution with Orders API v2 & server-side capture verification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
