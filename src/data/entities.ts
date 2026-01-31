export type ID = string;

export type WalletType = "cash" | "bank";
export type TransactionType = "income" | "expense" | "transfer";
export type BillFrequency = "monthly" | "quarterly" | "yearly";

export interface User {
  id: ID;
  created_at: string;
  currency: string;
  locale: string;
}

export interface Wallet {
  id: ID;
  name: string;
  type: WalletType;
  balance: number;
  created_at: string;
}

export interface Category {
  id: ID;
  name: string;
  icon: string | null;
  color: string | null;
  is_custom: boolean;
  created_at: string;
}

export interface Budget {
  id: ID;
  category_id: ID;
  monthly_limit: number;
  created_at: string;
}

export interface Transaction {
  id: ID;
  amount: number;
  type: TransactionType;
  category_id: ID | null;
  wallet_id: ID | null;
  target_wallet_id: ID | null;
  note: string | null;
  occurred_at: string;
  created_at: string;
}

export interface Bill {
  id: ID;
  name: string;
  amount: number;
  frequency: BillFrequency;
  category_id: ID | null;
  wallet_id: ID | null;
  next_due_date: string;
  active: boolean;
}

export interface MonthlySummary {
  id: ID;
  month: string;
  total_income: number;
  total_expenses: number;
  savings: number;
  created_at: string;
}

export interface AITokenLedger {
  id: ID;
  month: string;
  tokens_used: number;
  token_limit: number;
  last_reset: string;
}
