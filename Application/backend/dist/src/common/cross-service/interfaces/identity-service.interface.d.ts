export declare const IDENTITY_SERVICE: unique symbol;
export interface IdentityUser {
    id: string;
    name: string;
    email: string;
    role?: string;
    tenantId?: string;
}
export interface IdentityTenant {
    id: string;
    name: string;
    hasDedicatedDb: boolean;
    databaseUrl?: string;
    packageId?: string;
}
export interface IIdentityService {
    getUserById(userId: string): Promise<IdentityUser | null>;
    getUsersByIds(userIds: string[]): Promise<IdentityUser[]>;
    getTenantById(tenantId: string): Promise<IdentityTenant | null>;
    validateToken(token: string): Promise<{
        userId: string;
        tenantId: string;
        role: string;
    } | null>;
}
