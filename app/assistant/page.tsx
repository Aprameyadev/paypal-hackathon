'use client';

import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Bot,
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  CreditCard,
  FileText,
  DollarSign,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  toolInvoked?: string;
  toolResult?: any;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "👋 Hi! I'm your autonomous PayPilot Cashflow Copilot. I can inspect your invoices, trace overdue debts, draft payment reminders, prepare new invoices with your approval, and generate PayPal payment links. What would you like to do?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<any | null>(null);
  const [actionExecuting, setActionExecuting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = [
    'How much money am I waiting to receive?',
    'Show me all overdue invoices.',
    'Who are my highest-paying customers?',
    'Create an invoice for Alex for $150 for website development.',
    'Draft a payment reminder for Sarah Miller.',
    'What was my revenue this month?',
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingAction]);

  async function handleSend(textToSend?: string) {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Send conversation history to /api/ai/assistant
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: data.reply || 'I processed your request.',
        toolInvoked: data.toolInvoked,
        toolResult: data.toolResult,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Check if tool result requires user confirmation
      if (data.toolResult?.requiresConfirmation) {
        setPendingAction(data.toolResult);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: 'Sorry, I encountered an error connecting to the AI backend. Please verify your internet connection or check your GEMINI_API_KEY in Settings.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmAction() {
    if (!pendingAction || actionExecuting) return;
    setActionExecuting(true);

    try {
      if (pendingAction.actionType === 'CREATE_INVOICE') {
        const details = pendingAction.details;
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: details.customerId,
            description: details.description,
            amount: details.amount,
            dueDate: details.dueDate,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create invoice');

        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            role: 'model',
            text: `✅ Invoice **${data.invoice.invoiceNumber}** for **$${data.invoice.amount.toFixed(
              2
            )}** has been created and saved! You can now generate a PayPal checkout link.`,
            toolResult: { invoiceCreated: data.invoice },
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-err-${Date.now()}`,
          role: 'model',
          text: `❌ Action failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        },
      ]);
    } finally {
      setActionExecuting(false);
      setPendingAction(null);
    }
  }

  function handleCopyReminder(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 text-white shadow-md shadow-blue-600/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                PayPilot Financial Copilot
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                  Gemini 2.5 Flash
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                11 Autonomous financial tools with human-in-the-loop authorization
              </p>
            </div>
          </div>
          <Link
            href="/settings"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            API Settings
          </Link>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto py-6 space-y-5 pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 text-sm ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'model' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-[#0e1626] border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Tool Invocation Badge */}
                {m.toolInvoked && (
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono font-medium text-blue-400">
                    <Sparkles className="h-3 w-3" />
                    <span>Executed: {m.toolInvoked}()</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{m.text}</div>

                {/* Structured Result: Payment Reminder Draft */}
                {m.toolResult?.messageDraft && (
                  <div className="mt-3 rounded-xl border border-slate-700/80 bg-[#070b14] p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold text-slate-300">
                        Drafted for: {m.toolResult.customer} ({m.toolResult.invoiceNumber})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyReminder(m.toolResult.messageDraft, m.id)}
                        className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy draft</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="font-sans italic text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      &quot;{m.toolResult.messageDraft}&quot;
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Label: Prepared Draft (ready to paste in email/SMS).
                    </p>
                  </div>
                )}

                {/* Structured Result: Invoices List */}
                {m.toolResult?.invoices && (
                  <div className="mt-3 space-y-2">
                    {m.toolResult.invoices.map((inv: any) => (
                      <div
                        key={inv.invoiceNumber}
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#070b14] p-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-white">
                              {inv.invoiceNumber}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                inv.status === 'OVERDUE'
                                  ? 'bg-rose-500/10 text-rose-400'
                                  : 'bg-blue-500/10 text-blue-400'
                              }`}
                            >
                              {inv.status || 'DUE'}
                            </span>
                          </div>
                          <p className="text-slate-400 mt-0.5">
                            {inv.customer} · {inv.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">${Number(inv.amount).toFixed(2)}</p>
                          <Link
                            href="/invoices"
                            className="text-[10px] text-blue-400 hover:underline"
                          >
                            View Invoice
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Structured Result: Created Invoice Action Card */}
                {m.toolResult?.invoiceCreated && (
                  <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-emerald-300">
                        {m.toolResult.invoiceCreated.invoiceNumber}
                      </p>
                      <p className="text-[11px] text-emerald-400/80">
                        {m.toolResult.invoiceCreated.description}
                      </p>
                    </div>
                    <Link
                      href={`/invoices?pay=${m.toolResult.invoiceCreated.id}`}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                    >
                      <span>Pay with PayPal</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Pending Consequential Action Confirmation Card */}
          {pendingAction && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
                <ShieldAlert className="h-4 w-4" />
                <span>Action Confirmation Required</span>
              </div>
              <p className="text-slate-300">
                The AI is requesting permission to create a new financial record:
              </p>
              <div className="rounded-xl border border-slate-800 bg-[#070b14] p-3 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="text-white font-semibold">
                    {pendingAction.details.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="text-emerald-400 font-bold">
                    ${pendingAction.details.amount.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Description:</span>
                  <span className="text-slate-300">{pendingAction.details.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Due Date:</span>
                  <span className="text-slate-300">{pendingAction.details.dueDate}</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingAction(null)}
                  disabled={actionExecuting}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={actionExecuting}
                  className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 text-xs transition-colors shadow-md shadow-amber-950"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{actionExecuting ? 'Creating...' : 'Approve & Create Invoice'}</span>
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Bot className="h-4 w-4 text-blue-400 animate-pulse" />
              <span>Analyzing cashflow ledger with Gemini tools...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Pills */}
        <div className="py-2 overflow-x-auto no-scrollbar flex items-center gap-2">
          {promptSuggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(s)}
              disabled={loading}
              className="shrink-0 rounded-full border border-slate-800 bg-[#0c1220] px-3 py-1 text-xs text-slate-400 hover:border-blue-500/40 hover:text-blue-300 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative pt-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about invoices, cashflow, or type 'Create invoice for Alex'..."
            className="w-full rounded-2xl border border-slate-800 bg-[#0c1220] px-4 py-3.5 pr-12 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none shadow-lg shadow-black/40"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send query"
            className="absolute right-2 top-4 rounded-xl bg-blue-600 p-2 text-white hover:bg-blue-500 disabled:opacity-30 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
