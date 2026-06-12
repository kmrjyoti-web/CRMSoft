import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/receipts.service";
import type { ReceiptFilters } from "../types/receipts.types";

const KEY = "receipts";

export function useReceipts(params?: ReceiptFilters) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => svc.listReceipts(params),
  });
}

export function useReceipt(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => svc.getReceipt(id),
    enabled: !!id,
  });
}

export function useReceiptByPayment(paymentId: string) {
  return useQuery({
    queryKey: [KEY, "payment", paymentId],
    queryFn: () => svc.getByPayment(paymentId),
    enabled: !!paymentId,
  });
}

export function useGenerateReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => svc.generateReceipt(paymentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
