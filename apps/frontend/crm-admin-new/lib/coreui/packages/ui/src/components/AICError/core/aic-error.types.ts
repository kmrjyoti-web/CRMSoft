/**
 * AICError system types.
 * Framework-agnostic -- no React, Angular, or other framework imports.
 *
 * Source: Angular AICError models & config.
 */

// ── Error Scope & Source ────────────────────────────────────────────────────

/** High-level error scope classification. */
export type AICErrorScope = 'API' | 'STATE' | 'COMPONENT';

/** Identifies where the error originated. */
export type AICErrorSource =
  | 'HTTP_INTERCEPTOR'
  | 'BASE_HTTP'
  | 'STORE'
  | 'SIGNAL_STORE'
  | 'COMPONENT'
  | 'GLOBAL_HANDLER';

/** Severity level for error classification. */
export type AICErrorSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'CRITICAL';

// ── Error Detail ────────────────────────────────────────────────────────────

/** Individual server-side error detail entry. */
export interface AICServerErrorDetail {
  code?: string;
  message?: string;
  detail?: string;
  field?: string;
}

// ── API Response Shape ──────────────────────────────────────────────────────

/** Standard API response wrapper used across the platform. */
export interface AICApiResponse<T = unknown> {
  data: T | null;
  pagination_info: unknown | null;
  is_success: boolean;
  status: string;
  response_code: string;
  response_severity: string;
  response_message?: string;
  response_details?: AICServerErrorDetail[] | null;
}

// ── Unified Error Model ─────────────────────────────────────────────────────

/** Normalized error object used throughout the AICError system. */
export interface ApiError {
  status: number;
  code: string | number;
  message: string;
  severity?: AICErrorSeverity | string;
  scope: AICErrorScope;
  source: AICErrorSource;
  details?: AICServerErrorDetail[];
  raw?: unknown;
  timestamp?: number;
}

// ── Configuration ───────────────────────────────────────────────────────────

/** Global error handling configuration. */
export interface AICErrorGlobalConfig {
  loggingEnabled: boolean;
  api: {
    logAll: boolean;
    logStatuses: number[];
    toastOnStatuses: number[];
  };
  state: {
    logAll: boolean;
  };
  component: {
    logAll: boolean;
  };
  redirectOnServerError?: boolean;
}

/** Rule for mapping server error messages to form controls. */
export interface AICFormErrorRule {
  pattern: string;
  control: string;
  flags?: string;
  elementId?: string;
}

/** Configuration for mapping API errors to form fields. */
export interface AICFormErrorConfig {
  formId: string;
  messagePatterns: AICFormErrorRule[];
  elementIdMap: Record<string, string>;
  focusFirstError?: boolean;
  logPolicy?: {
    captureRequest?: boolean;
    captureResponse?: boolean;
    maskFields?: string[];
  };
}

/** Per-component error handling configuration. */
export interface AICComponentErrorConfig {
  componentId: string;
  toast?: boolean;
  log?: boolean;
  severity?: AICErrorSeverity;
}

// ── Error Log Entry ─────────────────────────────────────────────────────────

/** Stored error log entry for the dashboard and debugging. */
export interface ErrorLogEntry {
  id: string;
  timestamp: number;
  type: string;
  message: string;
  severity: string;
  scope: AICErrorScope;
  source?: AICErrorSource;
  feature?: string;
  operation?: string;
  context?: Record<string, unknown>;
}

// ── Error Context ───────────────────────────────────────────────────────────

/** Contextual information attached to an error during logging. */
export interface ErrorContext {
  feature?: string;
  operation?: string;
  requestBody?: unknown;
  requestUrl?: string;
}

// ── Environment Info ────────────────────────────────────────────────────────

/** Client environment snapshot captured at error time. */
export interface EnvironmentInfo {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  online: boolean;
  networkType?: string;
}

// ── Default Config ──────────────────────────────────────────────────────────

/** Sensible defaults for the global error configuration. */
export const DEFAULT_ERROR_CONFIG: AICErrorGlobalConfig = {
  loggingEnabled: true,
  api: {
    logAll: true,
    logStatuses: [400, 401, 403, 404, 500, 502, 503],
    toastOnStatuses: [400, 401, 403, 500],
  },
  state: { logAll: true },
  component: { logAll: true },
  redirectOnServerError: false,
};

// ── AICError Dashboard Props ──────────────────────────────────────────────

/** Props for the AICError dashboard (framework-agnostic definition). */
export interface AICErrorDashboardProps {
  errors?: ErrorLogEntry[];
  onReload?: () => Promise<void>;
  onClear?: () => Promise<void>;
  className?: string;
}

// ── AICError Boundary Props ───────────────────────────────────────────────

/**
 * Props for the AICError boundary (framework-agnostic definition).
 * Note: `fallback` and `children` are typed as `unknown` here to remain
 * framework-agnostic. The React wrapper narrows these to React types.
 */
export interface AICErrorBoundaryProps {
  fallback?: unknown;
  onError?: (error: Error, errorInfo: unknown) => void;
  children?: unknown;
}
