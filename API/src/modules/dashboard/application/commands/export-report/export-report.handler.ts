import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExportReportCommand } from './export-report.command';
import { ReportExportService } from '../../../services/report-export.service';

@CommandHandler(ExportReportCommand)
export class ExportReportHandler implements ICommandHandler<ExportReportCommand> {
  constructor(private readonly reportExportService: ReportExportService) {}

  async execute(command: ExportReportCommand) {
    return this.reportExportService.exportReport({
      reportType: command.reportType,
      format: command.format,
      filters: command.filters,
      exportedById: command.exportedById,
      exportedByName: command.exportedByName,
    });
  }
}
