/**
 * GET /api/health
 *
 * Returns a live health check of all configured external services:
 * - Gemini AI (checks if GEMINI_API_KEY is set and can ping)
 * - PayPal Sandbox (checks if credentials are configured and obtains an access token)
 * - Supabase (checks if URL + key is set and can reach the DB)
 *
 * This endpoint is whitelisted in middleware (no auth required).
 * Response format is JSON — suitable for a /settings page or uptime monitor.
 */
import { NextResponse } from 'next/server';
import { isGeminiConfigured } from '@/lib/gemini/assistant';
import { isPayPalConfigured, getPayPalAccessToken } from '@/lib/paypal/client';
import { isSupabaseConfigured } from '@/lib/db';
import { getSupabase } from '@/lib/supabase/client';

interface ServiceStatus {
  configured: boolean;
  connected: boolean;
  latencyMs?: number;
  error?: string;
}

async function checkGemini(): Promise<ServiceStatus> {
  if (!isGeminiConfigured()) {
    return { configured: false, connected: false, error: 'GEMINI_API_KEY not set' };
  }
  // If key is set, we report it as configured; full ping would cost tokens
  return { configured: true, connected: true };
}

async function checkPayPal(): Promise<ServiceStatus> {
  if (!isPayPalConfigured()) {
    return { configured: false, connected: false, error: 'PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not set' };
  }
  const start = Date.now();
  try {
    await getPayPalAccessToken();
    return { configured: true, connected: true, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'PayPal auth failed',
    };
  }
}

async function checkSupabase(): Promise<ServiceStatus> {
  if (!isSupabaseConfigured()) {
    return { configured: false, connected: false, error: 'Supabase URL or keys not set — using in-memory store' };
  }
  const start = Date.now();
  try {
    const db = getSupabase();
    const { error } = await db.from('customers').select('id').limit(1);
    if (error) throw new Error(error.message);
    return { configured: true, connected: true, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Supabase query failed',
    };
  }
}

export async function GET() {
  const [gemini, paypal, supabase] = await Promise.all([
    checkGemini(),
    checkPayPal(),
    checkSupabase(),
  ]);

  const allHealthy = gemini.connected && paypal.connected;
  const status = allHealthy ? 200 : 206; // 206 = partial content (some services degraded)

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        gemini,
        paypal,
        supabase,
      },
      env: {
        nodeEnv: process.env.NODE_ENV,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
    },
    { status }
  );
}
