export interface PaymentRecord {
  id: string;
  paymentNumber: string;
  paymentType: 'PAYMENT_OUT' | 'RECEIPT_IN';
  entityType: string;
  entityId: string;
  entityName?: string;
  referenceType?: string;
  referenceId?: string;
  amount: number;
  paymentMode: string;
  bankAccountId?: string;
  chequeNumber?: string;
  chequeDate?: string;
  transactionRef?: string;
  upiId?: string;
  tdsApplicable: boolean;
  tdsRate?: number;
  tdsAmount?: number;
  tdsSection?: string;
  netAmount: number;
  status: string;
  paymentDate: string;
  narration?: string;
  approvedById?: string;
  approvedAt?: string;
  accountTransactionId?: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  ifscCode: string;
  branchName?: string;
  ledgerId?: string;
  openingBalance: number;
  currentBalance: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface BankReconciliation {
  id: string;
  bankAccountId: string;
  reconciliationDate: string;
  statementBalance: number;
  bookBalance: number;
  difference: number;
  status: string;
  completedAt?: string;
}

export interface GSTReturn {
  id: string;
  returnType: string;
  period: string;
  financialYear: string;
  b2bData?: any;
  b2cLargeData?: any;
  b2cSmallData?: any;
  hsnSummary?: any;
  outputCGST: number;
  outputSGST: number;
  outputIGST: number;
  outputCess: number;
  inputTaxCredit?: any;
  netTaxPayable: number;
  status: string;
  filedAt?: string;
  acknowledgementNo?: string;
  createdAt: string;
}

export interface TDSRecord {
  id: string;
  section: string;
  sectionName?: string;
  deducteeName: string;
  deducteePAN?: string;
  grossAmount: number;
  tdsRate: number;
  tdsAmount: number;
  netAmount: number;
  deductionDate: string;
  depositDate?: string;
  challanNumber?: string;
  status: string;
  quarter?: string;
  financialYear: string;
}

export interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  groupType: string;
  subGroup?: string;
  balance: number;
  isSystem: boolean;
}

export interface AccountDashboard {
  totalReceivable: number;
  totalPayable: number;
  cashAndBank: number;
  cashBalance: number;
  bankBalance: number;
  gstDue: number;
  pendingApprovals: number;
  recentPayments: PaymentRecord[];
  monthlyData: Array<{ month: string; revenue: number; expenses: number }>;
  receivableCount: number;
  payableCount: number;
}

export interface ProfitLoss {
  period: { from: string; to: string };
  income: Array<{ name: string; amount: number }>;
  expenses: Array<{ name: string; amount: number }>;
  totalIncome: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
}

export interface BalanceSheet {
  asOfDate: string;
  assets: Array<{ name: string; group: string; balance: number }>;
  liabilities: Array<{ name: string; group: string; balance: number }>;
  equity: Array<{ name: string; group: string; balance: number }>;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
}

export interface TrialBalance {
  period: { from: string; to: string };
  ledgers: Array<{
    ledgerId: string;
    name: string;
    code: string;
    groupType: string;
    debit: number;
    credit: number;
  }>;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export interface CashFlow {
  period: { from: string; to: string };
  operating: number;
  investing: number;
  financing: number;
  netCashFlow: number;
}

export interface AgingReport {
  current: any[];
  aging30: any[];
  aging60: any[];
  aging90: any[];
  total: { current: number; aging30: number; aging60: number; aging90: number };
}

export interface LedgerStatement {
  ledgerName: string;
  ledgerCode: string;
  openingBalance: number;
  closingBalance: number;
  entries: Array<{
    date: string;
    voucherType: string;
    voucherNumber: string;
    narration?: string;
    debit: number;
    credit: number;
    balance: number;
  }>;
}

// ---------------------------------------------------------------------------
// Transaction Dashboard
// ---------------------------------------------------------------------------

export interface TransactionDashboard {
  todayJournalEntries: number;
  todayJournalAmount: number;
  paymentsInCount: number;
  paymentsInAmount: number;
  paymentsOutCount: number;
  paymentsOutAmount: number;
  contraEntriesToday: number;
  contraAmount: number;
  tdsDeductedMonth: number;
  tdsDepositedMonth: number;
  pendingApprovals: number;
  paymentModeBreakdown: Array<{ mode: string; count: number; amount: number }>;
  recentTransactions: Array<{
    id: string;
    type: "JOURNAL" | "PAYMENT_IN" | "PAYMENT_OUT" | "CONTRA" | "TDS";
    number: string;
    date: string;
    amount: number;
    narration?: string;
    status: string;
  }>;
  dailyVolume: Array<{ date: string; journal: number; paymentIn: number; paymentOut: number; contra: number }>;
}

// Payloads

export interface CreatePaymentPayload {
  paymentType: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  referenceType?: string;
  referenceId?: string;
  amount: number;
  paymentMode: string;
  bankAccountId?: string;
  chequeNumber?: string;
  chequeDate?: string;
  transactionRef?: string;
  upiId?: string;
  tdsApplicable?: boolean;
  tdsRate?: number;
  tdsSection?: string;
  paymentDate: string;
  narration?: string;
}

export interface CreateBankAccountPayload {
  bankName: string;
  accountNumber: string;
  accountType: string;
  ifscCode: string;
  branchName?: string;
  ledgerId?: string;
  openingBalance?: number;
  isDefault?: boolean;
}

export interface CreateLedgerPayload {
  code: string;
  name: string;
  groupType: string;
  subGroup?: string;
  parentId?: string;
  openingBalance?: number;
}

export interface CreateJournalEntryPayload {
  transactionDate: string;
  debitLedgerId: string;
  creditLedgerId: string;
  amount: number;
  narration?: string;
  referenceType?: string;
  referenceId?: string;
}
