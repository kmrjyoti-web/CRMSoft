import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetReportExportsQuery } from './get-report-exports.query';
import { ReportExportService } from '../../../services/report-export.service';

@QueryHandler(GetReportExportsQuery)
export class GetReportExportsHandler implements IQueryHandler<GetReportExportsQuery> {
    private readonly logger = new Logger(GetReportExportsHandler.name);

  constructor(private readonly reportExportService: ReportExportService) {}

  async execute(query: GetReportExportsQuery) {
    try {
      return this.reportExportService.getExportHistory(query.userId, query.page, query.limit);
    } catch (error) {
      this.logger.error(`GetReportExportsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
