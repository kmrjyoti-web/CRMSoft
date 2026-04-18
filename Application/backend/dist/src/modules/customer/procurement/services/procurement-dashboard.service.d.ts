import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class ProcurementDashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboard(tenantId: string): Promise<{
        rfq: {
            total: number;
            draft: number;
            sent: number;
            closed: number;
        };
        purchaseOrders: {
            total: number;
            draft: number;
            pendingApproval: number;
            approved: number;
            completed: number;
            totalValue: number;
        };
        goodsReceipts: {
            total: number;
            draft: number;
            accepted: number;
            rejected: number;
        };
        invoices: {
            total: number;
            draft: number;
            pending: number;
            approved: number;
            paid: number;
            totalPayable: number;
        };
        recentPOs: {
            id: string;
            createdAt: Date;
            status: string;
            grandTotal: import("@prisma/working-client/runtime/library").Decimal;
            poNumber: string;
        }[];
        pendingApprovals: {
            purchaseOrders: {
                id: string;
                createdAt: Date;
                grandTotal: import("@prisma/working-client/runtime/library").Decimal;
                poNumber: string;
            }[];
            invoices: {
                id: string;
                createdAt: Date;
                ourReference: string;
                grandTotal: import("@prisma/working-client/runtime/library").Decimal;
            }[];
            totalCount: number;
        };
    }>;
    private getRFQCounts;
    private getPOCounts;
    private getGRNCounts;
    private getInvoiceCounts;
    private getRecentPOs;
    private getPendingApprovals;
}
