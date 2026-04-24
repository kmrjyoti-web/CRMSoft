export { INDIAN_STATES } from './indian-states';
export type { IndianStateCode } from './indian-states';
export { UserRole, EntityType, Status } from './enums';
export type { ApiResponse, PaginationMeta, ApiError } from './api-response.types';

/** Standard Indian currency formatter */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Standard pagination defaults */
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

/** GST rates */
export const GST_RATES = {
  NONE: 0,
  REDUCED: 5,
  STANDARD: 12,
  DEFAULT: 18,
  LUXURY: 28,
} as const;
