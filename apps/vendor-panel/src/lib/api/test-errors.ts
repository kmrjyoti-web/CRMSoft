import { apiClient } from './client';

export interface TestErrorLog {
  id: string;
  testRunId: string;
  testResultId?: string;
  errorCategory: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  errorCode?: string;
  message: string;
  details?: string;
  stackTrace?: string;
  moduleName?: string;
  componentName?: string;
  filePath?: string;
  isReportable: boolean;
  reportedToVendor: boolean;
  reportedAt?: string;
  vendorResponse?: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
  testRun?: { id: string; status: string; createdAt: string };
}

export interface ErrorDashboardData {
  period: { days: number; from: string; to: string };
  total: number;
  unresolved: number;
  critical: number;
  resolutionRate: number;
  meanTimeToResolutionMs: number | null;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  trend: Array<{ date: string; count: number }>;
  top10: Array<{ message: string; count: number; category: string }>;
}

export interface TestReport {
  id: string;
  testRunId: string;
  summary: any;
  categoryResults: Record<string, any>;
  moduleResults: Record<string, any>;
  errorSummary: any;
  recommendations?: string[];
  createdAt: string;
  testRun?: any;
}

export const testErrorsApi = {
  getDashboard: (days = 30) =>
    apiClient.get('/ops/test-error/dashboard', { params: { days } }).then(r => (r.data as any).data as ErrorDashboardData),

  list: (params?: { testRunId?: string; category?: string; severity?: string; isResolved?: string; page?: number; limit?: number }) =>
    apiClient.get('/ops/test-error', { params }).then(r => (r.data as any).data),

  getById: (id: string) =>
    apiClient.get(`/ops/test-error/${id}`).then(r => (r.data as any).data as TestErrorLog),

  reportToVendor: (id: string, context?: string) =>
    apiClient.post(`/ops/test-error/${id}/report`, { context }).then(r => (r.data as any).data),

  markResolved: (id: string, resolution: string) =>
    apiClient.patch(`/ops/test-error/${id}/resolve`, { resolution }).then(r => (r.data as any).data),

  generateFromRun: (testRunId: string) =>
    apiClient.post(`/ops/test-error/generate/${testRunId}`).then(r => (r.data as any).data),
};

export const testReportsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/ops/test-report', { params }).then(r => (r.data as any).data),

  getById: (id: string) =>
    apiClient.get(`/ops/test-report/${id}`).then(r => (r.data as any).data as TestReport),

  generate: (testRunId: string) =>
    apiClient.post(`/ops/test-report/generate/${testRunId}`).then(r => (r.data as any).data),
};

export const devQAApi = {
  generatePlan: (name: string, modules?: string[]) =>
    apiClient.post('/ops/dev-qa/generate-plan', { name, modules }).then(r => (r.data as any).data),

  syncToNotion: (planId: string) =>
    apiClient.post(`/ops/dev-qa/${planId}/sync-notion`).then(r => (r.data as any).data),

  pullFromNotion: (planId: string) =>
    apiClient.post(`/ops/dev-qa/${planId}/pull-notion`).then(r => (r.data as any).data),

  getDashboard: () =>
    apiClient.get('/ops/dev-qa/dashboard').then(r => (r.data as any).data),

  listPlans: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/ops/dev-qa/plans', { params }).then(r => (r.data as any).data),
};
