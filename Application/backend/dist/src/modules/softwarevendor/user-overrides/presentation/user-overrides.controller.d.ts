import { PrismaService } from '../../../../core/prisma/prisma.service';
import { UbacEngine } from '../../../../core/permissions/engines/ubac.engine';
import { ApiResponse } from '../../../../common/utils/api-response';
import { GrantPermissionDto, DenyPermissionDto } from './dto/user-override.dto';
export declare class UserOverridesController {
    private readonly prisma;
    private readonly ubacEngine;
    constructor(prisma: PrismaService, ubacEngine: UbacEngine);
    grant(userId: string, dto: GrantPermissionDto, createdBy: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        createdBy: string | null;
        action: string;
        userId: string;
        expiresAt: Date | null;
        effect: string;
        reason: string | null;
    }>>;
    deny(userId: string, dto: DenyPermissionDto, createdBy: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        createdBy: string | null;
        action: string;
        userId: string;
        expiresAt: Date | null;
        effect: string;
        reason: string | null;
    }>>;
    revoke(userId: string, action: string): Promise<ApiResponse<{
        removed: number;
    }>>;
    getOverrides(userId: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        createdBy: string | null;
        action: string;
        userId: string;
        expiresAt: Date | null;
        effect: string;
        reason: string | null;
    }[]>>;
    listAll(): Promise<ApiResponse<({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        createdBy: string | null;
        action: string;
        userId: string;
        expiresAt: Date | null;
        effect: string;
        reason: string | null;
    })[]>>;
}
