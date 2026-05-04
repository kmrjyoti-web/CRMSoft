import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { accountsService } from "../services/accounts.service";

import type {
  CreatePaymentPayload,
  CreateBankAccountPayload,
  CreateLedgerPayload,
  CreateJournalEntryPayload,
} from "../types/accounts.types";

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export function useAccountDashboard() {
  return useQuery({
    queryKey: ["accounts-dashboard"],
    queryFn: () => accountsService.getDashboard(),
  });
}

export function useTransactionDashboard() {
  return useQuery({
    queryKey: ["transaction-dashboard"],
    queryFn: () => accountsService.getTransactionDashboard(),
  });
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export function usePaymentList(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => accountsService.listPayments(params),
  });
}

export function usePaymentDetail(id: string) {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => accountsService.getPayment(id),
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentPayload) =>
      accountsService.createPayment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useApprovePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
      accountsService.approvePayment(id, remarks),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["payment"] });
    },
  });
}

export function useCancelPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsService.cancelPayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["payment"] });
    },
  });
}

export function usePendingPayments() {
  return useQuery({
    queryKey: ["payments-pending"],
    queryFn: () => accountsService.getPendingPayments(),
  });
}

export function useOverduePayments() {
  return useQuery({
    queryKey: ["payments-overdue"],
    queryFn: () => accountsService.getOverduePayments(),
  });
}

// ---------------------------------------------------------------------------
// Bank Accounts
// ---------------------------------------------------------------------------

export function useBankList() {
  return useQuery({
    queryKey: ["banks"],
    queryFn: () => accountsService.listBanks(),
  });
}

export function useCreateBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBankAccountPayload) =>
      accountsService.createBank(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banks"] });
    },
  });
}

export function useBankReconciliation(bankId: string) {
  return useQuery({
    queryKey: ["bank-recon", bankId],
    queryFn: () => accountsService.getReconciliation(bankId),
    enabled: !!bankId,
  });
}

export function useSubmitReconciliation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { bankAccountId: string; statementBalance: number; reconciliationDate: string }) =>
      accountsService.submitReconciliation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bank-recon"] });
      qc.invalidateQueries({ queryKey: ["banks"] });
    },
  });
}

// ---------------------------------------------------------------------------
// GST Returns
// ---------------------------------------------------------------------------

export function useGSTList(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["gst-returns", params],
    queryFn: () => accountsService.listGST(params),
  });
}

export function useGSTDetail(id: string) {
  return useQuery({
    queryKey: ["gst-return", id],
    queryFn: () => accountsService.getGSTReturn(id),
    enabled: !!id,
  });
}

export function useGenerateGSTR1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (period: string) => accountsService.generateGSTR1(period),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gst-returns"] });
    },
  });
}

export function useGenerateGSTR3B() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (period: string) => accountsService.generateGSTR3B(period),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gst-returns"] });
    },
  });
}

export function useFileGST() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, acknowledgementNo }: { id: string; acknowledgementNo?: string }) =>
      accountsService.fileGST(id, acknowledgementNo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gst-returns"] });
      qc.invalidateQueries({ queryKey: ["gst-return"] });
    },
  });
}

export function useITC(period: string) {
  return useQuery({
    queryKey: ["itc", period],
    queryFn: () => accountsService.getITC(period),
    enabled: !!period,
  });
}

// ---------------------------------------------------------------------------
// TDS
// ---------------------------------------------------------------------------

export function useTDSList(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["tds-records", params],
    queryFn: () => accountsService.listTDS(params),
  });
}

export function useTDSSummary(financialYear?: string) {
  return useQuery({
    queryKey: ["tds-summary", financialYear],
    queryFn: () => accountsService.getTDSSummary(financialYear),
  });
}

export function useDepositTDS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, depositDate, challanNumber }: { id: string; depositDate: string; challanNumber?: string }) =>
      accountsService.depositTDS(id, { depositDate, challanNumber }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tds-records"] });
      qc.invalidateQueries({ queryKey: ["tds-summary"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Chart of Accounts / Ledger
// ---------------------------------------------------------------------------

export function useChartOfAccounts() {
  return useQuery({
    queryKey: ["chart-of-accounts"],
    queryFn: () => accountsService.getChartOfAccounts(),
  });
}

export function useCreateLedger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLedgerPayload) =>
      accountsService.createLedger(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chart-of-accounts"] });
    },
  });
}

export function useContraEntries(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["contra-entries", params],
    queryFn: () => accountsService.listContraEntries(params),
  });
}

export function useCreateContraEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => accountsService.createContraEntry(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contra-entries"] });
      qc.invalidateQueries({ queryKey: ["chart-of-accounts"] });
    },
  });
}

export function useJournalEntries(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["journal-entries", params],
    queryFn: () => accountsService.listJournalEntries(params),
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJournalEntryPayload) =>
      accountsService.createJournalEntry(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal-entries"] });
      qc.invalidateQueries({ queryKey: ["chart-of-accounts"] });
      qc.invalidateQueries({ queryKey: ["accounts-dashboard"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Financial Reports
// ---------------------------------------------------------------------------

export function useProfitLoss(from: string, to: string) {
  return useQuery({
    queryKey: ["profit-loss", from, to],
    queryFn: () => accountsService.getProfitLoss(from, to),
    enabled: !!from && !!to,
  });
}

export function useBalanceSheet(asOfDate: string) {
  return useQuery({
    queryKey: ["balance-sheet", asOfDate],
    queryFn: () => accountsService.getBalanceSheet(asOfDate),
    enabled: !!asOfDate,
  });
}

export function useTrialBalance(from: string, to: string) {
  return useQuery({
    queryKey: ["trial-balance", from, to],
    queryFn: () => accountsService.getTrialBalance(from, to),
    enabled: !!from && !!to,
  });
}

export function useCashFlow(from: string, to: string) {
  return useQuery({
    queryKey: ["cash-flow", from, to],
    queryFn: () => accountsService.getCashFlow(from, to),
    enabled: !!from && !!to,
  });
}

export function useReceivableAging() {
  return useQuery({
    queryKey: ["receivable-aging"],
    queryFn: () => accountsService.getReceivableAging(),
  });
}

export function usePayableAging() {
  return useQuery({
    queryKey: ["payable-aging"],
    queryFn: () => accountsService.getPayableAging(),
  });
}

export function useDayBook(date: string) {
  return useQuery({
    queryKey: ["day-book", date],
    queryFn: () => accountsService.getDayBook(date),
    enabled: !!date,
  });
}

export function useLedgerStatement(ledgerId: string, from: string, to: string) {
  return useQuery({
    queryKey: ["ledger-statement", ledgerId, from, to],
    queryFn: () => accountsService.getLedgerStatement(ledgerId, from, to),
    enabled: !!ledgerId && !!from && !!to,
  });
}

// ---------------------------------------------------------------------------
// Ledger Master (rich)
// ---------------------------------------------------------------------------

export function useLedgerList(params?: { search?: string; groupType?: string; station?: string }) {
  return useQuery({
    queryKey: ["ledgers-rich", params],
    queryFn: () => accountsService.listLedgers(params),
  });
}

export function useLedgerDetail(id: string) {
  return useQuery({
    queryKey: ["ledger-rich", id],
    queryFn: () => accountsService.getLedgerById(id),
    enabled: !!id,
  });
}

export function useCreateRichLedger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => accountsService.createRichLedger(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ledgers-rich"] });
      qc.invalidateQueries({ queryKey: ["chart-of-accounts"] });
    },
  });
}

export function useUpdateLedger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => accountsService.updateLedger(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ledgers-rich"] });
      qc.invalidateQueries({ queryKey: ["ledger-rich"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Account Groups
// ---------------------------------------------------------------------------

export function useGroupTree() {
  return useQuery({
    queryKey: ["account-groups-tree"],
    queryFn: () => accountsService.getGroupTree(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useGroupFlat() {
  return useQuery({
    queryKey: ["account-groups-flat"],
    queryFn: () => accountsService.getGroupFlat(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => accountsService.createGroup(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["account-groups-tree"] });
      qc.invalidateQueries({ queryKey: ["account-groups-flat"] });
    },
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsService.deleteGroup(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["account-groups-tree"] });
      qc.invalidateQueries({ queryKey: ["account-groups-flat"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Sale Master
// ---------------------------------------------------------------------------

export function useSaleMasterList() {
  return useQuery({
    queryKey: ["sale-masters"],
    queryFn: () => accountsService.listSaleMasters(),
  });
}

export function useCreateSaleMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => accountsService.createSaleMaster(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sale-masters"] }),
  });
}

export function useUpdateSaleMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => accountsService.updateSaleMaster(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sale-masters"] }),
  });
}

export function useDeleteSaleMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsService.deleteSaleMaster(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sale-masters"] }),
  });
}

// ---------------------------------------------------------------------------
// Purchase Master
// ---------------------------------------------------------------------------

export function usePurchaseMasterList() {
  return useQuery({
    queryKey: ["purchase-masters"],
    queryFn: () => accountsService.listPurchaseMasters(),
  });
}

export function useCreatePurchaseMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => accountsService.createPurchaseMaster(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-masters"] }),
  });
}

export function useUpdatePurchaseMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => accountsService.updatePurchaseMaster(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-masters"] }),
  });
}

export function useDeletePurchaseMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsService.deletePurchaseMaster(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-masters"] }),
  });
}

// ---------------------------------------------------------------------------
// Ledger Mappings
// ---------------------------------------------------------------------------

export function useLedgerMappingList() {
  return useQuery({
    queryKey: ["ledger-mappings"],
    queryFn: () => accountsService.listLedgerMappings(),
  });
}

export function useCreateLedgerMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => accountsService.createLedgerMapping(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ledger-mappings"] }),
  });
}
