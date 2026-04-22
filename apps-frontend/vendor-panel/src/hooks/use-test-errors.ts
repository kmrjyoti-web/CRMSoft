'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testErrorsApi, testReportsApi, devQAApi } from '@/lib/api/test-errors';

// ─── Test Error Hooks ───

export function useTestErrorDashboard(days = 30) {
  return useQuery({
    queryKey: ['test-error-dashboard', days],
    queryFn: () => testErrorsApi.getDashboard(days),
    staleTime: 60_000,
  });
}

export function useTestErrors(params?: { testRunId?: string; category?: string; severity?: string; isResolved?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['test-errors', params],
    queryFn: () => testErrorsApi.list(params),
  });
}

export function useTestError(id: string) {
  return useQuery({
    queryKey: ['test-error', id],
    queryFn: () => testErrorsApi.getById(id),
    enabled: !!id,
  });
}

export function useReportToVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, context }: { id: string; context?: string }) =>
      testErrorsApi.reportToVendor(id, context),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['test-errors'] });
      qc.invalidateQueries({ queryKey: ['test-error-dashboard'] });
    },
  });
}

export function useResolveTestError() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: string }) =>
      testErrorsApi.markResolved(id, resolution),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['test-errors'] });
      qc.invalidateQueries({ queryKey: ['test-error-dashboard'] });
    },
  });
}

// ─── Test Report Hooks ───

export function useTestReports(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['test-reports', params],
    queryFn: () => testReportsApi.list(params),
  });
}

export function useTestReport(id: string) {
  return useQuery({
    queryKey: ['test-report', id],
    queryFn: () => testReportsApi.getById(id),
    enabled: !!id,
  });
}

export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (testRunId: string) => testReportsApi.generate(testRunId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['test-reports'] }),
  });
}

// ─── Dev QA Hooks ───

export function useDevQADashboard() {
  return useQuery({
    queryKey: ['dev-qa-dashboard'],
    queryFn: () => devQAApi.getDashboard(),
    staleTime: 30_000,
  });
}

export function useDevQAPlans(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['dev-qa-plans', params],
    queryFn: () => devQAApi.listPlans(params),
  });
}

export function useGenerateDevQAPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, modules }: { name: string; modules?: string[] }) =>
      devQAApi.generatePlan(name, modules),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dev-qa-plans'] });
      qc.invalidateQueries({ queryKey: ['dev-qa-dashboard'] });
      qc.invalidateQueries({ queryKey: ['test-plans'] });
    },
  });
}

export function useSyncToNotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => devQAApi.syncToNotion(planId),
    onSuccess: (_, planId) => {
      qc.invalidateQueries({ queryKey: ['dev-qa-plans'] });
      qc.invalidateQueries({ queryKey: ['test-plan', planId] });
    },
  });
}

export function usePullFromNotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => devQAApi.pullFromNotion(planId),
    onSuccess: (_, planId) => {
      qc.invalidateQueries({ queryKey: ['dev-qa-plans'] });
      qc.invalidateQueries({ queryKey: ['test-plan', planId] });
    },
  });
}
