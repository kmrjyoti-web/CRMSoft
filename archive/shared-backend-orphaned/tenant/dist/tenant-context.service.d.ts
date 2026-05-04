export interface TenantStore {
    tenantId: string;
    isSuperAdmin?: boolean;
}
export declare class TenantContextService {
    private readonly als;
    run<T>(store: TenantStore, callback: () => T): T;
    getTenantId(): string | undefined;
    isSuperAdmin(): boolean;
    requireTenantId(): string;
}
//# sourceMappingURL=tenant-context.service.d.ts.map