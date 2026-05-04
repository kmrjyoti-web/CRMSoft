import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ResultReportService } from '../../../services/result-report.service';
import { GetJobResultQuery } from './get-job-result.query';

@QueryHandler(GetJobResultQuery)
export class GetJobResultHandler implements IQueryHandler<GetJobResultQuery> {
    private readonly logger = new Logger(GetJobResultHandler.name);

  constructor(private readonly reportService: ResultReportService) {}

  async execute(query: GetJobResultQuery) {
    try {
      return this.reportService.getResultSummary(query.jobId);
    } catch (error) {
      this.logger.error(`GetJobResultHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
