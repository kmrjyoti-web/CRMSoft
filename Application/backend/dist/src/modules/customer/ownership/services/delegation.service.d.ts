import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class DelegationService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    delegate(params: {
        fromUserId: string;
        toUserId: string;
        entityType?: string;
        startDate: Date;
        endDate: Date;
        reason: string;
        delegatedById: string;
    }): Promise<{
        entitiesDelegated: number;
        id: string;
        tenantId: string;
        entityType: import("@prisma/identity-client").$Enums.EntityType | null;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        reason: string;
        startDate: Date;
        endDate: Date;
        fromUserId: string;
        toUserId: string;
        isReverted: boolean;
        revertedAt: Date | null;
    }>;
    revertDelegation(delegationId: string, revertedById: string): Promise<{
        reverted: number;
    }>;
    getDelegationStatus(params: {
        userId?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        tenantId: string;
        entityType: import("@prisma/identity-client").$Enums.EntityType | null;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        reason: string;
        startDate: Date;
        endDate: Date;
        fromUserId: string;
        toUserId: string;
        isReverted: boolean;
        revertedAt: Date | null;
    }[]>;
}
