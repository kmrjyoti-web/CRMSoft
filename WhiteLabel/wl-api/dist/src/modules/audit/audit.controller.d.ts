import { AuditService } from './audit.service';
export declare class AuditController {
    private auditService;
    constructor(auditService: AuditService);
    getAllLogs(page?: string, limit?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            partnerId: string | null;
            action: string;
            performedBy: string;
            performedByRole: string;
            details: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPartnerLogs(partnerId: string, page?: string, limit?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            partnerId: string | null;
            action: string;
            performedBy: string;
            performedByRole: string;
            details: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
