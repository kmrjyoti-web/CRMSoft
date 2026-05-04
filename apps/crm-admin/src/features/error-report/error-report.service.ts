import apiClient from '@/services/api-client';

export type ErrorReportSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ErrorReportStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED';

export interface SubmitErrorReportInput {
  title: string;
  description: string;
  errorCode?: string;
  severity: ErrorReportSeverity;
  screenshotUrl?: string;
}

export interface ErrorReport {
  id: string;
  title: string;
  description: string;
  errorCode?: string;
  severity: ErrorReportSeverity;
  screenshotUrl?: string;
  status: ErrorReportStatus;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

const BASE_PATH = '/api/v1/errors/report';

export async function submitErrorReport(data: SubmitErrorReportInput): Promise<ErrorReport> {
  const res = await apiClient.post<{ data: ErrorReport }>(BASE_PATH, data);
  return res.data.data;
}

export async function getMyReports(): Promise<ErrorReport[]> {
  const res = await apiClient.get<{ data: ErrorReport[] }>(`${BASE_PATH}/my`);
  const raw = res.data.data;
  return Array.isArray(raw) ? raw : [];
}

export async function getReportById(id: string): Promise<ErrorReport> {
  const res = await apiClient.get<{ data: ErrorReport }>(`${BASE_PATH}/${id}`);
  return res.data.data;
}
