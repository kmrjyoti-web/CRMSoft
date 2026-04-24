import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(params: {
        partnerId?: string;
        action: string;
        performedBy: string;
        performedByRole: string;
        details?: any;
        ipAddress?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        partnerId: string | null;
        action: string;
        performedBy: string;
        performedByRole: string;
        details: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    getPartnerLogs(partnerId: string, page?: number, limit?: number): Promise<{
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
    getAllLogs(page?: number, limit?: number): Promise<{
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
