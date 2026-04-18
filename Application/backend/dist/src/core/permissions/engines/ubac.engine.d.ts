import { PrismaService } from '../../prisma/prisma.service';
import { PermissionContext } from '../types/permission-context';
export declare class UbacEngine {
    private readonly prisma;
    private userCache;
    private readonly CACHE_TTL;
    constructor(prisma: PrismaService);
    hasExplicitDeny(ctx: PermissionContext): Promise<boolean>;
    hasExplicitGrant(ctx: PermissionContext): Promise<boolean>;
    private matchesAction;
    getUserOverrides(userId: string): Promise<{
        grants: string[];
        denies: string[];
    }>;
    invalidateUser(userId: string): void;
    invalidateAll(): void;
}
