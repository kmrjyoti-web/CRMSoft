import { IQueryHandler } from '@nestjs/cqrs';
import { GetReportExportsQuery } from './get-report-exports.query';
import { ReportExportService } from '../../../services/report-export.service';
export declare class GetReportExportsHandler implements IQueryHandler<GetReportExportsQuery> {
    private readonly reportExportService;
    private readonly logger;
    constructor(reportExportService: ReportExportService);
    execute(query: GetReportExportsQuery): Promise<{
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
