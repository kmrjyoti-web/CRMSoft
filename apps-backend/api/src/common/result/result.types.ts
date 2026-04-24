/**
 * Shape of the error carried inside Result.fail().
 * Mirrors the ErrorCodeDefinition but is self-contained
 * so Result can be used without importing the error-codes registry.
 */
export interface ResultError {
  code: string;
  message: string;
  httpStatus: number;
  suggestion: string;
  details?: Record<string, unknown>;
  interpolated?: Record<string, any>;
}
