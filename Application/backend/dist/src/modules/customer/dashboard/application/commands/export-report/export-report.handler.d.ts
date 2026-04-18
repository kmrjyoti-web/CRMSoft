import { ICommandHandler } from '@nestjs/cqrs';
import { ExportReportCommand } from './export-report.command';
import { ReportExportService } from '../../../services/report-export.service';
export declare class ExportReportHandler implements ICommandHandler<ExportReportCommand> {
    private readonly reportExportService;
    private readonly logger;
    constructor(reportExportService: ReportExportService);
    execute(command: ExportReportCommand): Promise<{
        fileUrl: string;
        recordCount: number;
        fileSize: number;
        duration: number;
    }>;
}
