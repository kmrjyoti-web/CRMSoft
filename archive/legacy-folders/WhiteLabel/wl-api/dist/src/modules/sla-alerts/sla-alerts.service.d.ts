import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class SlaAlertsService {
    private prisma;
    private audit;
    private readonly logger;
    constructor(prisma: PrismaService, audit: AuditService);
    checkSlaBreaches(): Promise<void>;
    checkUpcomingBreaches(): Promise<void>;
    checkPaymentOverdue(): Promise<void>;
    getAlertHistory(params: {
        page?: number;
        limit?: number;
        alertType?: string;
    }): Promise<{
        data: {
            id: string;
            requestId: string;
            alertType: import("@prisma/client").$Enums.SlaAlertType;
            sentAt: Date;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getDashboard(): Promise<{
        totalBreaches: number;
        warnings24h: number;
        overdueInvoices: number;
        overdueRequests: number;
        upcomingIn24h: number;
        recentAlerts: {
            id: string;
            requestId: string;
            alertType: import("@prisma/client").$Enums.SlaAlertType;
            sentAt: Date;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
    }>;
}
