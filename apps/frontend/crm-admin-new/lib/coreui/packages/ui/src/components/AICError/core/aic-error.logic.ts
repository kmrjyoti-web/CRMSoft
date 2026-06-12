/**
 * AICError pure logic functions.
 * Framework-agnostic -- no React/Angular imports.
 *
 * Source: Angular AICErrorService, AICErrorLogService.
 */

import type {
  ApiError,
  AICErrorScope,
  AICErrorSource,
  AICErrorGlobalConfig,
  ErrorLogEntry,
  EnvironmentInfo,
  ErrorContext,
  AICFormErrorRule,
} from "./aic-error.types";

// ---------------------------------------------------------------------------
// In-memory error log store
// ---------------------------------------------------------------------------

let errorLogs: ErrorLogEntry[] = [];
let nextId = 1;

// ---------------------------------------------------------------------------
// Normalize to ApiError
// ---------------------------------------------------------------------------

/**
 * Converts any thrown value into a normalized `ApiError` object.
 */
export function normalizeToApiError(
  error: unknown,
  scope: AICErrorScope = 'COMPONENT',
  source: AICErrorSource = 'COMPONENT'
): ApiError {
  if (isApiError(error)) return error as ApiError;

  if (error instanceof Error) {
    return {
      status: 0,
      code: 'UNKNOWN',
      message: error.message,
      severity: 'ERROR',
      scope,
      source,
      raw: error,
      timestamp: Date.now(),
    };
  }

  return {
    status: 0,
    code: 'UNKNOWN',
    message: typeof error === 'string' ? error : 'An unexpected error occurred',
    severity: 'ERROR',
    scope,
    source,
    raw: error,
    timestamp: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

/**
 * Checks whether a value looks like a normalized `ApiError`.
 */
export function isApiError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as Record<string, unknown>;
  return 'scope' in e && 'source' in e && 'message' in e;
}

// ---------------------------------------------------------------------------
// Success Check
// ---------------------------------------------------------------------------

/**
 * Detects "success-like" errors -- API responses that indicate success
 * despite arriving through an error handling path.
 */
export function isSuccessLikeError(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;

  if (p.is_success === true) return true;
  if (p.status === 'SUCCESS') return true;
  if (typeof p.response_code === 'string' && (p.response_code as string).startsWith('2')) return true;
  if (typeof p.response_severity === 'string' && p.response_severity === 'INFO') return true;
  if (typeof p.message === 'string' && (p.message as string).toLowerCase().endsWith('successfully')) return true;

  return false;
}

// ---------------------------------------------------------------------------
// Environment Info
// ---------------------------------------------------------------------------

/**
 * Collects client environment information for error context.
 * Safely handles SSR environments where `window`/`navigator` may not exist.
 */
export function collectEnvironmentInfo(): EnvironmentInfo {
  return {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    screenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
    screenHeight: typeof window !== 'undefined' ? window.screen.height : 0,
    pixelRatio: typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    networkType:
      typeof navigator !== 'undefined'
        ? (navigator as unknown as { connection?: { effectiveType?: string } })
            ?.connection?.effectiveType
        : undefined,
  };
}

// ---------------------------------------------------------------------------
// Error Logging (in-memory)
// ---------------------------------------------------------------------------

/**
 * Logs a normalized error into the in-memory store and returns the entry.
 * The store is capped at 100 entries (oldest entries are discarded).
 */
export function logError(
  error: ApiError,
  ctx?: ErrorContext,
  _config?: AICErrorGlobalConfig
): ErrorLogEntry {
  const entry: ErrorLogEntry = {
    id: String(nextId++),
    timestamp: Date.now(),
    type: error.scope,
    message: error.message,
    severity: error.severity ?? 'ERROR',
    scope: error.scope,
    source: error.source,
    feature: ctx?.feature,
    operation: ctx?.operation,
    context: {
      ...ctx,
      env: collectEnvironmentInfo(),
      details: error.details,
    },
  };

  errorLogs.unshift(entry);

  // Keep max 100 entries
  if (errorLogs.length > 100) {
    errorLogs = errorLogs.slice(0, 100);
  }

  return entry;
}

/**
 * Returns the most recent error log entries.
 */
export function getRecentErrors(limit: number = 100): ErrorLogEntry[] {
  return errorLogs.slice(0, limit);
}

/**
 * Clears all stored error log entries and resets the ID counter.
 */
export function clearAllErrors(): void {
  errorLogs = [];
  nextId = 1;
}

// ---------------------------------------------------------------------------
// Form Error Matching
// ---------------------------------------------------------------------------

/**
 * Maps server error details to form control names using configurable rules.
 * Returns a `Record<controlName, errorMessage>`.
 */
export function matchFormErrors(
  details: Array<{ message?: string; field?: string }>,
  rules: AICFormErrorRule[]
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const detail of details) {
    const msg = detail.message ?? '';

    for (const rule of rules) {
      const regex = new RegExp(rule.pattern, rule.flags ?? 'i');
      if (regex.test(msg)) {
        errors[rule.control] = msg;
        break;
      }
    }

    // Direct field mapping fallback
    if (detail.field && !errors[detail.field]) {
      errors[detail.field] = msg;
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Error Severity Styles
// ---------------------------------------------------------------------------

/**
 * Returns Tailwind CSS class tokens for a given severity level.
 */
export function getErrorSeverityStyles(severity: string): {
  bg: string;
  border: string;
  text: string;
  icon: string;
} {
  switch (severity.toUpperCase()) {
    case 'ERROR':
    case 'CRITICAL':
      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500' };
    case 'WARNING':
      return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-500' };
    case 'INFO':
    case 'SUCCESS':
      return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500' };
    default:
      return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'text-gray-500' };
  }
}
