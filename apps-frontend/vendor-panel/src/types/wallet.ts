export type TransactionType = 'CREDIT' | 'DEBIT';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

export interface WalletBalance {
  balance: number;
  currency: string;
  pendingCredits: number;
  pendingDebits: number;
  lastUpdated: string;
}

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  balanceAfter: number;
  createdAt: string;
}

export interface WalletFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  page?: number;
  limit?: number;
}
