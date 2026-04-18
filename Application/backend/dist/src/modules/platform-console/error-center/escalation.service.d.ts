import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
export declare class EscalationService {
    private readonly db;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService);
    submitCustomerReport(dto: {
        brandId: string;
        tenantId?: string;
        reportedBy: string;
        title: string;
        description: string;
        errorCode?: string;
        screenshots?: string[];
        browserInfo?: Record<string, unknown>;
        lastActions?: string[];
    }): Promise<{
        id: string;
        tenantId: string | null;
        description: string;
        createdAt: Date;
        status: string;
        brandId: string;
        title: string;
        errorCode: string | null;
        resolvedAt: Date | null;
        screenshots: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        escalatedAt: Date | null;
        browserInfo: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        lastActions: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        reportedBy: string;
    }>;
    escalateToBrand(reportId: string): Promise<void>;
    escalateToDeveloper(reportId: string, brandNotes: string): Promise<void>;
    resolveError(reportId: string, resolution: string, resolvedBy: string): Promise<void>;
    autoEscalate(reportId: string, reason: string): Promise<void>;
    checkThresholdRules(): Promise<void>;
}
