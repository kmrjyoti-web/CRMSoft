import { ApiResponse } from '../../../../common/utils/api-response';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ReportEngineService } from '../infrastructure/report-engine.service';
import { CustomReportDto, SaveCustomReportDto } from './dto/custom-report.dto';
export declare class CustomReportController {
    private readonly reportEngine;
    private readonly prisma;
    constructor(reportEngine: ReportEngineService, prisma: PrismaService);
    build(dto: CustomReportDto, user: any): Promise<ApiResponse<import("../interfaces").ReportData>>;
    save(dto: SaveCustomReportDto, userId: string): Promise<ApiResponse<{
        reportDef: {
            id: string;
            tenantId: string;
            name: string;
            code: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            category: import("@prisma/working-client").$Enums.ReportCategory;
            sortOrder: number;
            requiredRole: string | null;
            supportsPeriodComparison: boolean;
            supportsDrillDown: boolean;
            defaultFilters: import("@prisma/working-client/runtime/library").JsonValue | null;
            availableFilters: import("@prisma/working-client/runtime/library").JsonValue | null;
            availableFormats: string[];
            requiredFeature: string | null;
            usageCount: number;
            lastGeneratedAt: Date | null;
        };
    } & {
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
        filters: import("@prisma/working-client/runtime/library").JsonValue | null;
        userId: string;
        reportDefId: string;
        isPinned: boolean;
    }>>;
}
