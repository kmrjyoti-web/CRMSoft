import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class TDSService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, filters?: {
        section?: string;
        financialYear?: string;
        quarter?: string;
        status?: string;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: string;
        invoiceId: string | null;
        section: string;
        tdsRate: import("@prisma/working-client/runtime/library").Decimal;
        tdsAmount: import("@prisma/working-client/runtime/library").Decimal;
        sectionName: string | null;
        deducteeId: string;
        deducteeName: string;
        deducteePan: string | null;
        paymentRecordId: string | null;
        grossAmount: import("@prisma/working-client/runtime/library").Decimal;
        netAmount: import("@prisma/working-client/runtime/library").Decimal;
        deductionDate: Date;
        depositDate: Date | null;
        challanNumber: string | null;
        quarter: string | null;
        financialYear: string;
    }[]>;
    markDeposited(tenantId: string, id: string, depositDate: string, challanNumber?: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: string;
        invoiceId: string | null;
        section: string;
        tdsRate: import("@prisma/working-client/runtime/library").Decimal;
        tdsAmount: import("@prisma/working-client/runtime/library").Decimal;
        sectionName: string | null;
        deducteeId: string;
        deducteeName: string;
        deducteePan: string | null;
        paymentRecordId: string | null;
        grossAmount: import("@prisma/working-client/runtime/library").Decimal;
        netAmount: import("@prisma/working-client/runtime/library").Decimal;
        deductionDate: Date;
        depositDate: Date | null;
        challanNumber: string | null;
        quarter: string | null;
        financialYear: string;
    }>;
    getSummary(tenantId: string, financialYear?: string): Promise<{
        financialYear: string;
        totalRecords: number;
        totalDeducted: number;
        totalDeposited: number;
        pendingDeposit: number;
        bySection: {
            section: string;
            sectionName: string;
            count: number;
            totalDeducted: number;
            totalDeposited: number;
        }[];
        byQuarter: {
            quarter: string;
            count: number;
            total: number;
            deposited: number;
        }[];
    }>;
    private getCurrentFY;
}
