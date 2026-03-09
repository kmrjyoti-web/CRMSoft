import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  definitionService,
  reportDataService,
  templateService,
  bookmarkService,
  scheduleService,
} from '../services/report.service';
import type {
  GenerateReportParams,
  ExportReportParams,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  CreateBookmarkPayload,
  CreateSchedulePayload,
  UpdateSchedulePayload,
} from '../types/report.types';

const KEYS = {
  definitions: ['report-definitions'] as const,
  definition: (code: string) => ['report-definition', code] as const,
  templates: ['report-templates'] as const,
  template: (id: string) => ['report-template', id] as const,
  bookmarks: ['report-bookmarks'] as const,
  schedules: ['report-schedules'] as const,
  schedule: (id: string) => ['report-schedule', id] as const,
  exports: ['report-exports'] as const,
};

// ── Definitions ──────────────────────────────────────────────────────

export function useReportDefinitions(category?: string) {
  return useQuery({
    queryKey: [...KEYS.definitions, category],
    queryFn: () => definitionService.list(category),
  });
}

export function useReportDefinition(code: string) {
  return useQuery({
    queryKey: KEYS.definition(code),
    queryFn: () => definitionService.get(code),
    enabled: !!code,
  });
}

// ── Generate / Export ────────────────────────────────────────────────

export function useGenerateReport() {
  return useMutation({
    mutationFn: ({ code, params }: { code: string; params: GenerateReportParams }) =>
      reportDataService.generate(code, params),
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ code, params }: { code: string; params: ExportReportParams }) =>
      reportDataService.export(code, params),
  });
}

export function useDrillDown() {
  return useMutation({
    mutationFn: ({ code, params }: { code: string; params: any }) =>
      reportDataService.drillDown(code, params),
  });
}

export function useExportHistory(params?: { reportCode?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...KEYS.exports, params],
    queryFn: () => reportDataService.getExportHistory(params),
  });
}

// ── Templates ────────────────────────────────────────────────────────

export function useReportTemplates() {
  return useQuery({
    queryKey: KEYS.templates,
    queryFn: () => templateService.list(),
  });
}

export function useReportTemplate(id: string) {
  return useQuery({
    queryKey: KEYS.template(id),
    queryFn: () => templateService.get(id),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTemplatePayload) => templateService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.templates }),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTemplatePayload }) =>
      templateService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.templates }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => templateService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.templates }),
  });
}

// ── Bookmarks ────────────────────────────────────────────────────────

export function useReportBookmarks() {
  return useQuery({
    queryKey: KEYS.bookmarks,
    queryFn: () => bookmarkService.list(),
  });
}

export function useCreateBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookmarkPayload) => bookmarkService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.bookmarks }),
  });
}

export function useToggleBookmarkPin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      bookmarkService.update(id, { isPinned }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.bookmarks }),
  });
}

export function useDeleteBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookmarkService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.bookmarks }),
  });
}

// ── Schedules ────────────────────────────────────────────────────────

export function useReportSchedules() {
  return useQuery({
    queryKey: KEYS.schedules,
    queryFn: () => scheduleService.list(),
  });
}

export function useReportSchedule(id: string) {
  return useQuery({
    queryKey: KEYS.schedule(id),
    queryFn: () => scheduleService.get(id),
    enabled: !!id,
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSchedulePayload) => scheduleService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.schedules }),
  });
}

export function useUpdateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSchedulePayload }) =>
      scheduleService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.schedules }),
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduleService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.schedules }),
  });
}
