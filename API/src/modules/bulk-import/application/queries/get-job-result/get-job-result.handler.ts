import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ResultReportService } from '../../../services/result-report.service';
import { GetJobResultQuery } from './get-job-result.query';

@QueryHandler(GetJobResultQuery)
export class GetJobResultHandler implements IQueryHandler<GetJobResultQuery> {
  constructor(private readonly reportService: ResultReportService) {}

  async execute(query: GetJobResultQuery) {
    return this.reportService.getResultSummary(query.jobId);
  }
}
