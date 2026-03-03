import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetReportExportsQuery } from './get-report-exports.query';
import { ReportExportService } from '../../../services/report-export.service';

@QueryHandler(GetReportExportsQuery)
export class GetReportExportsHandler implements IQueryHandler<GetReportExportsQuery> {
  constructor(private readonly reportExportService: ReportExportService) {}

  async execute(query: GetReportExportsQuery) {
    return this.reportExportService.getExportHistory(query.userId, query.page, query.limit);
  }
}
