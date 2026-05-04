// Types
export type {
  AICErrorScope,
  AICErrorSource,
  AICErrorSeverity,
  AICServerErrorDetail,
  AICApiResponse,
  ApiError,
  AICErrorGlobalConfig,
  AICFormErrorRule,
  AICFormErrorConfig,
  AICComponentErrorConfig,
  ErrorLogEntry,
  ErrorContext,
  EnvironmentInfo,
  AICErrorDashboardProps,
  AICErrorBoundaryProps,
} from "./aic-error.types";

export { DEFAULT_ERROR_CONFIG } from "./aic-error.types";

// Logic
export {
  normalizeToApiError,
  isApiError,
  isSuccessLikeError,
  collectEnvironmentInfo,
  logError,
  getRecentErrors,
  clearAllErrors,
  matchFormErrors,
  getErrorSeverityStyles,
} from "./aic-error.logic";
