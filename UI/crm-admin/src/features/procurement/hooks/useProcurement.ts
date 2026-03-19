import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { procurementService } from "../services/procurement.service";

const KEYS = {
  dashboard: "procurement-dashboard",
  units: "procurement-units",
  conversions: "procurement-conversions",
  rfq: "procurement-rfq",
  rfqDetail: "procurement-rfq-detail",
  quotations: "procurement-quotations",
  quotationDetail: "procurement-quotation-detail",
  comparisons: "procurement-comparisons",
  pos: "procurement-pos",
  poDetail: "procurement-po-detail",
  grns: "procurement-grns",
  grnDetail: "procurement-grn-detail",
  invoices: "procurement-invoices",
  invoiceDetail: "procurement-invoice-detail",
};

// ─── Dashboard ───
export function useProcurementDashboard() {
  return useQuery({
    queryKey: [KEYS.dashboard],
    queryFn: () => procurementService.getDashboard(),
  });
}

// ─── Units ───
export function useUnits(category?: string) {
  return useQuery({
    queryKey: [KEYS.units, category],
    queryFn: () => procurementService.listUnits(category),
  });
}

export function useCreateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => procurementService.createUnit(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.units] }),
  });
}

export function useDeleteUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => procurementService.deleteUnit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.units] }),
  });
}

// ─── Conversions ───
export function useConversions(productId?: string) {
  return useQuery({
    queryKey: [KEYS.conversions, productId],
    queryFn: () => procurementService.listConversions(productId),
  });
}

export function useCreateConversion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => procurementService.createConversion(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.conversions] }),
  });
}

// ─── RFQ ───
export function useRFQList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [KEYS.rfq, params],
    queryFn: () => procurementService.listRFQ(params),
  });
}

export function useRFQDetail(id: string) {
  return useQuery({
    queryKey: [KEYS.rfqDetail, id],
    queryFn: () => procurementService.getRFQ(id),
    enabled: !!id,
  });
}

export function useCreateRFQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => procurementService.createRFQ(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.rfq] }),
  });
}

export function useUpdateRFQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      procurementService.updateRFQ(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.rfq] });
      qc.invalidateQueries({ queryKey: [KEYS.rfqDetail] });
    },
  });
}

export function useSendRFQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, vendorIds }: { id: string; vendorIds: string[] }) =>
      procurementService.sendRFQ(id, vendorIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.rfq] });
      qc.invalidateQueries({ queryKey: [KEYS.rfqDetail] });
    },
  });
}

export function useUpdateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      procurementService.updateQuotation(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.quotations] });
      qc.invalidateQueries({ queryKey: [KEYS.quotationDetail] });
    },
  });
}

// ─── Quotations ───
export function useQuotationList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [KEYS.quotations, params],
    queryFn: () => procurementService.listQuotations(params),
  });
}

export function useQuotationDetail(id: string) {
  return useQuery({
    queryKey: [KEYS.quotationDetail, id],
    queryFn: () => procurementService.getQuotation(id),
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => procurementService.createQuotation(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.quotations] }),
  });
}

// ─── Compare ───
export function useCompareQuotations() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => procurementService.compareQuotations(data),
  });
}

export function useSelectWinner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { comparisonId: string; quotationId: string; remarks?: string }) =>
      procurementService.selectWinner(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.quotations] });
      qc.invalidateQueries({ queryKey: [KEYS.comparisons] });
    },
  });
}

// ─── Purchase Orders ───
export function usePOList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [KEYS.pos, params],
    queryFn: () => procurementService.listPOs(params),
  });
}

export function usePODetail(id: string) {
  return useQuery({
    queryKey: [KEYS.poDetail, id],
    queryFn: () => procurementService.getPO(id),
    enabled: !!id,
  });
}

export function useCreatePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => procurementService.createPO(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.pos] }),
  });
}

export function useUpdatePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      procurementService.updatePO(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.pos] });
      qc.invalidateQueries({ queryKey: [KEYS.poDetail] });
    },
  });
}

export function usePOWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, remarks }: { id: string; action: string; remarks?: string }) =>
      procurementService.poWorkflow(id, { action, remarks }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.pos] });
      qc.invalidateQueries({ queryKey: [KEYS.poDetail] });
      qc.invalidateQueries({ queryKey: [KEYS.dashboard] });
    },
  });
}

// ─── Goods Receipts ───
export function useGRNList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [KEYS.grns, params],
    queryFn: () => procurementService.listGRN(params),
  });
}

export function useGRNDetail(id: string) {
  return useQuery({
    queryKey: [KEYS.grnDetail, id],
    queryFn: () => procurementService.getGRN(id),
    enabled: !!id,
  });
}

export function useCreateGRN() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => procurementService.createGRN(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.grns] }),
  });
}

export function useUpdateGRN() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      procurementService.updateGRN(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.grns] });
      qc.invalidateQueries({ queryKey: [KEYS.grnDetail] });
    },
  });
}

export function useGRNWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, remarks }: { id: string; action: string; remarks?: string }) =>
      procurementService.grnWorkflow(id, { action, remarks }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.grns] });
      qc.invalidateQueries({ queryKey: [KEYS.grnDetail] });
      qc.invalidateQueries({ queryKey: [KEYS.dashboard] });
    },
  });
}

// ─── Purchase Invoices ───
export function useInvoiceList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [KEYS.invoices, params],
    queryFn: () => procurementService.listInvoices(params),
  });
}

export function useInvoiceDetail(id: string) {
  return useQuery({
    queryKey: [KEYS.invoiceDetail, id],
    queryFn: () => procurementService.getInvoice(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => procurementService.createInvoice(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.invoices] }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      procurementService.updateInvoice(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.invoices] });
      qc.invalidateQueries({ queryKey: [KEYS.invoiceDetail] });
    },
  });
}

export function useInvoiceWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, remarks }: { id: string; action: string; remarks?: string }) =>
      procurementService.invoiceWorkflow(id, { action, remarks }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.invoices] });
      qc.invalidateQueries({ queryKey: [KEYS.invoiceDetail] });
      qc.invalidateQueries({ queryKey: [KEYS.dashboard] });
    },
  });
}
