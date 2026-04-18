import { PrismaService } from '../../../core/prisma/prisma.service';
import { IIdentityService, IdentityUser, IdentityTenant } from '../interfaces/identity-service.interface';
export declare class IdentityServiceMonolith implements IIdentityService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUserById(userId: string): Promise<IdentityUser | null>;
    getUsersByIds(userIds: string[]): Promise<IdentityUser[]>;
    getTenantById(tenantId: string): Promise<IdentityTenant | null>;
    validateToken(_token: string): Promise<{
        userId: string;
        tenantId: string;
        role: string;
    } | null>;
}
