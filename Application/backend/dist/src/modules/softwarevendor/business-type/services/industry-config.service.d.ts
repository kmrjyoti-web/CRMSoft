import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class IndustryConfigService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getTenantWithBt;
    getConfig(tenantId: string): Promise<{
        typeCode: string;
        typeName: string;
        industryCategory: import("@prisma/platform-client").$Enums.IndustryCategory;
        icon: string | null;
        colorTheme: string | null;
        extraFields: string | number | boolean | import("@prisma/platform-client/runtime/library").JsonObject | import("@prisma/platform-client/runtime/library").JsonArray;
        defaultLeadStages: import("@prisma/platform-client/runtime/library").JsonValue;
        defaultActivityTypes: import("@prisma/platform-client/runtime/library").JsonValue;
        dashboardWidgets: string | number | boolean | import("@prisma/platform-client/runtime/library").JsonObject | import("@prisma/platform-client/runtime/library").JsonArray;
    } | null>;
    getExtraFields(tenantId: string, entity: string): Promise<unknown[]>;
    getLeadStages(tenantId: string): Promise<string[]>;
    getActivityTypes(tenantId: string): Promise<string[]>;
}
