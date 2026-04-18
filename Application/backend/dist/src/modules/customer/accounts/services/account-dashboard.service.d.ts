import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class AccountDashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboard(tenantId: string): Promise<{
        totalReceivable: number;
        totalPayable: number;
        cashAndBank: number;
        cashBalance: number;
        bankBalance: number;
        gstDue: number;
        pendingApprovals: number;
        recentPayments: {
            id: string;
            tenantId: string;
            entityType: string;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            status: string;
            currency: string;
            entityName: string | null;
            referenceType: string | null;
            referenceId: string | null;
            amount: import("@prisma/working-client/runtime/library").Decimal;
            entityId: string;
            approvedById: string | null;
            paymentNumber: string;
            paymentType: string;
            paymentMode: string;
            bankAccountId: string | null;
            chequeNumber: string | null;
            chequeDate: Date | null;
            transactionRef: string | null;
            upiId: string | null;
            tdsApplicable: boolean;
            tdsRate: import("@prisma/working-client/runtime/library").Decimal | null;
            tdsAmount: import("@prisma/working-client/runtime/library").Decimal | null;
            tdsSection: string | null;
            paymentDate: Date;
            narration: string | null;
            workflowInstanceId: string | null;
            accountTransactionId: string | null;
        }[];
        monthlyData: {
            month: string;
            revenue: number;
            expenses: number;
        }[];
        receivableCount: number;
        payableCount: number;
    }>;
}
