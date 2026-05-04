import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  warrantyTemplateService,
  warrantyRecordService,
  warrantyClaimService,
  amcPlanService,
  amcContractService,
  amcScheduleService,
  serviceVisitService,
} from "../services/amc-warranty.service";

const KEYS = {
  warrantyTemplates: ["warranty-templates"],
  warrantyRecords: ["warranty-records"],
  warrantyClaims: ["warranty-claims"],
  amcPlans: ["amc-plans"],
  amcContracts: ["amc-contracts"],
  amcSchedules: ["amc-schedules"],
  serviceVisits: ["service-visits"],
};

// ── Warranty Templates ──────────────────────────────────────────────────────

export function useWarrantyTemplates(params?: any) {
  return useQuery({
    queryKey: [...KEYS.warrantyTemplates, params],
    queryFn: () => warrantyTemplateService.getAll(params),
  });
}

export function useWarrantyTemplate(id: string) {
  return useQuery({
    queryKey: [...KEYS.warrantyTemplates, id],
    queryFn: () => warrantyTemplateService.getById(id),
    enabled: !!id,
  });
}

export function useWarrantyTemplatesByIndustry(code: string) {
  return useQuery({
    queryKey: [...KEYS.warrantyTemplates, "industry", code],
    queryFn: () => warrantyTemplateService.getByIndustry(code),
    enabled: !!code,
  });
}

export function useCreateWarrantyTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => warrantyTemplateService.create(dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.warrantyTemplates }),
  });
}

export function useUpdateWarrantyTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      warrantyTemplateService.update(id, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.warrantyTemplates }),
  });
}

export function useImportWarrantyTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => warrantyTemplateService.importTemplate(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.warrantyTemplates }),
  });
}

// ── Warranty Records ────────────────────────────────────────────────────────

export function useWarrantyRecords(params?: any) {
  return useQuery({
    queryKey: [...KEYS.warrantyRecords, params],
    queryFn: () => warrantyRecordService.getAll(params),
  });
}

export function useWarrantyRecord(id: string) {
  return useQuery({
    queryKey: [...KEYS.warrantyRecords, id],
    queryFn: () => warrantyRecordService.getById(id),
    enabled: !!id,
  });
}

export function useExpiringWarranties(days?: number) {
  return useQuery({
    queryKey: [...KEYS.warrantyRecords, "expiring", days],
    queryFn: () => warrantyRecordService.getExpiring(days),
  });
}

export function useCreateWarrantyRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => warrantyRecordService.create(dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.warrantyRecords }),
  });
}

export function useUpdateWarrantyRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      warrantyRecordService.update(id, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.warrantyRecords }),
  });
}

export function useExtendWarranty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      warrantyRecordService.extend(id, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.warrantyRecords }),
  });
}

// ── Warranty Claims ─────────────────────────────────────────────────────────

export function useWarrantyClaims(params?: any) {
  return useQuery({
    queryKey: [...KEYS.warrantyClaims, params],
    queryFn: () => warrantyClaimService.getAll(params),
  });
}

export function useWarrantyClaim(id: string) {
  return useQuery({
    queryKey: [...KEYS.warrantyClaims, id],
    queryFn: () => warrantyClaimService.getById(id),
    enabled: !!id,
  });
}

export function useCreateWarrantyClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => warrantyClaimService.create(dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.warrantyClaims }),
  });
}

export function useUpdateWarrantyClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      warrantyClaimService.update(id, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.warrantyClaims }),
  });
}

export function useRejectWarrantyClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      warrantyClaimService.reject(id, reason),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.warrantyClaims }),
  });
}

// ── AMC Plans ───────────────────────────────────────────────────────────────

export function useAMCPlans(params?: any) {
  return useQuery({
    queryKey: [...KEYS.amcPlans, params],
    queryFn: () => amcPlanService.getAll(params),
  });
}

export function useAMCPlan(id: string) {
  return useQuery({
    queryKey: [...KEYS.amcPlans, id],
    queryFn: () => amcPlanService.getById(id),
    enabled: !!id,
  });
}

export function useCreateAMCPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => amcPlanService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.amcPlans }),
  });
}

export function useUpdateAMCPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      amcPlanService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.amcPlans }),
  });
}

export function useImportAMCPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => amcPlanService.importPlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.amcPlans }),
  });
}

// ── AMC Contracts ───────────────────────────────────────────────────────────

export function useAMCContracts(params?: any) {
  return useQuery({
    queryKey: [...KEYS.amcContracts, params],
    queryFn: () => amcContractService.getAll(params),
  });
}

export function useAMCContract(id: string) {
  return useQuery({
    queryKey: [...KEYS.amcContracts, id],
    queryFn: () => amcContractService.getById(id),
    enabled: !!id,
  });
}

export function useExpiringContracts(days?: number) {
  return useQuery({
    queryKey: [...KEYS.amcContracts, "expiring", days],
    queryFn: () => amcContractService.getExpiring(days),
  });
}

export function useCreateAMCContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => amcContractService.create(dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.amcContracts }),
  });
}

export function useActivateAMCContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => amcContractService.activate(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.amcContracts }),
  });
}

export function useRenewAMCContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto?: any }) =>
      amcContractService.renew(id, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.amcContracts }),
  });
}

// ── AMC Schedules ────────────────────────────────────────────────────────────

export function useAMCSchedules(params?: any) {
  return useQuery({
    queryKey: [...KEYS.amcSchedules, params],
    queryFn: () => amcScheduleService.getAll(params),
  });
}

export function useCompleteAMCSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      amcScheduleService.complete(id, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.amcSchedules }),
  });
}

export function useRescheduleAMCSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newDate }: { id: string; newDate: string }) =>
      amcScheduleService.reschedule(id, newDate),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.amcSchedules }),
  });
}

// ── Service Visits ────────────────────────────────────────────────────────────

export function useServiceVisits(params?: any) {
  return useQuery({
    queryKey: [...KEYS.serviceVisits, params],
    queryFn: () => serviceVisitService.getAll(params),
  });
}

export function useServiceVisit(id: string) {
  return useQuery({
    queryKey: [...KEYS.serviceVisits, id],
    queryFn: () => serviceVisitService.getById(id),
    enabled: !!id,
  });
}

export function useCreateServiceVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => serviceVisitService.create(dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.serviceVisits }),
  });
}

export function useUpdateServiceVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      serviceVisitService.update(id, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: KEYS.serviceVisits }),
  });
}
