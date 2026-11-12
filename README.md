# PayPilot AI — Your Autonomous Cashflow Copilot
> **PayPal AI Hackathon 2026 Official Submission**  
> *Tagline:* Get paid without chasing payments.

---

## 1. Executive Summary

Freelancers, creators, and small service businesses spend dozens of hours each month creating invoices, tracking payments, chasing overdue balances, and manually calculating cash flow.

**PayPilot AI** is an autonomous receivables management platform that couples **Google Gemini AI** with **PayPal Developer Sandbox infrastructure**. Instead of navigating cumbersome billing software, users talk to an intelligent copilot that:
- Inspects pending and overdue accounts receivable.
- Executes real-time financial tools via Gemini function calling.
- Generates instant **PayPal Orders v2** payment links.
- Confirms server-verified payments before marking invoices `PAID`.
- Drafts personalized, context-aware payment reminders.
- Visualizes cash flow velocity via **AG Grid** and **Recharts**.

---

## 2. Key Capabilities

### 🧠 Autonomous Financial Copilot (Gemini 3.8 Flash)
Powered by 11 real backend function-calling tools:
1. `getDashboardSummary()` — High-level cash flow and receivables summary.
2. `getOutstandingInvoices()` — Pending and unpaid invoices.
3. `getOverdueInvoices()` — Overdue invoices requiring action.
4. `getCustomerPaymentHistory(customerIdOrName)` — Historical payment behavior.
5. `createInvoice(data)` — Prepares invoices with human-in-the-loop confirmation.
6. `getInvoiceDetails(invoiceIdOrNumber)` — Detailed invoice terms.
7. `createPayPalOrder(invoiceIdOrNumber)` — Creates PayPal checkout links.
8. `getPaymentStatus(invoiceIdOrNumber)` — Real-time payment verification.
9. `getRevenueAnalytics(period)` — Revenue velocity and payment trends.
10. `draftPaymentReminder(invoiceIdOrNumber, tone)` — Tone-adjusted reminders.
11. `getTopCustomers()` — Lifetime revenue ranking.

### 💳 Real PayPal Sandbox Integration (Orders v2)
- **Server-Side Order Creation**: Secure server-to-server OAuth token generation and order initialization.
- **Verified Capture Flow**: Client-side checkout triggers verified server-side capture (`/api/paypal/capture-invoice-order`).
- **Cryptographic Webhook Verification**: `/api/paypal/webhook` endpoint with signature validation.
- **Audited Ledger**: All successful captures log order IDs and capture IDs into the immutable transaction ledger.

### 📊 AG Grid 36 & Recharts Interactive Analytics
- Multi-tab financial grid covering Invoices, Transactions, and Customers.
- Real-time filtering, column sorting, pagination, and one-click CSV export.
- Visual cashflow velocity area charts and donut status distributions.

---

## 3. Technology Stack

- **Framework**: Next.js 16 (App Router, React 19, Turbopack)
- **Styling**: Tailwind CSS v4, Lucide Icons
- **AI Intelligence**: Google Gemini API (`@google/genai`, `gemini-3.8-flash`)
- **Payments**: PayPal Developer Sandbox (Orders v2 API)
- **Data Tables**: AG Grid Community 36
- **Charts**: Recharts 3.10
- **Database**: Supabase PostgreSQL with RLS + Dual-mode in-memory demo store fallback

---

## 4. Quick Start & Local Run

### Prerequisites
- Node.js 18+ (tested on Node.js 20+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/paypilot-ai.git
cd paypilot-ai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Environment Variables (`.env.local`)

```env
# Gemini AI (https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key

# PayPal Developer Sandbox (https://developer.paypal.com/dashboard/)
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_ID=your_optional_webhook_id

# Supabase Database (Optional - local fallback active)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. PayPal Sandbox Testing Guide

1. Log in to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
2. Create a Sandbox **Buyer Account** and **Business Account**.
3. In PayPilot AI, navigate to **Invoices** (`/invoices`).
4. Click **"Pay with PayPal"** on `INV-2026-001` (Alex Johnson, $150.00).
5. Complete payment using sandbox credentials or the integrated Sandbox simulator.
6. Observe:
   - Invoice status immediately updates to **PAID**.
   - A verified transaction is recorded in **Transactions** with PayPal Order & Capture IDs.
   - Cash flow revenue updates live across the Dashboard and AG Grid analytics.
   - Asking the AI copilot *"How much money am I waiting to receive?"* reflects the updated balance.

---

## 7. Database Setup (Supabase)

If deploying with Supabase:
1. Open your Supabase SQL editor.
2. Execute [`database/schema.sql`](./database/schema.sql) to create tables and RLS policies.
3. (Optional) Run [`database/seed.sql`](./database/seed.sql) to load test customer data.

---

## 8. License

This project is licensed under the [MIT License](./LICENSE).
