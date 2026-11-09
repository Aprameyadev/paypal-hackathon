# PayPilot AI — 3-Minute Hackathon Demo Script & Walkthrough

> **PayPal AI Hackathon 2026**  
> **Tagline:** Get paid without chasing payments.  
> **Demo Target Time:** 2 minutes 45 seconds  

---

## 🎬 Video Recording Guide

### Scene 1: The Problem & Product Introduction (0:00 - 0:30)
- **Visual**: Start on the PayPilot AI Dashboard (`http://localhost:3000`).
- **Speaker**:  
  *"For freelancers, independent consultants, and creators, getting paid is exhausting. Creating invoices, chasing late payments, calculating receivables, and navigating multiple payment systems costs hours every week.*  
  *Meet **PayPilot AI** — your autonomous cashflow copilot. PayPilot AI couples Google Gemini's tool-calling intelligence directly with PayPal's Orders v2 infrastructure to automate invoicing, payment link generation, verified captures, and receivables tracking."*

### Scene 2: The Core Flow — Invoices & PayPal Sandbox Payment (0:30 - 1:15)
- **Visual**: Click on **Invoices** in the sidebar. Highlight invoice `INV-2026-001` for Alex Johnson ($150.00). Click **"Pay with PayPal"**.
- **Speaker**:  
  *"Here on the Invoices page, we see our accounts receivable categorized into pending, overdue, and paid. Let's look at Alex Johnson's invoice for $150.00.*  
  *Clicking 'Pay with PayPal' creates a live PayPal Sandbox order on our backend. When the customer completes payment, our server verifies the capture directly against PayPal before marking the invoice as PAID. Notice the cryptographic capture ID and order ID registered in real time."*
- **Action**: Click **"Complete Sandbox Payment ($150.00)"**. The badge switches to `PAID` with verified transaction details.

### Scene 3: The Autonomous AI Copilot with Gemini Function Calling (1:15 - 2:05)
- **Visual**: Navigate to **AI Assistant** (`/assistant`).
- **Speaker**:  
  *"Now let's switch to the AI Assistant. This isn't just a chatbot that gives generic text — it is an autonomous copilot powered by Gemini 2.5 Flash equipped with 11 secure financial backend tools."*
- **Action**:
  1. Click the suggested prompt: *"How much money am I waiting to receive?"*
     - Copilot invokes `getOutstandingInvoices` and provides the exact breakdown.
  2. Type: *"Draft a payment reminder for Sarah Miller."*
     - Copilot executes `draftPaymentReminder`, generating a personalized tone-adjusted reminder ready to copy to clipboard.
  3. Type: *"Create an invoice for Alex for $150 for website development."*
     - Copilot invokes `createInvoice` and presents an approval card for human confirmation before altering financial records.

### Scene 4: AG Grid & Recharts Financial Analytics (2:05 - 2:35)
- **Visual**: Navigate to **Analytics** (`/analytics`).
- **Speaker**:  
  *"For deep financial visibility, PayPilot embeds AG Grid 36 and Recharts. Users can sort, filter, and search across thousands of invoices and verified PayPal transactions, or export instant CSV reports for their accountant with a single click."*
- **Action**: Filter columns, sort by amount, and click **"Export CSV"**.

### Scene 5: Architecture & Closing (2:35 - 2:45)
- **Visual**: Navigate to **Settings** showing connected services (PayPal Developer Sandbox, Google Gemini AI, Supabase).
- **Speaker**:  
  *"Built with Next.js 16, TypeScript, Tailwind CSS, Google Gemini 2.5 Flash, AG Grid, and the PayPal Orders v2 API. PayPilot AI turns receivables from a chore into an automated, autonomous cashflow copilot. Thank you!"*

---

## 🧪 Quick Test Checklist for Judges & Evaluators

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| **1. Overview** | Visit `http://localhost:3000` | Real-time cash flow chart, revenue totals, overdue indicators. |
| **2. Invoices** | Go to `/invoices` and click **"Pay with PayPal"** on `INV-2026-001` | Modal opens with PayPal Sandbox checkout. |
| **3. Capture** | Complete payment in modal | Invoice status flips to `PAID`, logged in `/transactions`. |
| **4. AI Copilot** | Visit `/assistant` and ask *"How much money am I waiting to receive?"* | Accurate outstanding balance calculation using backend tools. |
| **5. AI Action** | Ask *"Draft a reminder for Sarah Miller"* | Prepared draft reminder appears with 1-click copy. |
| **6. AG Grid** | Visit `/analytics` | Interactive grid with sorting, multi-column search, and CSV export. |
| **7. Reset** | Click **"Reset Demo Data"** in top bar | Resets dataset back to pristine initial state anytime. |
