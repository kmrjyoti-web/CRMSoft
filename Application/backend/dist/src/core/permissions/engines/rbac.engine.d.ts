import { PrismaService } from '../../prisma/prisma.service';
import { PermissionContext } from '../types/permission-context';
export declare class RbacEngine {
    private readonly prisma;
    private roleCache;
    private readonly CACHE_TTL;
    constructor(prisma: PrismaService);
    check(ctx: PermissionContext): Promise<boolean>;
    matchesPermission(action: string, permission: string): boolean;
    matchesAny(action: string, permissions: string[]): boolean;
    getRolePermissions(roleId: string): Promise<string[]>;
    invalidateRole(roleId: string): void;
    invalidateAll(): void;
}
