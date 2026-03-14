import { api } from '@/services/api-client';
import type {
  CreatePaymentPayload,
  CreateBankAccountPayload,
  CreateLedgerPayload,
  CreateJournalEntryPayload,
} from '../types/accounts.types';

const BASE = '/api/v1/accounts';

export const accountsService = {
  // Dashboard
  getDashboard: () =>
    api.get<any>(`${BASE}/dashboard`).then((r) => r.data),

  // Transaction Dashboard
  getTransactionDashboard: () =>
    api.get<any>(`${BASE}/transactions/dashboard`).then((r) => r.data),

  // Payments
  listPayments: (params?: Record<string, string>) =>
    api.get<any>(`${BASE}/payments`, { params }).then((r) => r.data),
  getPayment: (id: string) =>
    api.get<any>(`${BASE}/payments/${id}`).then((r) => r.data),
  createPayment: (data: CreatePaymentPayload) =>
    api.post<any>(`${BASE}/payments`, data).then((r) => r.data),
  approvePayment: (id: string, remarks?: string) =>
    api.patch<any>(`${BASE}/payments/${id}/approve`, { remarks }).then((r) => r.data),
  cancelPayment: (id: string) =>
    api.patch<any>(`${BASE}/payments/${id}/cancel`, {}).then((r) => r.data),
  getPendingPayments: () =>
    api.get<any>(`${BASE}/payments/pending`).then((r) => r.data),
  getOverduePayments: () =>
    api.get<any>(`${BASE}/payments/overdue`).then((r) => r.data),

  // Banks
  listBanks: () =>
    api.get<any>(`${BASE}/banks`).then((r) => r.data),
  createBank: (data: CreateBankAccountPayload) =>
    api.post<any>(`${BASE}/banks`, data).then((r) => r.data),
  getReconciliation: (bankId: string) =>
    api.get<any>(`${BASE}/banks/${bankId}/reconciliation`).then((r) => r.data),
  submitReconciliation: (data: {
    bankAccountId: string;
    reconciliationDate: string;
    statementBalance: number;
  }) =>
    api.post<any>(`${BASE}/banks/reconciliation`, data).then((r) => r.data),

  // GST
  listGST: (params?: Record<string, string>) =>
    api.get<any>(`${BASE}/gst`, { params }).then((r) => r.data),
  getGSTReturn: (id: string) =>
    api.get<any>(`${BASE}/gst/${id}`).then((r) => r.data),
  generateGSTR1: (period: string) =>
    api.post<any>(`${BASE}/gst/generate-gstr1`, { period }).then((r) => r.data),
  generateGSTR3B: (period: string) =>
    api.post<any>(`${BASE}/gst/generate-gstr3b`, { period }).then((r) => r.data),
  fileGST: (id: string, acknowledgementNo?: string) =>
    api.patch<any>(`${BASE}/gst/${id}/file`, { acknowledgementNo }).then((r) => r.data),
  getITC: (period: string) =>
    api.get<any>(`${BASE}/gst/itc`, { params: { period } }).then((r) => r.data),

  // TDS
  listTDS: (params?: Record<string, string>) =>
    api.get<any>(`${BASE}/tds`, { params }).then((r) => r.data),
  getTDSSummary: (financialYear?: string) =>
    api.get<any>(`${BASE}/tds/summary`, { params: { financialYear } }).then((r) => r.data),
  depositTDS: (id: string, data: { depositDate: string; challanNumber?: string }) =>
    api.patch<any>(`${BASE}/tds/${id}/deposit`, data).then((r) => r.data),

  // Ledgers
  getChartOfAccounts: () =>
    api.get<any>(`${BASE}/ledgers`).then((r) => r.data),
  createLedger: (data: CreateLedgerPayload) =>
    api.post<any>(`${BASE}/ledgers`, data).then((r) => r.data),
  listJournalEntries: (params?: Record<string, string>) =>
    api.get<any>(`${BASE}/journal-entries`, { params }).then((r) => r.data),
  createJournalEntry: (data: CreateJournalEntryPayload) =>
    api.post<any>(`${BASE}/journal-entries`, data).then((r) => r.data),
  listContraEntries: (params?: Record<string, string>) =>
    api.get<any>(`${BASE}/contra-entries`, { params }).then((r) => r.data),
  createContraEntry: (data: any) =>
    api.post<any>(`${BASE}/contra-entries`, data).then((r) => r.data),

  // Reports
  getProfitLoss: (from: string, to: string) =>
    api.get<any>(`${BASE}/reports/profit-loss`, { params: { from, to } }).then((r) => r.data),
  getBalanceSheet: (asOfDate: string) =>
    api.get<any>(`${BASE}/reports/balance-sheet`, { params: { asOfDate } }).then((r) => r.data),
  getTrialBalance: (from: string, to: string) =>
    api.get<any>(`${BASE}/reports/trial-balance`, { params: { from, to } }).then((r) => r.data),
  getCashFlow: (from: string, to: string) =>
    api.get<any>(`${BASE}/reports/cash-flow`, { params: { from, to } }).then((r) => r.data),
  getReceivableAging: () =>
    api.get<any>(`${BASE}/reports/receivable-aging`).then((r) => r.data),
  getPayableAging: () =>
    api.get<any>(`${BASE}/reports/payable-aging`).then((r) => r.data),
  getDayBook: (date: string) =>
    api.get<any>(`${BASE}/reports/day-book`, { params: { date } }).then((r) => r.data),
  getLedgerStatement: (ledgerId: string, from: string, to: string) =>
    api.get<any>(`${BASE}/reports/ledger-statement/${ledgerId}`, { params: { from, to } }).then((r) => r.data),

  // ─── Ledger Master (rich) ───
  listLedgers: (params?: { search?: string; groupType?: string; station?: string; page?: number; limit?: number }) =>
    api.get<any>(`${BASE}/ledgers`, { params }).then((r) => r.data),
  getLedgerById: (id: string) =>
    api.get<any>(`${BASE}/ledgers/${id}`).then((r) => r.data),
  createRichLedger: (data: any) =>
    api.post<any>(`${BASE}/ledgers`, data).then((r) => r.data),
  updateLedger: (id: string, data: any) =>
    api.patch<any>(`${BASE}/ledgers/${id}`, data).then((r) => r.data),
  deactivateLedger: (id: string) =>
    api.post<any>(`${BASE}/ledgers/${id}/deactivate`, {}).then((r) => r.data),
  getLedgerStatementRich: (id: string, from: string, to: string) =>
    api.get<any>(`${BASE}/ledgers/${id}/statement`, { params: { from, to } }).then((r) => r.data),
  getLedgerEntities: (id: string) =>
    api.get<any>(`${BASE}/ledgers/${id}/entities`).then((r) => r.data),

  // ─── Account Groups ───
  getGroupTree: () =>
    api.get<any>(`${BASE}/groups`).then((r) => r.data),
  getGroupFlat: () =>
    api.get<any>(`${BASE}/groups/flat`).then((r) => r.data),
  createGroup: (data: any) =>
    api.post<any>(`${BASE}/groups`, data).then((r) => r.data),
  updateGroup: (id: string, data: any) =>
    api.patch<any>(`${BASE}/groups/${id}`, data).then((r) => r.data),
  deleteGroup: (id: string) =>
    api.delete<any>(`${BASE}/groups/${id}`).then((r) => r.data),

  // ─── Sale Master ───
  listSaleMasters: () =>
    api.get<any>(`${BASE}/sale-master`).then((r) => r.data),
  createSaleMaster: (data: any) =>
    api.post<any>(`${BASE}/sale-master`, data).then((r) => r.data),
  updateSaleMaster: (id: string, data: any) =>
    api.patch<any>(`${BASE}/sale-master/${id}`, data).then((r) => r.data),
  deleteSaleMaster: (id: string) =>
    api.delete<any>(`${BASE}/sale-master/${id}`).then((r) => r.data),

  // ─── Purchase Master ───
  listPurchaseMasters: () =>
    api.get<any>(`${BASE}/purchase-master`).then((r) => r.data),
  createPurchaseMaster: (data: any) =>
    api.post<any>(`${BASE}/purchase-master`, data).then((r) => r.data),
  updatePurchaseMaster: (id: string, data: any) =>
    api.patch<any>(`${BASE}/purchase-master/${id}`, data).then((r) => r.data),
  deletePurchaseMaster: (id: string) =>
    api.delete<any>(`${BASE}/purchase-master/${id}`).then((r) => r.data),

  // ─── Tally Import ───
  tallyImportLedgers: (ledgers: any[]) =>
    api.post<any>(`${BASE}/ledgers/tally-import`, { ledgers }).then((r) => r.data),

  // ─── Ledger Mappings ───
  listLedgerMappings: () =>
    api.get<any>(`${BASE}/ledger-mappings`).then((r) => r.data),
  createLedgerMapping: (data: any) =>
    api.post<any>(`${BASE}/ledger-mappings`, data).then((r) => r.data),
  getUnmappedEntities: () =>
    api.get<any>(`${BASE}/ledgers/mappings/unmapped`).then((r) => r.data),
  bulkCreateMappings: (mappings: any[]) =>
    api.post<any>(`${BASE}/ledger-mappings/bulk`, { mappings }).then((r) => r.data),
};
