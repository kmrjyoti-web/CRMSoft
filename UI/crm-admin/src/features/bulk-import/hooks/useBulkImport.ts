import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkImportService } from "../services/bulk-import.service";
import type {
  ApplyMappingDto,
  SaveProfileDto,
  ImportJobListParams,
  ImportRowListParams,
  ImportTargetEntity,
} from "../types/bulk-import.types";

const KEY = "import";

// ── Jobs ─────────────────────────────────────────────────

export function useImportJobs(params?: ImportJobListParams) {
  return useQuery({
    queryKey: [KEY, "jobs", params],
    queryFn: () => bulkImportService.listJobs(params),
  });
}

export function useImportJob(jobId: string) {
  return useQuery({
    queryKey: [KEY, "job", jobId],
    queryFn: () => bulkImportService.getJob(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status === "VALIDATING" || status === "IMPORTING") return 3000;
      return false;
    },
  });
}

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, targetEntity }: { file: File; targetEntity: string }) =>
      bulkImportService.upload(file, targetEntity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "jobs"] });
    },
  });
}

export function useApplyMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, dto }: { jobId: string; dto: ApplyMappingDto }) =>
      bulkImportService.applyMapping(jobId, dto),
    onSuccess: (_, { jobId }) => {
      qc.invalidateQueries({ queryKey: [KEY, "job", jobId] });
    },
  });
}

export function useSelectProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, profileId }: { jobId: string; profileId: string }) =>
      bulkImportService.selectProfile(jobId, profileId),
    onSuccess: (_, { jobId }) => {
      qc.invalidateQueries({ queryKey: [KEY, "job", jobId] });
    },
  });
}

export function useSaveProfile() {
  return useMutation({
    mutationFn: ({ jobId, dto }: { jobId: string; dto: SaveProfileDto }) =>
      bulkImportService.saveProfile(jobId, dto),
  });
}

export function useValidateImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => bulkImportService.validate(jobId),
    onSuccess: (_, jobId) => {
      qc.invalidateQueries({ queryKey: [KEY, "job", jobId] });
    },
  });
}

export function useCommitImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => bulkImportService.commit(jobId),
    onSuccess: (_, jobId) => {
      qc.invalidateQueries({ queryKey: [KEY, "job", jobId] });
      qc.invalidateQueries({ queryKey: [KEY, "jobs"] });
    },
  });
}

export function useCancelImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => bulkImportService.cancel(jobId),
    onSuccess: (_, jobId) => {
      qc.invalidateQueries({ queryKey: [KEY, "job", jobId] });
      qc.invalidateQueries({ queryKey: [KEY, "jobs"] });
    },
  });
}

// ── Validation ───────────────────────────────────────────

export function useValidationSummary(jobId: string) {
  return useQuery({
    queryKey: [KEY, "validation", jobId],
    queryFn: () => bulkImportService.getValidationSummary(jobId),
    enabled: !!jobId,
  });
}

// ── Rows ─────────────────────────────────────────────────

export function useImportRows(jobId: string, params?: ImportRowListParams) {
  return useQuery({
    queryKey: [KEY, "rows", jobId, params],
    queryFn: () => bulkImportService.getRows(jobId, params),
    enabled: !!jobId,
  });
}

export function useRowAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, rowId, action }: { jobId: string; rowId: string; action: string }) =>
      bulkImportService.rowAction(jobId, rowId, action),
    onSuccess: (_, { jobId }) => {
      qc.invalidateQueries({ queryKey: [KEY, "rows", jobId] });
      qc.invalidateQueries({ queryKey: [KEY, "validation", jobId] });
    },
  });
}

export function useBulkRowAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, action }: { jobId: string; action: string }) =>
      bulkImportService.bulkRowAction(jobId, action),
    onSuccess: (_, { jobId }) => {
      qc.invalidateQueries({ queryKey: [KEY, "rows", jobId] });
      qc.invalidateQueries({ queryKey: [KEY, "validation", jobId] });
    },
  });
}

// ── Result ───────────────────────────────────────────────

export function useImportResult(jobId: string) {
  return useQuery({
    queryKey: [KEY, "result", jobId],
    queryFn: () => bulkImportService.getResult(jobId),
    enabled: !!jobId,
  });
}

// ── Mapping Suggestions ──────────────────────────────────

export function useMappingSuggestions(targetEntity: ImportTargetEntity) {
  return useQuery({
    queryKey: [KEY, "suggestions", targetEntity],
    queryFn: () => bulkImportService.getMappingSuggestions(targetEntity),
    enabled: !!targetEntity,
  });
}

// ── Profiles ─────────────────────────────────────────────

export function useImportProfiles(targetEntity?: string) {
  return useQuery({
    queryKey: [KEY, "profiles", targetEntity],
    queryFn: () => bulkImportService.listProfiles({ targetEntity }),
  });
}
