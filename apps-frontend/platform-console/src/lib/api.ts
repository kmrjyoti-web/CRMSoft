const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const lsToken = localStorage.getItem('pc_token');
  if (lsToken) return lsToken;
  const match = document.cookie.match(/pc_token=([^;]+)/);
  return match ? match[1] : null;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options?.headers as Record<string, string>) ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pc_token');
      localStorage.removeItem('pc_user');
      document.cookie = 'pc_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login?returnUrl=' + encodeURIComponent(window.location.pathname);
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${err}`);
  }
  const json = await res.json();
  // Unwrap NestJS ResponseMapperInterceptor envelope: { success, data, ... }
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }
  return json as T;
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
  brandProfile: {
    getByCode: (code: string) => apiFetch(`/platform-console/creator/brand/${encodeURIComponent(code)}`),
  },
  creator: {
    listVerticals: () =>
      apiFetch('/platform-console/creator/verticals'),
    getVertical: (code: string) =>
      apiFetch(`/platform-console/creator/verticals/${encodeURIComponent(code)}`),
    updateVertical: (code: string, data: Record<string, unknown>) =>
      apiFetch(`/platform-console/creator/verticals/${encodeURIComponent(code)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
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
  pcConfig: {
    partners: () => apiFetch('/pc-config/partners'),
    partner: (code: string) => apiFetch(`/pc-config/partner/${encodeURIComponent(code)}`),
    brands: () => apiFetch('/pc-config/brands'),
    brand: (code: string) => apiFetch(`/pc-config/brand/${encodeURIComponent(code)}`),
    crmEditions: () => apiFetch('/pc-config/crm-editions'),
    verticals: (crmEdition?: string) => {
      const qs = crmEdition ? `?crmEdition=${encodeURIComponent(crmEdition)}` : '';
      return apiFetch(`/pc-config/verticals${qs}`);
    },
    subTypes: (vertical?: string, userType?: string) => {
      const params = new URLSearchParams();
      if (vertical) params.set('vertical', vertical);
      if (userType) params.set('userType', userType);
      const qs = params.toString();
      return apiFetch(`/pc-config/sub-types${qs ? `?${qs}` : ''}`);
    },
    suggestCode: (name: string, type: string) =>
      apiFetch(`/pc-config/suggest-code?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`),
    combinedCode: (code: string) => apiFetch(`/pc-config/combined-code/${encodeURIComponent(code)}`),
    combinedCodes: (brandCode?: string) => {
      const qs = brandCode ? `?brandCode=${encodeURIComponent(brandCode)}` : '';
      return apiFetch(`/pc-config/combined-codes${qs}`);
    },
    pageRegistry: (portal?: string) => {
      const qs = portal ? `?portal=${encodeURIComponent(portal)}` : '';
      return apiFetch(`/pc-config/page-registry${qs}`);
    },
    registrationForm: (combinedCode: string) =>
      apiFetch(`/pc-config/registration-form?combinedCode=${encodeURIComponent(combinedCode)}`),
    onboardingStages: (combinedCode?: string) => {
      const qs = combinedCode ? `?combinedCode=${encodeURIComponent(combinedCode)}` : '';
      return apiFetch(`/pc-config/onboarding-stages${qs}`);
    },
    listOnboardingStagesAdmin: (combinedCode?: string) => {
      const qs = combinedCode ? `?combinedCode=${encodeURIComponent(combinedCode)}` : '';
      return apiFetch(`/pc-config/onboarding-stages-admin${qs}`);
    },
    createOnboardingStage: (data: {
      stageKey: string; stageLabel: string; componentName: string;
      required?: boolean; sortOrder?: number; combinedCodeId?: string; skipIfFieldSet?: string;
    }) => apiFetch('/pc-config/onboarding-stages', { method: 'POST', body: JSON.stringify(data) }),
    updateOnboardingStage: (id: string, data: {
      stageLabel?: string; componentName?: string; required?: boolean; skipIfFieldSet?: string;
    }) => apiFetch(`/pc-config/onboarding-stages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    toggleOnboardingStage: (id: string) =>
      apiFetch(`/pc-config/onboarding-stages/${id}/toggle`, { method: 'PATCH' }),
    reorderOnboardingStages: (stageIds: string[]) =>
      apiFetch('/pc-config/onboarding-stages/reorder', { method: 'PATCH', body: JSON.stringify({ stageIds }) }),
    deleteOnboardingStage: (id: string) =>
      apiFetch(`/pc-config/onboarding-stages/${id}`, { method: 'DELETE' }),
    listRegistrationFieldsAdmin: (combinedCode: string) =>
      apiFetch(`/pc-config/registration-fields-admin?combinedCode=${encodeURIComponent(combinedCode)}`),
    createRegistrationField: (data: {
      combinedCode: string; fieldKey: string; fieldType: string; label: string;
      placeholder?: string; helpText?: string; required?: boolean;
      options?: unknown; validation?: unknown; sortOrder?: number;
    }) => apiFetch('/pc-config/registration-fields', { method: 'POST', body: JSON.stringify(data) }),
    updateRegistrationField: (id: string, data: {
      label?: string; placeholder?: string; helpText?: string; required?: boolean;
      fieldType?: string; options?: unknown; validation?: unknown;
    }) => apiFetch(`/pc-config/registration-fields/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    toggleRegistrationField: (id: string) =>
      apiFetch(`/pc-config/registration-fields/${id}/toggle`, { method: 'PATCH' }),
    toggleFieldRequired: (id: string) =>
      apiFetch(`/pc-config/registration-fields/${id}/toggle-required`, { method: 'PATCH' }),
    toggleFieldVisibility: (id: string) =>
      apiFetch(`/pc-config/registration-fields/${id}/toggle-visibility`, { method: 'PATCH' }),
    reorderRegistrationFields: (fieldIds: string[]) =>
      apiFetch('/pc-config/registration-fields/reorder', { method: 'PATCH', body: JSON.stringify({ fieldIds }) }),
    deleteRegistrationField: (id: string) =>
      apiFetch(`/pc-config/registration-fields/${id}`, { method: 'DELETE' }),
    listStageFields: (stageId: string) =>
      apiFetch(`/pc-config/stage-fields/${stageId}`),
    addFieldToStage: (data: {
      stageId: string; combinedCodeId: string;
      fieldKey: string; fieldType: string; label: string;
      placeholder?: string; helpText?: string; required?: boolean;
    }) => apiFetch('/pc-config/stage-fields', { method: 'POST', body: JSON.stringify(data) }),
    moveFieldToStage: (id: string, newStageId: string | null) =>
      apiFetch(`/pc-config/stage-fields/${id}/move`, { method: 'PATCH', body: JSON.stringify({ newStageId }) }),
    createCombinedCode: (payload: {
      code: string; partnerId: string; brandId: string; crmEditionId: string;
      verticalId: string; userType: string; subTypeId: string;
      displayName: string; description?: string; businessModes?: string[];
    }) => apiFetch('/pc-config/combined-code', { method: 'POST', body: JSON.stringify(payload) }),
    createSubType: (payload: {
      code: string; shortCode: string; name: string; description?: string;
      verticalId: string; userType: string;
      allowedBusinessModes: string[]; defaultBusinessMode?: string;
      businessModeRequired?: boolean; sortOrder?: number;
    }) => apiFetch('/pc-config/sub-types', { method: 'POST', body: JSON.stringify(payload) }),
    updateSubType: (id: string, payload: {
      name?: string; shortCode?: string; description?: string;
      userType?: string; allowedBusinessModes?: string[];
      defaultBusinessMode?: string | null;
      businessModeRequired?: boolean; sortOrder?: number; isActive?: boolean;
    }) => apiFetch(`/pc-config/sub-types/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    deleteSubType: (id: string) => apiFetch(`/pc-config/sub-types/${id}`, { method: 'DELETE' }),
    listSubTypesAdmin: () => apiFetch('/pc-config/sub-types-admin'),
    checkCode: (code: string, type: string) =>
      apiFetch(`/pc-config/check-code?code=${encodeURIComponent(code)}&type=${encodeURIComponent(type)}`),
    createPartner: (payload: {
      code: string; shortCode: string; name: string; ownerEmail: string;
      description?: string; licenseLevel?: string;
    }) => apiFetch('/pc-config/partners', { method: 'POST', body: JSON.stringify(payload) }),
    createBrand: (payload: {
      code: string; shortCode?: string; name: string; description?: string;
      partnerId?: string; layoutFolder?: string; isPublic?: boolean;
    }) => apiFetch('/pc-config/brands', { method: 'POST', body: JSON.stringify(payload) }),
    createCrmEdition: (payload: {
      code: string; shortCode?: string; name: string; description?: string;
    }) => apiFetch('/pc-config/crm-editions', { method: 'POST', body: JSON.stringify(payload) }),
    createVertical: (payload: {
      typeCode: string; typeName: string; industryCategory: string;
      crmEditionId?: string; description?: string; shortCode?: string; sortOrder?: number;
    }) => apiFetch('/pc-config/verticals', { method: 'POST', body: JSON.stringify(payload) }),
    // ── Sprint 5.1 Master Code endpoints ──────────────────────────────────
    masterCodes: (filters?: { partnerCode?: string; brandCode?: string; verticalCode?: string }) => {
      const params = new URLSearchParams();
      if (filters?.partnerCode) params.set('partnerCode', filters.partnerCode);
      if (filters?.brandCode) params.set('brandCode', filters.brandCode);
      if (filters?.verticalCode) params.set('verticalCode', filters.verticalCode);
      const qs = params.toString();
      return apiFetch(`/pc-config/master-codes${qs ? `?${qs}` : ''}`);
    },
    masterCode: (id: string) => apiFetch(`/pc-config/master-codes/${encodeURIComponent(id)}`),
    createMasterCode: (payload: {
      partnerCode: string; editionCode: string; brandCode: string; verticalCode: string;
      displayName: string; description?: string;
      commonRegFields?: unknown[]; commonOnboardingStages?: unknown[];
    }) => apiFetch('/pc-config/master-codes', { method: 'POST', body: JSON.stringify(payload) }),
    updateMasterCode: (id: string, payload: {
      displayName?: string; description?: string;
      commonRegFields?: unknown[]; commonOnboardingStages?: unknown[];
    }) => apiFetch(`/pc-config/master-codes/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    deleteMasterCode: (id: string) =>
      apiFetch(`/pc-config/master-codes/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    masterCodeConfigs: (masterCodeId: string) =>
      apiFetch(`/pc-config/master-codes/${encodeURIComponent(masterCodeId)}/configs`),
    createMasterCodeConfig: (masterCodeId: string, payload: {
      userTypeCode: string; subTypeCode?: string; displayName: string;
      extraRegFields?: unknown[]; overrideOnboardingStages?: unknown[];
    }) => apiFetch(`/pc-config/master-codes/${encodeURIComponent(masterCodeId)}/configs`, { method: 'POST', body: JSON.stringify(payload) }),
    updateMasterCodeConfig: (masterCodeId: string, configId: string, payload: {
      displayName?: string; extraRegFields?: unknown[]; overrideOnboardingStages?: unknown[];
    }) => apiFetch(`/pc-config/master-codes/${encodeURIComponent(masterCodeId)}/configs/${encodeURIComponent(configId)}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    deleteMasterCodeConfig: (masterCodeId: string, configId: string) =>
      apiFetch(`/pc-config/master-codes/${encodeURIComponent(masterCodeId)}/configs/${encodeURIComponent(configId)}`, { method: 'DELETE' }),
    resolvedFields: (resolvedCode: string) =>
      apiFetch(`/pc-config/resolved-fields/${encodeURIComponent(resolvedCode)}`),
    // ── Sprint 8.3 Commission endpoints ──────────────────────────────────────
    commissionRules: (partnerCode?: string) => {
      const qs = partnerCode ? `?partnerCode=${encodeURIComponent(partnerCode)}` : '';
      return apiFetch(`/pc-config/commission/rules${qs}`);
    },
    createCommissionRule: (data: { partnerCode: string; planCode?: string; commissionType?: string; commissionPct: number; minTenants?: number; maxTenants?: number }) =>
      apiFetch('/pc-config/commission/rules', { method: 'POST', body: JSON.stringify(data) }),
    updateCommissionRule: (id: string, data: { commissionPct?: number; commissionType?: string; minTenants?: number; maxTenants?: number; isActive?: boolean }) =>
      apiFetch(`/pc-config/commission/rules/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteCommissionRule: (id: string) =>
      apiFetch(`/pc-config/commission/rules/${id}`, { method: 'DELETE' }),
    commissionLogs: (params?: { partnerCode?: string; status?: string; from?: string; to?: string }) => {
      const p = new URLSearchParams();
      if (params?.partnerCode) p.set('partnerCode', params.partnerCode);
      if (params?.status) p.set('status', params.status);
      if (params?.from) p.set('from', params.from);
      if (params?.to) p.set('to', params.to);
      const qs = p.toString();
      return apiFetch(`/pc-config/commission/logs${qs ? `?${qs}` : ''}`);
    },
    commissionSummary: (partnerCode: string) =>
      apiFetch(`/pc-config/commission/summary/${encodeURIComponent(partnerCode)}`),
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
