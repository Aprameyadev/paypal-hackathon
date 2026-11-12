export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type ReminderStatus = 'DRAFT' | 'PREPARED' | 'SENT';
export type ActionApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
export type ActionExecutionStatus = 'IDLE' | 'EXECUTING' | 'COMPLETED' | 'FAILED';

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  userId: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paypalOrderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  invoiceId: string;
  invoiceNumber?: string;
  customerName?: string;
  paypalOrderId?: string | null;
  paypalCaptureId?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentSource: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  invoiceId: string;
  customerName?: string;
  message: string;
  status: ReminderStatus;
  createdAt: string;
}

export interface AgentAction {
  id: string;
  userId: string;
  actionName: string;
  arguments: Record<string, unknown>;
  approvalStatus: ActionApprovalStatus;
  executionStatus: ActionExecutionStatus;
  result?: unknown;
  createdAt: string;
}

export interface DashboardSummary {
  totalRevenue: number;
  outstandingPayments: number;
  overduePayments: number;
  totalCustomers: number;
  paidInvoicesCount: number;
  pendingInvoicesCount: number;
  overdueInvoicesCount: number;
  currency: string;
  recentInvoices: Invoice[];
  recentTransactions: Transaction[];
  monthlyRevenue: { month: string; revenue: number; invoiceCount: number }[];
  statusDistribution: { status: string; count: number; value: number }[];
}

export interface CustomerWithMetrics extends Customer {
  totalPaid: number;
  totalOutstanding: number;
  invoiceCount: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  isDemo?: boolean;
}

