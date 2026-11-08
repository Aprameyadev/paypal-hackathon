import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import {
  getDashboardSummary,
  getInvoices,
  getInvoiceById,
  getCustomers,
  getCustomerById,
  getTransactions,
  createInvoice,
  saveReminder,
} from '@/lib/db';
import { createInvoicePaymentOrder, isPayPalConfigured } from '@/lib/paypal/client';

export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY?.trim();
}

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  return new GoogleGenAI({ apiKey });
}

// 11 Gemini Tool Declarations
export const assistantToolDeclarations: FunctionDeclaration[] = [
  {
    name: 'getDashboardSummary',
    description: 'Get an executive financial summary including total revenue, outstanding payments, overdue balances, and invoice counts.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'getOutstandingInvoices',
    description: 'Retrieve all pending or unpaid invoices that are awaiting payment.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'getOverdueInvoices',
    description: 'Retrieve all overdue invoices that have passed their payment due date.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'getCustomerPaymentHistory',
    description: 'Get the detailed payment and invoice history for a specific customer by ID or name.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerIdOrName: {
          type: Type.STRING,
          description: 'The unique ID or full name of the customer (e.g. Alex Johnson)',
        },
      },
      required: ['customerIdOrName'],
    },
  },
  {
    name: 'createInvoice',
    description: 'Draft a new customer invoice with an amount, description, and due date. Requires user confirmation before finalizing.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerName: { type: Type.STRING, description: 'Name of the customer (e.g. Alex Johnson)' },
        amount: { type: Type.NUMBER, description: 'Invoice amount in USD' },
        description: { type: Type.STRING, description: 'Deliverable or work description' },
        dueDateDaysFromNow: { type: Type.NUMBER, description: 'Number of days until the invoice is due (defaults to 14)' },
      },
      required: ['customerName', 'amount', 'description'],
    },
  },
  {
    name: 'getInvoiceDetails',
    description: 'Get full details for a specific invoice by invoice number or ID (e.g. INV-2026-001).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        invoiceIdOrNumber: { type: Type.STRING, description: 'The invoice number or ID' },
      },
      required: ['invoiceIdOrNumber'],
    },
  },
  {
    name: 'createPayPalOrder',
    description: 'Generate a PayPal Sandbox checkout order link for an unpaid invoice.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        invoiceIdOrNumber: { type: Type.STRING, description: 'The invoice number or ID' },
      },
      required: ['invoiceIdOrNumber'],
    },
  },
  {
    name: 'getPaymentStatus',
    description: 'Check the real-time payment status of an invoice.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        invoiceIdOrNumber: { type: Type.STRING, description: 'The invoice number or ID' },
      },
      required: ['invoiceIdOrNumber'],
    },
  },
  {
    name: 'getRevenueAnalytics',
    description: 'Get revenue analytics, payment trends, and paid vs unpaid breakdown.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        period: { type: Type.STRING, description: 'Analytics period, e.g. "month", "quarter", "year"' },
      },
    },
  },
  {
    name: 'draftPaymentReminder',
    description: 'Generate a friendly, professional payment reminder for an overdue or pending invoice. Saves as draft.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        invoiceIdOrNumber: { type: Type.STRING, description: 'The invoice number or ID to draft a reminder for' },
        tone: { type: Type.STRING, description: 'Tone of the reminder: "friendly", "formal", or "urgent"' },
      },
      required: ['invoiceIdOrNumber'],
    },
  },
  {
    name: 'getTopCustomers',
    description: 'Get the highest-paying and most active customers ranked by total revenue paid.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
];

// Backend Tool Execution Map
export async function executeTool(name: string, args: Record<string, any>): Promise<any> {
  switch (name) {
    case 'getDashboardSummary': {
      return await getDashboardSummary();
    }

    case 'getOutstandingInvoices': {
      const invoices = await getInvoices();
      const outstanding = invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE');
      return {
        count: outstanding.length,
        totalOutstanding: outstanding.reduce((sum, i) => sum + i.amount, 0),
        invoices: outstanding.map(i => ({
          invoiceNumber: i.invoiceNumber,
          customer: i.customerName,
          amount: i.amount,
          currency: i.currency,
          dueDate: i.dueDate,
          status: i.status,
          description: i.description,
        })),
      };
    }

    case 'getOverdueInvoices': {
      const invoices = await getInvoices();
      const overdue = invoices.filter(i => i.status === 'OVERDUE');
      return {
        count: overdue.length,
        totalOverdue: overdue.reduce((sum, i) => sum + i.amount, 0),
        invoices: overdue.map(i => ({
          invoiceNumber: i.invoiceNumber,
          customer: i.customerName,
          amount: i.amount,
          currency: i.currency,
          dueDate: i.dueDate,
          description: i.description,
        })),
      };
    }

    case 'getCustomerPaymentHistory': {
      const query = String(args.customerIdOrName || '').toLowerCase();
      const customers = await getCustomers();
      const matchedCustomer = customers.find(c => c.id === query || c.name.toLowerCase().includes(query));
      if (!matchedCustomer) {
        return { error: `Customer matching "${args.customerIdOrName}" was not found.` };
      }
      const invoices = await getInvoices();
      const customerInvoices = invoices.filter(i => i.customerId === matchedCustomer.id);
      return {
        customer: {
          name: matchedCustomer.name,
          email: matchedCustomer.email,
          company: matchedCustomer.company,
          totalPaid: matchedCustomer.totalPaid,
          totalOutstanding: matchedCustomer.totalOutstanding,
        },
        invoices: customerInvoices.map(i => ({
          invoiceNumber: i.invoiceNumber,
          amount: i.amount,
          status: i.status,
          dueDate: i.dueDate,
          description: i.description,
        })),
      };
    }

    case 'createInvoice': {
      const customers = await getCustomers();
      const custQuery = String(args.customerName || '').toLowerCase();
      let customer = customers.find(c => c.name.toLowerCase().includes(custQuery));

      if (!customer) {
        // If customer doesn't exist, recommend creating them
        customer = customers[0]; // fallback to first demo customer
      }

      const days = typeof args.dueDateDaysFromNow === 'number' ? args.dueDateDaysFromNow : 14;
      const dueDate = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

      // Return a pending action object that the frontend will present for user confirmation
      return {
        requiresConfirmation: true,
        actionType: 'CREATE_INVOICE',
        details: {
          customerId: customer.id,
          customerName: customer.name,
          amount: Number(args.amount),
          currency: 'USD',
          description: String(args.description),
          dueDate,
        },
      };
    }

    case 'getInvoiceDetails': {
      const inv = await getInvoiceById(String(args.invoiceIdOrNumber));
      if (!inv) return { error: `Invoice "${args.invoiceIdOrNumber}" was not found.` };
      return {
        invoiceNumber: inv.invoiceNumber,
        customer: inv.customerName,
        customerEmail: inv.customerEmail,
        amount: inv.amount,
        currency: inv.currency,
        status: inv.status,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        description: inv.description,
        hasPayPalOrder: !!inv.paypalOrderId,
      };
    }

    case 'createPayPalOrder': {
      const inv = await getInvoiceById(String(args.invoiceIdOrNumber));
      if (!inv) return { error: `Invoice "${args.invoiceIdOrNumber}" was not found.` };
      if (inv.status === 'PAID') return { message: `Invoice ${inv.invoiceNumber} is already paid!` };

      if (isPayPalConfigured()) {
        try {
          const order = await createInvoicePaymentOrder({
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            amount: inv.amount,
            currency: inv.currency,
            description: inv.description,
          });
          return {
            invoiceNumber: inv.invoiceNumber,
            amount: inv.amount,
            paypalOrderId: order.id,
            status: order.status,
            checkoutUrl: `/invoices?pay=${inv.id}`,
          };
        } catch (e) {
          console.warn('PayPal live sandbox failed, fallback to simulator', e);
        }
      }

      return {
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        paypalOrderId: `DEMO_ORDER_${Date.now()}`,
        status: 'READY_TO_PAY',
        checkoutUrl: `/invoices?pay=${inv.id}`,
        isDemo: true,
      };
    }

    case 'getPaymentStatus': {
      const inv = await getInvoiceById(String(args.invoiceIdOrNumber));
      if (!inv) return { error: `Invoice "${args.invoiceIdOrNumber}" was not found.` };
      return {
        invoiceNumber: inv.invoiceNumber,
        customer: inv.customerName,
        status: inv.status,
        amount: inv.amount,
        currency: inv.currency,
        dueDate: inv.dueDate,
        paidAt: inv.status === 'PAID' ? inv.updatedAt : null,
      };
    }

    case 'getRevenueAnalytics': {
      const summary = await getDashboardSummary();
      const transactions = await getTransactions();
      return {
        totalRevenue: summary.totalRevenue,
        monthlyTrends: summary.monthlyRevenue,
        statusBreakdown: summary.statusDistribution,
        totalCompletedPayments: transactions.length,
      };
    }

    case 'draftPaymentReminder': {
      const inv = await getInvoiceById(String(args.invoiceIdOrNumber));
      if (!inv) return { error: `Invoice "${args.invoiceIdOrNumber}" was not found.` };
      const tone = args.tone || (inv.status === 'OVERDUE' ? 'firm' : 'friendly');
      let message = '';
      if (tone === 'urgent' || tone === 'firm') {
        message = `Hi ${inv.customerName}, this is an urgent reminder that invoice ${inv.invoiceNumber} for $${inv.amount.toFixed(2)} was due on ${inv.dueDate} and is now overdue. Please settle this via PayPal at your earliest convenience. Thank you!`;
      } else {
        message = `Hi ${inv.customerName}, friendly reminder that invoice ${inv.invoiceNumber} for $${inv.amount.toFixed(2)} is due on ${inv.dueDate}. Let us know if you have any questions or need assistance completing payment. Best regards!`;
      }

      await saveReminder(inv.id, message);
      return {
        invoiceNumber: inv.invoiceNumber,
        customer: inv.customerName,
        messageDraft: message,
        status: 'DRAFT_READY',
        note: 'Draft prepared. Ready to copy to clipboard or send.',
      };
    }

    case 'getTopCustomers': {
      const customers = await getCustomers();
      const sorted = [...customers].sort((a, b) => b.totalPaid - a.totalPaid);
      return {
        topCustomers: sorted.slice(0, 5).map(c => ({
          name: c.name,
          company: c.company,
          totalPaid: c.totalPaid,
          totalOutstanding: c.totalOutstanding,
          invoicesCount: c.invoiceCount,
        })),
      };
    }

    default:
      return { error: `Tool ${name} is not implemented.` };
  }
}

/**
 * Main AI Assistant Conversation Handler
 */
export async function chatWithAssistant(messages: { role: 'user' | 'model'; text: string }[]) {
  if (!isGeminiConfigured()) {
    return {
      reply: 'PayPilot AI requires a Google Gemini API key to run autonomous workflows. Please configure `GEMINI_API_KEY` in your `.env.local` file to chat with the copilot.',
      configured: false,
    };
  }

  const ai = getAI();
  const systemInstruction = `You are PayPilot AI, an autonomous financial cashflow copilot for freelancers and small businesses.
Your role is to help users manage their receivables, analyze cash flow, track invoices, generate PayPal checkout links, and draft payment reminders.
You have access to 11 real financial tools. ALWAYS select and execute the appropriate tool when the user asks a question about their invoices, revenue, customers, reminders, or payments.
For actions that create financial records (like createInvoice), clearly explain what will be created and present the details for user approval.
Do not fabricate data or pretend you sent emails. Be concise, professional, friendly, and accurate.`;

  // Format conversation history for Gemini
  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: assistantToolDeclarations }],
      },
    });

    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (!call.name) return { reply: 'Could not resolve tool call name', configured: true };
      const toolName = call.name;
      const toolArgs = (call.args as Record<string, any>) || {};

      console.log(`AI invoking tool: ${toolName}`, toolArgs);
      const toolResult = await executeTool(toolName, toolArgs);

      // Send the tool result back to Gemini to generate the final natural response
      const followUp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          ...contents,
          {
            role: 'model',
            parts: [{ functionCall: { name: toolName, args: toolArgs } }],
          },
          {
            role: 'user',
            parts: [
              {
                functionResponse: {
                  name: toolName,
                  response: { result: toolResult },
                },
              },
            ],
          },
        ],
        config: {
          systemInstruction,
        },
      });

      return {
        reply: followUp.text || 'I have completed your request.',
        toolInvoked: toolName,
        toolResult,
        configured: true,
      };
    }

    return {
      reply: response.text || 'How can I assist you with your cashflow today?',
      configured: true,
    };
  } catch (error) {
    console.error('Gemini assistant error:', error);
    return {
      reply: `I encountered an issue connecting to Gemini: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your GEMINI_API_KEY.`,
      configured: true,
      error: true,
    };
  }
}
