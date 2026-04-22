import toast from "react-hot-toast";

// ── Types matching backend ApiStandardResponse.error ──────────────

export interface ApiFieldError {
  field: string;
  message: string;
  type?: string;
  value?: unknown;
}

export interface ApiDuplicateInfo {
  field: string;
  value: string;
  existingEntityId: string;
  existingEntityName: string;
  existingEntityType: string;
  allowForceCreate: boolean;
}

export type ErrorLevel = "VALIDATION" | "WARNING" | "ERROR" | "CRITICAL" | "AUTH";

export interface ParsedApiError {
  /** Error level determines which UI treatment to show */
  level: ErrorLevel;
  /** HTTP status code */
  statusCode: number;
  /** Error code from backend catalog, e.g. "VALIDATION_ERROR", "DUPLICATE_ENTRY" */
  code: string;
  /** Human-readable summary */
  message: string;
  /** Actionable suggestion */
  suggestion?: string;
  /** Help URL (e.g. "/accounts/ledger-master") */
  helpUrl?: string;
  /** Field-level errors for form highlighting */
  fieldErrors: ApiFieldError[];
  /** Duplicate record info (for 409 responses) */
  duplicate?: ApiDuplicateInfo;
  /** Error ID for critical errors (for reporting) */
  errorId?: string;
  /** Stack trace (dev only) */
  stackTrace?: string;
  /** Whether the operation can be retried */
  isRetryable: boolean;
  /** Raw API response for technical details */
  raw?: unknown;
}

// ── Parser ────────────────────────────────────────────────────────

/**
 * Parse any Axios/fetch error into a structured ParsedApiError.
 * Works with the backend's ApiStandardResponse format.
 */
export function parseApiError(error: unknown): ParsedApiError {
  const axiosErr = error as any;
  const response = axiosErr?.response;
  const status: number = response?.status ?? axiosErr?.status ?? 0;
  const data = response?.data ?? axiosErr?.data;
  const apiError = data?.error;

  // Determine level from status + backend error structure
  let level: ErrorLevel = "ERROR";
  if (status === 401 || status === 403) level = "AUTH";
  else if (status === 409) level = "WARNING";
  else if (status === 422 || (apiError?.code === "VALIDATION_ERROR")) level = "VALIDATION";
  else if (status >= 500) level = "CRITICAL";

  // Parse field errors from backend details array
  const fieldErrors: ApiFieldError[] = [];
  if (Array.isArray(apiError?.details)) {
    for (const d of apiError.details) {
      fieldErrors.push({
        field: d.field ?? "unknown",
        message: d.message ?? "Invalid value",
        type: d.type,
        value: d.value,
      });
    }
  }
  // Also support flat fieldErrors array
  if (Array.isArray(apiError?.fieldErrors)) {
    for (const fe of apiError.fieldErrors) {
      if (!fieldErrors.some((e) => e.field === fe.field)) {
        fieldErrors.push(fe);
      }
    }
  }

  // Parse duplicate info
  const duplicate: ApiDuplicateInfo | undefined = apiError?.duplicate;

  return {
    level,
    statusCode: status,
    code: apiError?.code ?? (status ? `HTTP_${status}` : "NETWORK_ERROR"),
    message: data?.message ?? apiError?.message ?? (error as Error)?.message ?? "Something went wrong",
    suggestion: apiError?.suggestion,
    helpUrl: apiError?.helpUrl,
    fieldErrors,
    duplicate,
    errorId: data?.requestId ?? apiError?.critical?.errorId,
    stackTrace: apiError?.critical?.stackTrace,
    isRetryable: apiError?.isRetryable ?? false,
    raw: data,
  };
}

// ── Handler (for MutationCache / standalone use) ──────────────────

/** Global error event — components can subscribe to show error modals */
type ErrorListener = (error: ParsedApiError) => void;
let _errorListener: ErrorListener | null = null;

/** Register a global listener for API errors (called by ErrorDetailModal provider) */
export function onApiError(listener: ErrorListener) {
  _errorListener = listener;
  return () => { _errorListener = null; };
}

/**
 * Centralized API error handler.
 * 1. Parses the error into a structured format
 * 2. Shows a short toast
 * 3. Emits to the global error listener (for modal display)
 * 4. Handles auth redirects
 */
export function handleApiError(
  error: unknown,
  options?: {
    /** react-hook-form setError for field-level validation */
    setFieldError?: (field: string, error: { message: string }) => void;
    /** Suppress toast + modal (caller handles UI) */
    silent?: boolean;
  },
) {
  const parsed = parseApiError(error);

  // AUTH: redirect immediately
  if (parsed.level === "AUTH") {
    if (parsed.statusCode === 401) {
      toast.error("Session expired — please login again");
      window.location.href = "/login";
    } else {
      toast.error("Permission denied");
    }
    return parsed;
  }

  // Set field errors on react-hook-form if available
  if (parsed.fieldErrors.length > 0 && options?.setFieldError) {
    for (const fe of parsed.fieldErrors) {
      if (fe.field !== "unknown") {
        options.setFieldError(fe.field, { message: fe.message });
      }
    }
  }

  if (options?.silent) return parsed;

  // Show short toast with summary
  const detailCount = parsed.fieldErrors.length;
  const toastMsg = detailCount > 1
    ? `${parsed.message} (${detailCount} issues)`
    : parsed.message;

  if (parsed.level === "CRITICAL") {
    toast.error(toastMsg, { duration: 6000 });
  } else if (parsed.level === "WARNING") {
    toast.error(toastMsg, { duration: 5000 });
  } else {
    toast.error(toastMsg, { duration: 4000 });
  }

  // Emit to global listener (shows error modal if mounted)
  if (_errorListener) {
    _errorListener(parsed);
  }

  return parsed;
}
