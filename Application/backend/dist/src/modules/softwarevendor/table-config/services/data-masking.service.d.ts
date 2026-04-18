import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CrossDbResolverService } from '../../../../core/prisma/cross-db-resolver.service';
export interface MaskingRule {
    columnId: string;
    maskType: 'FULL' | 'PARTIAL';
    canUnmask: boolean;
}
export declare class DataMaskingService {
    private readonly prisma;
    private readonly resolver;
    private readonly logger;
    constructor(prisma: PrismaService, resolver: CrossDbResolverService);
    getMaskingRules(tableKey: string, userId: string, roleId: string, tenantId: string): Promise<MaskingRule[]>;
    applyMasking(records: Record<string, any>[], rules: MaskingRule[]): Record<string, any>[];
    private maskValue;
    getUnmaskedValue(tableKey: string, columnId: string, recordId: string, userId: string, tenantId: string): Promise<string | null>;
    listPolicies(tenantId: string, tableKey?: string): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        roleId: string | null;
        userId: string | null;
        tableKey: string;
        columnId: string;
        maskType: string;
        canUnmask: boolean;
    }[]>;
    createPolicy(tenantId: string, data: {
        tableKey: string;
        columnId: string;
        roleId?: string;
        userId?: string;
        maskType: string;
        canUnmask?: boolean;
    }): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        roleId: string | null;
        userId: string | null;
        tableKey: string;
        columnId: string;
        maskType: string;
        canUnmask: boolean;
    }>;
    updatePolicy(id: string, data: {
        maskType?: string;
        canUnmask?: boolean;
        isActive?: boolean;
    }): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        roleId: string | null;
        userId: string | null;
        tableKey: string;
        columnId: string;
        maskType: string;
        canUnmask: boolean;
    }>;
    deletePolicy(id: string): Promise<{
        deleted: boolean;
    }>;
}
