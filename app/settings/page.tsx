'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Settings,
  ShieldCheck,
  Bot,
  Database,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

export default function SettingsPage() {
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  async function handleReset() {
    setResetting(true);
    setResetSuccess(false);
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings & Integrations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your PayPal Sandbox credentials, Gemini AI configuration, and demo mode.
          </p>
        </div>

        {/* Integration Status Cards */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Connected Services
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* PayPal Sandbox */}
            <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400 border border-blue-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  Sandbox Active
                </span>
              </div>
              <h3 className="font-bold text-white text-sm">PayPal Sandbox</h3>
              <p className="text-xs text-slate-400 mt-1">
                Orders v2 Checkout & Capture with automatic server verification.
              </p>
            </div>

            {/* Google Gemini */}
            <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400 border border-blue-500/20">
                  <Bot className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                  Gemini 2.5 Flash
                </span>
              </div>
              <h3 className="font-bold text-white text-sm">Gemini AI Copilot</h3>
              <p className="text-xs text-slate-400 mt-1">
                Function calling across 11 autonomous financial tools.
              </p>
            </div>

            {/* Supabase Database */}
            <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
                  <Database className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                  Dual Adapter
                </span>
              </div>
              <h3 className="font-bold text-white text-sm">Database & Ledger</h3>
              <p className="text-xs text-slate-400 mt-1">
                Supabase PostgreSQL ready with reactive demo data store fallback.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Mode & Data Reset */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Hackathon Demo Mode</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Reset your application data back to the default hackathon state (Alex Johnson, Sarah Miller, John Smith) at any time.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting...' : 'Reset Demo Records'}</span>
            </button>
          </div>

          {resetSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Demo records have been restored to initial state!</span>
            </div>
          )}
        </div>

        {/* PayPal Webhook Setup Guide */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">PayPal Webhook Configuration</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              To receive live webhook callbacks from your PayPal Sandbox account, register this endpoint URL in your PayPal Developer Dashboard.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#070b14] p-3 text-xs font-mono text-slate-300">
            <span className="truncate pr-2">https://your-domain.com/api/paypal/webhook</span>
            <button
              type="button"
              onClick={() => handleCopy('https://your-domain.com/api/paypal/webhook')}
              className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 shrink-0 font-sans"
            >
              {copiedWebhook ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 space-y-1">
            <p><strong>Subscribed Events:</strong></p>
            <ul className="list-disc pl-5 space-y-0.5 text-slate-400">
              <li><code>CHECKOUT.ORDER.APPROVED</code></li>
              <li><code>PAYMENT.CAPTURE.COMPLETED</code></li>
            </ul>
          </div>
        </div>

        {/* Environment Variables Reference */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-3">
          <h3 className="text-sm font-bold text-white">Environment Configuration (.env.local)</h3>
          <p className="text-xs text-slate-400">
            Configure these keys to enable production external APIs:
          </p>
          <pre className="rounded-xl border border-slate-800 bg-[#070b14] p-4 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`# AI Assistant
GEMINI_API_KEY=your_gemini_api_key

# PayPal Developer Sandbox
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_ID=optional_webhook_id

# Supabase Database (Optional - local fallback active)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`}
          </pre>
        </div>
      </div>
    </AppLayout>
  );
}
