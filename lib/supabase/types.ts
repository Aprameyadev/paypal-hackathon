export type ContractStatus = 'DRAFT' | 'AUTHORIZED_HOLD' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
export type MilestoneStatus = 'PENDING' | 'PROOF_SUBMITTED' | 'VERIFIED' | 'RELEASED' | 'REFUNDED';

export interface Contract {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  title: string;
  total_amount: number;
  currency: string;
  status: ContractStatus;
  paypal_order_id: string | null;
  paypal_authorization_id: string | null;
  created_at: string;
}

export interface Milestone {
  id: string;
  contract_id: string;
  description: string;
  verification_criteria: string;
  amount: number;
  status: MilestoneStatus;
  proof_submitted: string | null;
  ai_verification_notes: string | null;
  ai_confidence_score: number | null;
  paypal_capture_id: string | null;
  created_at: string;
}
