import { IQueryHandler } from '@nestjs/cqrs';
import { ResultReportService } from '../../../services/result-report.service';
import { GetJobResultQuery } from './get-job-result.query';
export declare class GetJobResultHandler implements IQueryHandler<GetJobResultQuery> {
    private readonly reportService;
    private readonly logger;
    constructor(reportService: ResultReportService);
    execute(query: GetJobResultQuery): Promise<import("../../../services/result-report.service").ResultSummary>;
}
