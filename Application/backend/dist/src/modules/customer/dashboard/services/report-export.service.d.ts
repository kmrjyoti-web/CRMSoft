import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class ReportExportService {
    private readonly prisma;
    private readonly logger;
    private readonly exportDir;
    constructor(prisma: PrismaService);
    exportReport(params: {
        reportType: string;
        format: string;
        filters: {
            dateFrom?: Date;
            dateTo?: Date;
            userId?: string;
            status?: string;
        };
        exportedById: string;
        exportedByName: string;
    }): Promise<{
        fileUrl: string;
        recordCount: number;
        fileSize: number;
        duration: number;
    }>;
    private queryReportData;
    private generateExcel;
    private generateCsv;
    getExportHistory(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            tenantId: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            status: string;
            filters: import("@prisma/working-client/runtime/library").JsonValue | null;
            duration: number | null;
            errorMessage: string | null;
            format: import("@prisma/working-client").$Enums.ReportFormat;
            reportType: import("@prisma/working-client").$Enums.ReportType;
            recordCount: number;
            fileUrl: string | null;
            fileSize: number | null;
            generatedAt: Date;
            exportedById: string;
            exportedByName: string;
            reportCode: string | null;
            reportName: string | null;
            exportSource: string | null;
            scheduledReportId: string | null;
            generationTimeMs: number | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
