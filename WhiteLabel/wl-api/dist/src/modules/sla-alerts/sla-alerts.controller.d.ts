import { SlaAlertsService } from './sla-alerts.service';
export declare class SlaAlertsController {
    private slaAlertsService;
    constructor(slaAlertsService: SlaAlertsService);
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
    getAlertHistory(page?: string, limit?: string, alertType?: string): Promise<{
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
    runBreachCheck(): Promise<{
        triggered: boolean;
    }>;
    runOverdueCheck(): Promise<{
        triggered: boolean;
    }>;
}
