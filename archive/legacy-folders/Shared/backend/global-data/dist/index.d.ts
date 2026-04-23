export { INDIAN_STATES } from './indian-states';
export type { IndianStateCode } from './indian-states';
export { UserRole, EntityType, Status } from './enums';
export type { ApiResponse, PaginationMeta, ApiError } from './api-response.types';
/** Standard Indian currency formatter */
export declare function formatINR(amount: number): string;
/** Standard pagination defaults */
export declare const PAGINATION_DEFAULTS: {
    readonly page: 1;
    readonly limit: 20;
    readonly maxLimit: 100;
};
/** GST rates */
export declare const GST_RATES: {
    readonly NONE: 0;
    readonly REDUCED: 5;
    readonly STANDARD: 12;
    readonly DEFAULT: 18;
    readonly LUXURY: 28;
};
//# sourceMappingURL=index.d.ts.map