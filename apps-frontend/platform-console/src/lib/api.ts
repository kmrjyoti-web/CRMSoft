const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${err}`);
  }
  return res.json();
}

export type AlertRuleInput = {
  name: string;
  errorCodePattern: string;
  severity: string;
  thresholdCount: number;
  windowMinutes: number;
  cooldownMinutes: number;
  channels: Record<string, unknown>;
  enabled: boolean;
};

export const api = {
  dashboard: {
    overview: () => apiFetch('/platform-console/dashboard'),
    health: () => apiFetch('/platform-console/dashboard/health'),
    errors: () => apiFetch('/platform-console/dashboard/errors'),
    tests: () => apiFetch('/platform-console/dashboard/tests'),
  },
  errors: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/platform-console/errors${qs}`);
    },
    get: (id: string) => apiFetch(`/platform-console/errors/${id}`),
    stats: () => apiFetch('/platform-console/errors/stats'),
    trends: (period = 'DAILY') =>
      apiFetch(`/platform-console/errors/trends?period=${period}`),
    // Phase 2 — developer escalation views
    escalated: (params?: { page?: number; limit?: number }) => {
      const qs = params
        ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))).toString()
        : '';
      return apiFetch(`/platform-console/errors/escalated${qs}`);
    },
    autoReports: (params?: { page?: number; limit?: number }) => {
      const qs = params
        ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))).toString()
        : '';
      return apiFetch(`/platform-console/errors/auto-reports${qs}`);
    },
    byBrand: (params?: { page?: number; limit?: number }) => {
      const qs = params
        ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))).toString()
        : '';
      return apiFetch(`/platform-console/errors/by-brand${qs}`);
    },
    resolve: (id: string, resolution: string) =>
      apiFetch(`/platform-console/errors/${id}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ resolution }),
      }),
    assign: (id: string, assigneeId: string) =>
      apiFetch(`/platform-console/errors/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assigneeId }),
      }),
    addNote: (id: string, note: string) =>
      apiFetch(`/platform-console/errors/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      }),
  },
  alerts: {
    rules: () => apiFetch('/platform-console/alerts/rules'),
    createRule: (data: AlertRuleInput) =>
      apiFetch('/platform-console/alerts/rules', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateRule: (id: string, data: Partial<AlertRuleInput>) =>
      apiFetch(`/platform-console/alerts/rules/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    deleteRule: (id: string) =>
      apiFetch(`/platform-console/alerts/rules/${id}`, { method: 'DELETE' }),
    history: (params?: { page?: number; limit?: number }) => {
      const qs = params
        ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))).toString()
        : '';
      return apiFetch(`/platform-console/alerts/history${qs}`);
    },
  },
  health: {
    all: () => apiFetch('/platform-console/health'),
    service: (name: string) => apiFetch(`/platform-console/health/${name}`),
    check: () =>
      apiFetch('/platform-console/health/check', { method: 'POST' }),
  },
  versions: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/platform-console/versions${qs}`);
    },
    get: (id: string) => apiFetch(`/platform-console/versions/${id}`),
    create: (data: { version: string; verticalType?: string; releaseType: string; releaseNotes?: string; gitTag?: string; gitCommitHash?: string }) =>
      apiFetch('/platform-console/versions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/versions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    publish: (id: string, publishedBy: string) =>
      apiFetch(`/platform-console/versions/${id}/publish`, { method: 'POST', body: JSON.stringify({ publishedBy }) }),
    rollback: (id: string, reason: string, rolledBackBy: string) =>
      apiFetch(`/platform-console/versions/${id}/rollback`, { method: 'POST', body: JSON.stringify({ reason, rolledBackBy }) }),
    verticals: () => apiFetch('/platform-console/versions/verticals'),
    verticalDetail: (type: string) => apiFetch(`/platform-console/versions/verticals/${type}`),
    rollbacks: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/platform-console/versions/rollbacks${qs}`);
    },
  },
  tests: {
    stats: () => apiFetch('/platform-console/tests/stats'),
    // Plans
    plans: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/platform-console/tests/plans${qs}`);
    },
    getPlan: (id: string) => apiFetch(`/platform-console/tests/plans/${id}`),
    createPlan: (data: any) =>
      apiFetch('/platform-console/tests/plans', { method: 'POST', body: JSON.stringify(data) }),
    updatePlan: (id: string, data: any) =>
      apiFetch(`/platform-console/tests/plans/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deletePlan: (id: string) =>
      apiFetch(`/platform-console/tests/plans/${id}`, { method: 'DELETE' }),
    // Execution
    run: (data?: { moduleScope?: string; verticalScope?: string; planId?: string }) =>
      apiFetch('/platform-console/tests/run', { method: 'POST', body: JSON.stringify(data || {}) }),
    runModule: (module: string) =>
      apiFetch(`/platform-console/tests/run/module/${module}`, { method: 'POST' }),
    runVertical: (code: string) =>
      apiFetch(`/platform-console/tests/run/vertical/${code}`, { method: 'POST' }),
    executions: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/platform-console/tests/executions${qs}`);
    },
    getExecution: (id: string) => apiFetch(`/platform-console/tests/executions/${id}`),
    latestExecution: () => apiFetch('/platform-console/tests/executions/latest'),
    // Schedules
    schedules: () => apiFetch('/platform-console/tests/schedules'),
    createSchedule: (data: any) =>
      apiFetch('/platform-console/tests/schedules', { method: 'POST', body: JSON.stringify(data) }),
    updateSchedule: (id: string, data: any) =>
      apiFetch(`/platform-console/tests/schedules/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteSchedule: (id: string) =>
      apiFetch(`/platform-console/tests/schedules/${id}`, { method: 'DELETE' }),
    // Coverage
    coverage: () => apiFetch('/platform-console/tests/coverage'),
    coverageModule: (module: string) => apiFetch(`/platform-console/tests/coverage/${module}`),
    refreshCoverage: () => apiFetch('/platform-console/tests/coverage/refresh', { method: 'POST' }),
  },
  brands: {
    list: () => apiFetch('/platform-console/brands'),
    get: (brandId: string) => apiFetch(`/platform-console/brands/${brandId}`),
    modules: (brandId: string) => apiFetch(`/platform-console/brands/${brandId}/modules`),
    whitelistModule: (brandId: string, data: { moduleCode: string; status?: string; trialExpiresAt?: string; enabledBy?: string }) =>
      apiFetch(`/platform-console/brands/${brandId}/modules`, { method: 'POST', body: JSON.stringify(data) }),
    updateModule: (brandId: string, id: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/brands/${brandId}/modules/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    removeModule: (brandId: string, id: string) =>
      apiFetch(`/platform-console/brands/${brandId}/modules/${id}`, { method: 'DELETE' }),
    features: (brandId: string) => apiFetch(`/platform-console/brands/${brandId}/features`),
    setFeature: (brandId: string, data: { featureCode: string; isEnabled: boolean; config?: Record<string, unknown> }) =>
      apiFetch(`/platform-console/brands/${brandId}/features`, { method: 'POST', body: JSON.stringify(data) }),
    updateFeature: (brandId: string, id: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/brands/${brandId}/features/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    removeFeature: (brandId: string, id: string) =>
      apiFetch(`/platform-console/brands/${brandId}/features/${id}`, { method: 'DELETE' }),
    errors: (brandId: string) => apiFetch(`/platform-console/brands/${brandId}/errors`),
    errorOverview: () => apiFetch('/platform-console/brands/errors/overview'),
  },
  menus: {
    tree: () => apiFetch('/platform-console/menus'),
    flat: () => apiFetch('/platform-console/menus/flat'),
    create: (data: { menuKey: string; label: string; labelHi: string; icon?: string; parentKey?: string; route?: string; moduleCode?: string; sortOrder?: number }) =>
      apiFetch('/platform-console/menus', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/menus/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch(`/platform-console/menus/${id}`, { method: 'DELETE' }),
    reorder: (items: Array<{ id: string; sortOrder: number; parentKey?: string }>) =>
      apiFetch('/platform-console/menus/reorder', { method: 'POST', body: JSON.stringify(items) }),
    brandMenu: (brandId: string) => apiFetch(`/platform-console/menus/brands/${brandId}`),
    brandOverrides: (brandId: string) => apiFetch(`/platform-console/menus/brands/${brandId}/overrides`),
    setBrandOverride: (brandId: string, data: { menuKey: string; customLabel?: string; customIcon?: string; isHidden?: boolean; sortOrder?: number }) =>
      apiFetch(`/platform-console/menus/brands/${brandId}/override`, { method: 'POST', body: JSON.stringify(data) }),
    updateBrandOverride: (brandId: string, id: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/menus/brands/${brandId}/override/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    removeBrandOverride: (brandId: string, id: string) =>
      apiFetch(`/platform-console/menus/brands/${brandId}/override/${id}`, { method: 'DELETE' }),
    preview: (brandId: string, role?: string) => {
      const path = role ? `/platform-console/menus/preview/${brandId}/${role}` : `/platform-console/menus/preview/${brandId}`;
      return apiFetch(path);
    },
  },
  security: {
    snapshots: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/platform-console/security/snapshots${qs}`);
    },
    latestSnapshots: () => apiFetch('/platform-console/security/snapshots/latest'),
    captureSnapshot: () => apiFetch('/platform-console/security/snapshots/capture', { method: 'POST' }),
    incidents: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/platform-console/security/incidents${qs}`);
    },
    createIncident: (data: { title: string; severity: string; description: string; affectedService: string }) =>
      apiFetch('/platform-console/security/incidents', { method: 'POST', body: JSON.stringify(data) }),
    getIncident: (id: string) => apiFetch(`/platform-console/security/incidents/${id}`),
    updateIncident: (id: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/security/incidents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    addPostmortem: (id: string, postmortem: string) =>
      apiFetch(`/platform-console/security/incidents/${id}/postmortem`, { method: 'POST', body: JSON.stringify({ postmortem }) }),
    drPlans: () => apiFetch('/platform-console/security/dr-plans'),
    getDRPlan: (service: string) => apiFetch(`/platform-console/security/dr-plans/${service}`),
    updateDRPlan: (service: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/security/dr-plans/${service}`, { method: 'PATCH', body: JSON.stringify(data) }),
    testDRPlan: (service: string) => apiFetch(`/platform-console/security/dr-plans/${service}/test`, { method: 'POST' }),
    notifications: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/platform-console/security/notifications${qs}`);
    },
    notificationStats: () => apiFetch('/platform-console/security/notifications/stats'),
  },
  cicd: {
    stats: () => apiFetch('/platform-console/cicd/stats'),
    deployments: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/platform-console/cicd/deployments${qs}`);
    },
    logDeployment: (data: { environment: string; version: string; gitBranch: string; gitCommitHash: string; deployedBy: string }) =>
      apiFetch('/platform-console/cicd/deployments', { method: 'POST', body: JSON.stringify(data) }),
    getDeployment: (id: string) => apiFetch(`/platform-console/cicd/deployments/${id}`),
    completeDeployment: (id: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/cicd/deployments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    latestDeployments: () => apiFetch('/platform-console/cicd/deployments/latest'),
    pipelines: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/platform-console/cicd/pipelines${qs}`);
    },
    logPipeline: (data: { pipelineName: string; triggerType: string; branch: string; jobs?: any[] }) =>
      apiFetch('/platform-console/cicd/pipelines', { method: 'POST', body: JSON.stringify(data) }),
    getPipeline: (id: string) => apiFetch(`/platform-console/cicd/pipelines/${id}`),
    completePipeline: (id: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/cicd/pipelines/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    pipelineLogs: (id: string) => apiFetch(`/platform-console/cicd/pipelines/${id}/logs`),
    addBuildLog: (pipelineId: string, data: { jobName: string; output: string; exitCode?: number; duration?: number }) =>
      apiFetch(`/platform-console/cicd/pipelines/${pipelineId}/logs`, { method: 'POST', body: JSON.stringify({ ...data, pipelineRunId: pipelineId }) }),
  },
  brandConfig: {
    list: () => apiFetch('/platform-console/brand-config'),
    get: (id: string) => apiFetch(`/platform-console/brand-config/${id}`),
    create: (data: { brandCode: string; brandName: string; displayName: string; description?: string; primaryColor?: string; secondaryColor?: string; logoUrl?: string; domain?: string; subdomain?: string; contactEmail?: string }) =>
      apiFetch('/platform-console/brand-config', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/brand-config/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    verticals: (brandId: string) => apiFetch(`/platform-console/brand-config/${brandId}/verticals`),
    enableVertical: (brandId: string, code: string) =>
      apiFetch(`/platform-console/brand-config/${brandId}/verticals/${code}/enable`, { method: 'POST' }),
    disableVertical: (brandId: string, code: string) =>
      apiFetch(`/platform-console/brand-config/${brandId}/verticals/${code}/disable`, { method: 'POST' }),
    updateOverrides: (brandId: string, code: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/brand-config/${brandId}/verticals/${code}/overrides`, { method: 'PATCH', body: JSON.stringify(data) }),
    effectiveConfig: (brandId: string, code: string) =>
      apiFetch(`/platform-console/brand-config/${brandId}/verticals/${code}/effective`),
  },
  verticals: {
    list: () => apiFetch('/platform-console/verticals'),
    get: (code: string) => apiFetch(`/platform-console/verticals/${code}`),
    register: (data: { code: string; name: string; nameHi: string; schemasConfig?: Record<string, unknown> }) =>
      apiFetch('/platform-console/verticals', { method: 'POST', body: JSON.stringify(data) }),
    update: (code: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/verticals/${code}`, { method: 'PATCH', body: JSON.stringify(data) }),
    updateStatus: (code: string, status: string) =>
      apiFetch(`/platform-console/verticals/${code}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    health: (code: string) => apiFetch(`/platform-console/verticals/${code}/health`),
    healthOverview: () => apiFetch('/platform-console/verticals/health/overview'),
    audit: (code: string) => apiFetch(`/platform-console/verticals/${code}/audit`, { method: 'POST' }),
    audits: (code: string, params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/platform-console/verticals/${code}/audits${qs}`);
    },
    auditDetail: (code: string, id: string) => apiFetch(`/platform-console/verticals/${code}/audits/${id}`),
  },
  creator: {
    validateVertical: (code: string) =>
      apiFetch(`/platform-console/creator/vertical/validate?code=${encodeURIComponent(code)}`),
    createVertical: (data: Record<string, unknown>) =>
      apiFetch('/platform-console/creator/vertical', { method: 'POST', body: JSON.stringify(data) }),
    getModules: (verticalCode: string) =>
      apiFetch(`/platform-console/creator/vertical/${verticalCode}/modules`),
    validateModule: (verticalCode: string, code: string) =>
      apiFetch(`/platform-console/creator/vertical/${verticalCode}/module/validate?code=${encodeURIComponent(code)}`),
    createModule: (verticalCode: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/creator/vertical/${verticalCode}/module`, { method: 'POST', body: JSON.stringify(data) }),
    updateModule: (id: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/creator/module/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteModule: (id: string) =>
      apiFetch(`/platform-console/creator/module/${id}`, { method: 'DELETE' }),
    validateFeature: (verticalCode: string, code: string) =>
      apiFetch(`/platform-console/creator/vertical/${verticalCode}/feature/validate?code=${encodeURIComponent(code)}`),
    createFeature: (verticalCode: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/creator/vertical/${verticalCode}/feature`, { method: 'POST', body: JSON.stringify(data) }),
    updateFeature: (id: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/creator/feature/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteFeature: (id: string) =>
      apiFetch(`/platform-console/creator/feature/${id}`, { method: 'DELETE' }),
  },
  menuEditor: {
    list: (verticalCode: string) => apiFetch(`/platform-console/menu-editor/${verticalCode}`),
    create: (verticalCode: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/menu-editor/${verticalCode}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (verticalCode: string, menuId: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/menu-editor/${verticalCode}/menu/${menuId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (verticalCode: string, menuId: string) =>
      apiFetch(`/platform-console/menu-editor/${verticalCode}/menu/${menuId}`, { method: 'DELETE' }),
    bulkOrder: (verticalCode: string, updates: Array<{ id: string; parent_menu_id?: string | null; sort_order?: number; depth_level?: number }>) =>
      apiFetch(`/platform-console/menu-editor/${verticalCode}/bulk-order`, { method: 'POST', body: JSON.stringify({ updates }) }),
    validateRoute: (verticalCode: string, route: string, excludeMenuId?: string) =>
      apiFetch(`/platform-console/menu-editor/${verticalCode}/validate-route`, { method: 'POST', body: JSON.stringify({ route, excludeMenuId }) }),
  },
};
