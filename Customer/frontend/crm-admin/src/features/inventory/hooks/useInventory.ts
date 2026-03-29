import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService } from "../services/inventory.service";
import type {
  CreateSerialPayload,
  RecordTransactionPayload,
  TransferPayload,
  CreateLocationPayload,
  CreateAdjustmentPayload,
} from "../types/inventory.types";

const KEYS = {
  dashboard: "inventory-dashboard",
  serials: "inventory-serials",
  serial: "inventory-serial",
  transactions: "inventory-transactions",
  stock: "inventory-stock",
  locations: "inventory-locations",
  adjustments: "inventory-adjustments",
  ledgerReport: "inventory-ledger-report",
  expiryReport: "inventory-expiry-report",
  valuationReport: "inventory-valuation-report",
  serialTracking: "inventory-serial-tracking",
  labels: "inventory-labels",
  expiring: "inventory-expiring",
};

// ─── Dashboard ───
export function useInventoryDashboard() {
  return useQuery({
    queryKey: [KEYS.dashboard],
    queryFn: () => inventoryService.getDashboard(),
  });
}

// ─── Serials ───
export function useSerialList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [KEYS.serials, params],
    queryFn: () => inventoryService.listSerials(params),
  });
}

export function useSerialDetail(id: string) {
  return useQuery({
    queryKey: [KEYS.serial, id],
    queryFn: () => inventoryService.getSerial(id),
    enabled: !!id,
  });
}

export function useCreateSerial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSerialPayload) => inventoryService.createSerial(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.serials] });
      qc.invalidateQueries({ queryKey: [KEYS.dashboard] });
    },
  });
}

export function useBulkCreateSerials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: CreateSerialPayload[]) => inventoryService.bulkCreateSerials(items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.serials] });
      qc.invalidateQueries({ queryKey: [KEYS.dashboard] });
    },
  });
}

export function useUpdateSerial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateSerialPayload> }) =>
      inventoryService.updateSerial(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.serials] });
      qc.invalidateQueries({ queryKey: [KEYS.serial] });
    },
  });
}

export function useChangeSerialStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, customerId, invoiceId }: { id: string; status: string; customerId?: string; invoiceId?: string }) =>
      inventoryService.changeSerialStatus(id, status, customerId, invoiceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.serials] });
      qc.invalidateQueries({ queryKey: [KEYS.serial] });
      qc.invalidateQueries({ queryKey: [KEYS.dashboard] });
    },
  });
}

export function useSearchSerials(q: string) {
  return useQuery({
    queryKey: [KEYS.serials, "search", q],
    queryFn: () => inventoryService.searchSerials(q),
    enabled: q.length >= 2,
  });
}

export function useExpiringSerials(days?: number) {
  return useQuery({
    queryKey: [KEYS.expiring, days],
    queryFn: () => inventoryService.getExpiringSerials(days),
  });
}

// ─── Transactions ───
export function useTransactionList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [KEYS.transactions, params],
    queryFn: () => inventoryService.listTransactions(params),
  });
}

export function useRecordTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordTransactionPayload) => inventoryService.recordTransaction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.transactions] });
      qc.invalidateQueries({ queryKey: [KEYS.stock] });
      qc.invalidateQueries({ queryKey: [KEYS.dashboard] });
    },
  });
}

export function useStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransferPayload) => inventoryService.transfer(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.transactions] });
      qc.invalidateQueries({ queryKey: [KEYS.stock] });
    },
  });
}

// ─── Stock ───
export function useStockSummary(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [KEYS.stock, params],
    queryFn: () => inventoryService.getStock(params),
  });
}

// ─── Locations ───
export function useLocationList() {
  return useQuery({
    queryKey: [KEYS.locations],
    queryFn: () => inventoryService.listLocations(),
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLocationPayload) => inventoryService.createLocation(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.locations] }),
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateLocationPayload> }) =>
      inventoryService.updateLocation(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.locations] }),
  });
}

// ─── Adjustments ───
export function useAdjustmentList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [KEYS.adjustments, params],
    queryFn: () => inventoryService.listTransactions(params),
  });
}

export function useCreateAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdjustmentPayload) => inventoryService.createAdjustment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.adjustments] });
      qc.invalidateQueries({ queryKey: [KEYS.dashboard] });
    },
  });
}

export function useApproveAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      inventoryService.approveAdjustment(id, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.adjustments] });
      qc.invalidateQueries({ queryKey: [KEYS.stock] });
      qc.invalidateQueries({ queryKey: [KEYS.dashboard] });
    },
  });
}

// ─── Reports ───
export function useLedgerReport(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [KEYS.ledgerReport, params],
    queryFn: () => inventoryService.stockLedgerReport(params),
  });
}

export function useExpiryReport(days?: number) {
  return useQuery({
    queryKey: [KEYS.expiryReport, days],
    queryFn: () => inventoryService.expiryReport(days),
  });
}

export function useValuationReport(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [KEYS.valuationReport, params],
    queryFn: () => inventoryService.valuationReport(params),
  });
}

export function useSerialTrackingReport(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [KEYS.serialTracking, params],
    queryFn: () => inventoryService.serialTrackingReport(params),
  });
}

// ─── Labels ───
export function useInventoryLabels() {
  return useQuery({
    queryKey: [KEYS.labels],
    queryFn: () => inventoryService.getLabels(),
  });
}

export function useUpsertLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => inventoryService.upsertLabel(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.labels] }),
  });
}
