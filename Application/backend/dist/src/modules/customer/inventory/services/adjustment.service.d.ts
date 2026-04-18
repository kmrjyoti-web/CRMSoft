import { PrismaService } from '../../../../core/prisma/prisma.service';
import { TransactionService } from './transaction.service';
export declare class AdjustmentService {
    private readonly prisma;
    private readonly transactionService;
    constructor(prisma: PrismaService, transactionService: TransactionService);
    create(tenantId: string, dto: {
        productId: string;
        locationId: string;
        adjustmentType: string;
        quantity: number;
        reason: string;
        createdById: string;
    }): Promise<{
        id: string;
        tenantId: string;
        createdById: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/working-client").$Enums.AdjustmentStatus;
        productId: string;
        locationId: string;
        quantity: number;
        approvedById: string | null;
        reason: string;
        approvedAt: Date | null;
        adjustmentType: string;
    }>;
    approve(tenantId: string, id: string, approvedById: string, action: 'approve' | 'reject'): Promise<{
        id: string;
        tenantId: string;
        createdById: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/working-client").$Enums.AdjustmentStatus;
        productId: string;
        locationId: string;
        quantity: number;
        approvedById: string | null;
        reason: string;
        approvedAt: Date | null;
        adjustmentType: string;
    }>;
    list(tenantId: string, filters?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            id: string;
            tenantId: string;
            createdById: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            status: import("@prisma/working-client").$Enums.AdjustmentStatus;
            productId: string;
            locationId: string;
            quantity: number;
            approvedById: string | null;
            reason: string;
            approvedAt: Date | null;
            adjustmentType: string;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
