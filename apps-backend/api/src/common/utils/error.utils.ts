/**
 * Safely extract a string message from an unknown error value.
 * Use inside catch blocks to avoid TS18046 errors under strict mode.
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return String(err);
}
