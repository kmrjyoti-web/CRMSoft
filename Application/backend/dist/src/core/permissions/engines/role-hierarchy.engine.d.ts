import { PrismaService } from '../../prisma/prisma.service';
import { PermissionContext } from '../types/permission-context';
export interface RoleLevelInfo {
    id: string;
    name: string;
    level: number;
    canManageLevels: number[];
}
export declare class RoleHierarchyEngine {
    private readonly prisma;
    private roleMap;
    private cacheLoadedAt;
    private readonly CACHE_TTL;
    constructor(prisma: PrismaService);
    check(ctx: PermissionContext, targetRoleLevel?: number): Promise<boolean>;
    getEffectivePermissions(userId: string): Promise<string[]>;
    canManageUser(managerUserId: string, targetUserId: string): Promise<boolean>;
    getRoleInfo(roleId: string): Promise<RoleLevelInfo | null>;
    private ensureCacheLoaded;
    getAllPermissionCodes(): Promise<string[]>;
    invalidateAll(): void;
}
