'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  ShieldCheck,
  Bot,
  Database,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Activity,
  Zap,
  Clock,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface ServiceHealth {
  configured: boolean;
  connected: boolean;
  latencyMs?: number;
  error?: string;
}

interface HealthData {
  status: string;
  timestamp: string;
  services: {
    gemini: ServiceHealth;
    paypal: ServiceHealth;
    supabase: ServiceHealth;
  };
  env: { nodeEnv: string; appUrl: string };
}

function StatusPill({ service }: { service: ServiceHealth }) {
  if (!service.configured) {
    return (
      <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
        Not Configured
      </span>
    );
  }
  if (service.connected) {
    return (
      <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
        <Wifi className="h-2.5 w-2.5" />
        Connected{service.latencyMs !== undefined ? ` · ${service.latencyMs}ms` : ''}
      </span>
    );
  }
  return (
    <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20 flex items-center gap-1 w-fit">
      <WifiOff className="h-2.5 w-2.5" />
      Error
    </span>
  );
}

export default function SettingsPage() {
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  async function fetchHealth() {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  }

  useEffect(() => {
    fetchHealth();
  }, []);

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
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings &amp; Integrations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your PayPal Sandbox credentials, Gemini AI configuration, and demo mode.
          </p>
        </div>

        {/* Live Health Check Panel */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">Live Service Health</h2>
              {health && (
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                  health.status === 'healthy'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {health.status.toUpperCase()}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={fetchHealth}
              disabled={healthLoading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${healthLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {healthLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-400" />
              Checking services…
            </div>
          ) : health ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Gemini */}
              <div className="rounded-xl border border-slate-800 bg-[#0a1020] p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold text-white">Gemini AI</span>
                </div>
                <StatusPill service={health.services.gemini} />
                {health.services.gemini.error && (
                  <p className="text-[10px] text-rose-400 leading-relaxed">{health.services.gemini.error}</p>
                )}
                {!health.services.gemini.configured && (
                  <p className="text-[10px] text-amber-400 leading-relaxed">
                    Set GEMINI_API_KEY in .env.local
                  </p>
                )}
              </div>

              {/* PayPal */}
              <div className="rounded-xl border border-slate-800 bg-[#0a1020] p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold text-white">PayPal Sandbox</span>
                </div>
                <StatusPill service={health.services.paypal} />
                {health.services.paypal.error && (
                  <p className="text-[10px] text-rose-400 leading-relaxed">{health.services.paypal.error}</p>
                )}
                {!health.services.paypal.configured && (
                  <p className="text-[10px] text-amber-400 leading-relaxed">
                    Set PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET
                  </p>
                )}
              </div>

              {/* Supabase */}
              <div className="rounded-xl border border-slate-800 bg-[#0a1020] p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Supabase DB</span>
                </div>
                {health.services.supabase.configured ? (
                  <StatusPill service={health.services.supabase} />
                ) : (
                  <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                    In-Memory Mode
                  </span>
                )}
                {health.services.supabase.error && !health.services.supabase.connected && (
                  <p className="text-[10px] text-rose-400 leading-relaxed">{health.services.supabase.error}</p>
                )}
                {!health.services.supabase.configured && (
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Optional: set Supabase keys for persistent storage
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-rose-400">
              <AlertCircle className="h-3.5 w-3.5" />
              Could not reach /api/health. Make sure the server is running.
            </div>
          )}

          {health && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
              <Clock className="h-3 w-3" />
              Last checked: {new Date(health.timestamp).toLocaleTimeString()} ·
              App URL: <code className="text-blue-400">{health.env.appUrl}</code>
            </div>
          )}
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
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Environment Configuration (.env.local)</h3>
          </div>
          <p className="text-xs text-slate-400">
            Create or update <code className="text-blue-400">.env.local</code> in your project root with these keys to enable live API calls:
          </p>
          <pre className="rounded-xl border border-slate-800 bg-[#070b14] p-4 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`# ── Google Gemini AI ───────────────────────────────────────────
GEMINI_API_KEY=your_gemini_api_key_from_aistudio.google.com

# ── PayPal Developer Sandbox ───────────────────────────────────
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_ID=optional_webhook_verification_id

# ── Supabase PostgreSQL (Optional) ────────────────────────────
# Without these, the app uses an in-memory store (demo mode)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ── App ────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
          </pre>
          <p className="text-[11px] text-slate-500">
            After saving, restart the dev server (<code className="text-blue-400">npm run dev</code>) and click &quot;Refresh&quot; above to verify all services are connected.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
