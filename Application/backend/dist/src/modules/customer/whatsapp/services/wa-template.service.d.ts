import { PrismaService } from '../../../../core/prisma/prisma.service';
import { WaApiService } from './wa-api.service';
export declare class WaTemplateService {
    private readonly prisma;
    private readonly waApiService;
    private readonly logger;
    constructor(prisma: PrismaService, waApiService: WaApiService);
    syncFromMeta(wabaId: string): Promise<{
        synced: number;
        added: number;
        updated: number;
    }>;
    createOnMeta(wabaId: string, templateData: {
        name: string;
        language: string;
        category: string;
        headerType?: string;
        headerContent?: string;
        bodyText: string;
        footerText?: string;
        buttons?: Record<string, unknown>;
        variables?: Record<string, unknown>;
        sampleValues?: Record<string, unknown>;
    }): Promise<{
        id: string;
        tenantId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: import("@prisma/working-client").$Enums.WaTemplateCategory;
        status: import("@prisma/working-client").$Enums.WaTemplateStatus;
        language: string;
        variables: import("@prisma/working-client/runtime/library").JsonValue | null;
        wabaId: string;
        bodyText: string;
        sentCount: number;
        deliveredCount: number;
        repliedCount: number;
        metaTemplateId: string | null;
        headerType: string | null;
        headerContent: string | null;
        footerText: string | null;
        buttons: import("@prisma/working-client/runtime/library").JsonValue | null;
        sampleValues: import("@prisma/working-client/runtime/library").JsonValue | null;
        readCount: number;
        lastSyncedAt: Date | null;
        rejectionReason: string | null;
    }>;
    deleteOnMeta(templateId: string): Promise<void>;
    private mapCategory;
    private mapStatus;
}
