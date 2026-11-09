# PayPilot AI — Project Context & Architecture

**PayPilot AI: Your Autonomous Cashflow Copilot**  
*PayPal AI Hackathon 2026 Submission Prototype*

---

## 1. Project Overview & Status

PayPilot AI is an autonomous receivables management platform combining conversational AI with PayPal payment infrastructure. Freelancers, creators, and service businesses can talk to an AI copilot to manage invoices, trace outstanding debts, auto-generate PayPal checkout links, draft personalized reminders, and analyze revenue trends.

### Existing Architecture vs Rebuilt Modules
- **Previous Prototype**: Included a basic contract parser and escrow milestone structure.
- **Transformed Architecture**:
  - Full receivables lifecycle: Invoices, Customers, Transactions, Reminders, and Autonomous Financial Tools.
  - Complete sidebar & topbar navigation layout (Overview, AI Assistant, Invoices, Customers, Transactions, Analytics, Settings).
  - Dual-mode Data Layer (`lib/db`): Works directly with Supabase PostgreSQL when configured; seamlessly provides a reactive local demo store populated with Alex Johnson ($150, Pending), Sarah Miller ($250, Overdue), and John Smith ($100, Paid) so testing works instantly out-of-the-box.
  - PayPal Integration: Orders API v2 (create & capture order) with `@paypal/react-paypal-js` client SDK + server-side capture verification and webhook endpoint.
  - Gemini AI Function Calling: 11 specialized financial tools with user confirmation for consequential actions.
  - AG Grid & Recharts Analytics: Interactive financial tables and dynamic visualizations.

---

## 2. Technology Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts 3.10, AG Grid 36.3
- **AI**: Google Gemini API (`@google/genai`, `gemini-2.5-flash` with function/tool calling and structured outputs)
- **Payments**: PayPal Developer Sandbox (Orders v2 Create & Capture, Webhooks)
- **Database**: Supabase PostgreSQL with RLS, with intelligent fallback data adapter

---

## 3. Database Schema

Tables defined in `database/schema.sql`:
1. `profiles`
2. `customers`
3. `invoices`
4. `transactions`
5. `reminders`
6. `agent_actions`

---

## 4. Execution Phases

- [x] Phase 1: Inspection, Dependency audit & Project Context
- [x] Phase 2: Foundation (Database schema, seed data, Dual Data Adapter, Layout & Navigation)
- [x] Phase 3: Core Application (Dashboard, Invoices, Customers, Transactions, Settings)
- [x] Phase 4: PayPal Sandbox Integration (Orders v2, Capture, Webhooks, Client Buttons)
- [x] Phase 5: Gemini AI Financial Assistant (11 tools, confirmation dialogs, memory)
- [x] Phase 6: AG Grid & Recharts Analytics
- [x] Phase 7: Polish, Error Handling, Design & Responsiveness
- [x] Phase 8: Verification, Testing & Hackathon Documentation

---

## 5. End-to-End Hackathon Workflow Verification

The application satisfies the core hackathon acceptance criterion:
> *"Create an invoice for Alex for $150, generate a PayPal payment link, complete the sandbox payment, verify the payment, and then ask the AI assistant how much money is still outstanding."*

1. **Dashboard & Metrics**: Displays live cash flow velocity charts, total receivables ($570 outstanding across Alex Johnson and Elena Rostova), overdue alerts ($250 for Sarah Miller), and settled PayPal transactions ($100 for John Smith).
2. **Invoice Generation**: Form-based or autonomous copilot creation (`INV-2026-001` for Alex Johnson at $150.00).
3. **PayPal Sandbox Checkout**: Modal integration initializing PayPal Orders v2 and executing verified server-side capture (`/api/paypal/capture-invoice-order`).
4. **Autonomous AI Copilot**: Gemini 2.5 Flash function calling executes 11 financial tools, displaying real-time receivables without fabrication and seeking confirmation for mutations.
5. **Interactive AG Grid Analytics**: Instant sorting, filtering, and CSV export for Invoices, Customers, and immutable Transaction audit logs.
