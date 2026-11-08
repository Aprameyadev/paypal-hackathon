const PAYPAL_API_BASE = (process.env.PAYPAL_BASE_URL || process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com').replace(/\/$/, '');
let cachedAccessToken: { token: string; expiresAt: number } | null = null;
let pendingTokenRequest: Promise<string> | null = null;

export function isPayPalConfigured(): boolean {
  const clientId = (process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID)?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  return !!(clientId && clientSecret);
}

function credentials() {
  const clientId = (process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID)?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error('PayPal is not configured. Set PAYPAL_CLIENT_ID (or NEXT_PUBLIC_PAYPAL_CLIENT_ID) and PAYPAL_CLIENT_SECRET.');
  }
  return { clientId, clientSecret };
}

function assertMoney(amount: number, currency: string) {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(Math.round(amount * 100))) {
    throw new Error('Amount must be a positive finite value');
  }
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error('Currency must be a three-letter uppercase currency code');
  }
}

function assertId(id: string, label: string) {
  if (!id || id.length > 128 || !/^[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error(`${label} is invalid`);
  }
}

export async function getPayPalAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60_000) return cachedAccessToken.token;
  if (pendingTokenRequest) return pendingTokenRequest;

  pendingTokenRequest = (async () => {
    const { clientId, clientSecret } = credentials();
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`PayPal OAuth failed (${response.status}): ${errText}`);
    }
    const data = await response.json() as { access_token?: string; expires_in?: number };
    if (!data.access_token || !Number.isFinite(data.expires_in)) {
      throw new Error('PayPal returned an invalid access token response');
    }
    cachedAccessToken = { token: data.access_token, expiresAt: Date.now() + Number(data.expires_in) * 1000 };
    return data.access_token;
  })();

  try {
    return await pendingTokenRequest;
  } finally {
    pendingTokenRequest = null;
  }
}

async function paypalRequest(path: string, init: RequestInit) {
  const token = await getPayPalAccessToken();
  const response = await fetch(`${PAYPAL_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 1000);
    throw new Error(`PayPal request failed (${response.status}): ${detail}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

/**
 * Creates a PayPal Orders v2 Order with CAPTURE intent for immediate invoice payment.
 */
export async function createInvoicePaymentOrder(params: {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency?: string;
  description: string;
}) {
  const currency = (params.currency || 'USD').toUpperCase();
  assertMoney(params.amount, currency);
  assertId(params.invoiceId, 'Invoice ID');

  const formattedAmount = (Math.round(params.amount * 100) / 100).toFixed(2);

  return paypalRequest('/v2/checkout/orders', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: params.invoiceId,
          custom_id: params.invoiceId,
          invoice_id: params.invoiceNumber,
          description: params.description.slice(0, 127),
          amount: {
            currency_code: currency,
            value: formattedAmount,
          },
        },
      ],
      application_context: {
        brand_name: 'PayPilot AI',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    }),
  });
}

/**
 * Captures an authorized or pending PayPal order.
 */
export async function captureInvoiceOrder(orderId: string) {
  assertId(orderId, 'Order ID');
  return paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
  });
}

/**
 * Retrieves details for a PayPal order to verify status and amount.
 */
export async function getOrderDetails(orderId: string) {
  assertId(orderId, 'Order ID');
  return paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
  });
}

/**
 * Verifies webhook signature using PayPal's verification endpoint.
 */
export async function verifyWebhookSignature(params: {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  webhookId: string;
  webhookEvent: Record<string, unknown>;
}): Promise<boolean> {
  try {
    const response = await paypalRequest('/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      body: JSON.stringify({
        auth_algo: params.authAlgo,
        cert_url: params.certUrl,
        transmission_id: params.transmissionId,
        transmission_sig: params.transmissionSig,
        transmission_time: params.transmissionTime,
        webhook_id: params.webhookId,
        webhook_event: params.webhookEvent,
      }),
    });
    return response?.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
}

// Backwards compatibility for earlier escrow functions
export async function createAuthorizationOrder(amount: number, currency = 'USD', customId?: string, requestId?: string) {
  assertMoney(amount, currency);
  if (customId) assertId(customId, 'Contract ID');
  if (requestId) assertId(requestId, 'Order request ID');
  return paypalRequest('/v2/checkout/orders', {
    method: 'POST',
    headers: { Prefer: 'return=representation', ...(requestId ? { 'PayPal-Request-Id': requestId } : {}) },
    body: JSON.stringify({
      intent: 'AUTHORIZE',
      purchase_units: [{
        ...(customId ? { custom_id: customId } : {}),
        description: 'PayPilot AI escrow authorization hold',
        amount: { currency_code: currency, value: (Math.round(amount * 100) / 100).toFixed(2) },
      }],
      application_context: { user_action: 'PAY_NOW', shipping_preference: 'NO_SHIPPING' },
    }),
  });
}

export async function authorizeOrder(orderId: string) {
  assertId(orderId, 'Order ID');
  return paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderId)}/authorize`, { method: 'POST' });
}

export async function captureAuthorization(authorizationId: string, amount: number, currency = 'USD', isFinalCapture = true, requestId?: string) {
  assertId(authorizationId, 'Authorization ID');
  assertMoney(amount, currency);
  if (requestId) assertId(requestId, 'Capture request ID');
  return paypalRequest(`/v2/payments/authorizations/${encodeURIComponent(authorizationId)}/capture`, {
    method: 'POST',
    headers: requestId ? { 'PayPal-Request-Id': requestId } : undefined,
    body: JSON.stringify({
      amount: { currency_code: currency, value: (Math.round(amount * 100) / 100).toFixed(2) },
      final_capture: isFinalCapture,
    }),
  });
}

export async function voidAuthorization(authorizationId: string) {
  assertId(authorizationId, 'Authorization ID');
  await paypalRequest(`/v2/payments/authorizations/${encodeURIComponent(authorizationId)}/void`, { method: 'POST' });
  return { status: 'VOIDED', authorizationId };
}
