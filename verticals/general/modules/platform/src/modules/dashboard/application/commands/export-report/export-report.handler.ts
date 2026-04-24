import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ExportReportCommand } from './export-report.command';
import { ReportExportService } from '../../../services/report-export.service';

@CommandHandler(ExportReportCommand)
export class ExportReportHandler implements ICommandHandler<ExportReportCommand> {
    private readonly logger = new Logger(ExportReportHandler.name);

  constructor(private readonly reportExportService: ReportExportService) {}

  async execute(command: ExportReportCommand) {
    try {
      return this.reportExportService.exportReport({
        reportType: command.reportType,
        format: command.format,
        filters: command.filters,
        exportedById: command.exportedById,
        exportedByName: command.exportedByName,
      });
    } catch (error) {
      this.logger.error(`ExportReportHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
