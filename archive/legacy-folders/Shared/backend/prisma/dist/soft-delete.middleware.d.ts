/**
 * Prisma middleware that auto-adds `isDeleted: false` to read queries.
 * Pass the set of model names to filter.
 */
export declare function createSoftDeleteMiddleware(models: Set<string>): (params: any, next: any) => Promise<any>;
/** Default soft-deletable model names used in CRMSoft working DB */
export declare const DEFAULT_SOFT_DELETE_MODELS: Set<string>;
//# sourceMappingURL=soft-delete.middleware.d.ts.map