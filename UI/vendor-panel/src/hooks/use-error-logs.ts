'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { errorLogsApi } from '@/lib/api/error-logs';
import type { ErrorLogFilters } from '@/types/error-log';

export function useErrorLogs(filters?: ErrorLogFilters) {
  return useQuery({
    queryKey: ['error-logs', filters],
    queryFn: () => errorLogsApi.list(filters),
  });
}

export function useErrorLog(traceId: string) {
  return useQuery({
    queryKey: ['error-log', traceId],
    queryFn: () => errorLogsApi.getByTraceId(traceId),
    enabled: !!traceId,
  });
}

export function useErrorLogById(id: string) {
  return useQuery({
    queryKey: ['error-log-detail', id],
    queryFn: () => errorLogsApi.getById(id),
    enabled: !!id,
  });
}

export function useErrorStats() {
  return useQuery({
    queryKey: ['error-stats'],
    queryFn: () => errorLogsApi.getStats(),
  });
}

export function useErrorTrends() {
  return useQuery({
    queryKey: ['error-trends'],
    queryFn: () => errorLogsApi.getTrends(),
  });
}

export function useResolveError() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: string }) =>
      errorLogsApi.resolve(id, resolution),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['error-log'] });
      qc.invalidateQueries({ queryKey: ['error-logs'] });
      qc.invalidateQueries({ queryKey: ['error-log-detail'] });
    },
  });
}

export function useAssignError() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assignedToId, assignedToName }: { id: string; assignedToId: string; assignedToName: string }) =>
      errorLogsApi.assign(id, assignedToId, assignedToName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['error-log'] });
      qc.invalidateQueries({ queryKey: ['error-logs'] });
      qc.invalidateQueries({ queryKey: ['error-log-detail'] });
    },
  });
}

export function useIgnoreError() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => errorLogsApi.ignore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['error-log'] });
      qc.invalidateQueries({ queryKey: ['error-logs'] });
      qc.invalidateQueries({ queryKey: ['error-log-detail'] });
    },
  });
}

export function useAutoReportRules() {
  return useQuery({
    queryKey: ['auto-report-rules'],
    queryFn: () => errorLogsApi.listRules(),
  });
}

export function useReportToProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => errorLogsApi.reportToProvider(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['error-log'] });
      qc.invalidateQueries({ queryKey: ['error-logs'] });
      qc.invalidateQueries({ queryKey: ['error-log-detail'] });
    },
  });
}
