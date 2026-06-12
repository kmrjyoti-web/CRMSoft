import { apiClient } from './client';

export interface TestPlanItem {
  id: string;
  planId: string;
  moduleName: string;
  componentName: string;
  functionality: string;
  layer: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'PARTIAL' | 'BLOCKED' | 'SKIPPED';
  testedById?: string;
  testedAt?: string;
  notes?: string;
  errorDetails?: string;
  evidences?: TestEvidence[];
  createdAt: string;
  updatedAt: string;
}

export interface TestEvidence {
  id: string;
  planItemId: string;
  fileType: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  caption?: string;
  createdAt: string;
}

export interface TestPlan {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  version?: string;
  targetModules: string[];
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  totalItems: number;
  passedItems: number;
  failedItems: number;
  completedItems: number;
  progress: number;
  notionPageId?: string;
  notionSyncedAt?: string;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  items?: TestPlanItem[];
  _count?: { items: number };
}

export interface CreateTestPlanBody {
  name: string;
  description?: string;
  version?: string;
  targetModules?: string[];
  items?: Array<{
    moduleName: string;
    componentName: string;
    functionality: string;
    layer: string;
    priority?: string;
  }>;
}

export const testPlansApi = {
  list: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
    apiClient.get('/ops/manual-test/plans', { params }).then(r => (r.data as any).data),

  getById: (planId: string) =>
    apiClient.get(`/ops/manual-test/plans/${planId}`).then(r => (r.data as any).data),

  create: (body: CreateTestPlanBody) =>
    apiClient.post('/ops/manual-test/plans', body).then(r => (r.data as any).data),

  update: (planId: string, body: Partial<CreateTestPlanBody> & { status?: string }) =>
    apiClient.patch(`/ops/manual-test/plans/${planId}`, body).then(r => (r.data as any).data),

  updateItem: (
    planId: string,
    itemId: string,
    body: {
      status?: string;
      notes?: string;
      errorDetails?: string;
      priority?: string;
      moduleName?: string;
      componentName?: string;
      functionality?: string;
      layer?: string;
    },
  ) =>
    apiClient.patch(`/ops/manual-test/plans/${planId}/items/${itemId}`, body).then(r => (r.data as any).data),
};
