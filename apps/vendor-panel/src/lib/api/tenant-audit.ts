import apiClient from './client';
import type { AuditLogFilters } from '@/types/tenant-audit';

export const tenantAuditApi = {
  startAudit: (tenantId: string, data: { reason: string; scheduledDays?: number }) =>
    apiClient.post(`/vendor/tenants/${tenantId}/audit/start`, data).then((r) => r.data),

  stopAudit: (tenantId: string) =>
    apiClient.post(`/vendor/tenants/${tenantId}/audit/stop`).then((r) => r.data),

  getStatus: (tenantId: string) =>
    apiClient.get(`/vendor/tenants/${tenantId}/audit`).then((r) => r.data),

  getLogs: (tenantId: string, filters?: AuditLogFilters) =>
    apiClient.get(`/vendor/tenants/${tenantId}/audit/logs`, { params: filters }).then((r) => r.data),

  getReport: (tenantId: string) =>
    apiClient.get(`/vendor/tenants/${tenantId}/audit/report`).then((r) => r.data),

  getHistory: (tenantId: string) =>
    apiClient.get(`/vendor/tenants/${tenantId}/audit/history`).then((r) => r.data),

  getAllActive: () =>
    apiClient.get('/vendor/audits').then((r) => r.data),
};
