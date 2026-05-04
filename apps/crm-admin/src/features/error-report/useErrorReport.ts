import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as service from './error-report.service';
import type { SubmitErrorReportInput } from './error-report.service';

// ── Query keys ─────────────────────────────────────────────────────────────────

export const ERROR_REPORT_KEYS = {
  myReports: ['error-report', 'my'] as const,
  report: (id: string) => ['error-report', id] as const,
};

// ── useMyReports ──────────────────────────────────────────────────────────────

export function useMyReports() {
  return useQuery({
    queryKey: ERROR_REPORT_KEYS.myReports,
    queryFn: service.getMyReports,
  });
}

// ── useReportById ─────────────────────────────────────────────────────────────

export function useReportById(id: string) {
  return useQuery({
    queryKey: ERROR_REPORT_KEYS.report(id),
    queryFn: () => service.getReportById(id),
    enabled: !!id,
  });
}

// ── useSubmitErrorReport ──────────────────────────────────────────────────────

export function useSubmitErrorReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitErrorReportInput) => service.submitErrorReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ERROR_REPORT_KEYS.myReports });
      toast.success('Report submitted. Our team will look into it.');
    },
    onError: () => {
      toast.error('Failed to submit report. Please try again.');
    },
  });
}

// ── useErrorReportDrawer ──────────────────────────────────────────────────────

export function useErrorReportDrawer() {
  const [open, setOpen] = useState(false);
  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  return { open, openDrawer, closeDrawer };
}
