import { IQueryHandler } from '@nestjs/cqrs';
import { GetManualTestSummaryQuery } from './get-manual-test-summary.query';
import { IManualTestLogRepository } from '../../../infrastructure/repositories/manual-test-log.repository';
export declare class GetManualTestSummaryHandler implements IQueryHandler<GetManualTestSummaryQuery> {
    private readonly repo;
    private readonly logger;
    constructor(repo: IManualTestLogRepository);
    execute(query: GetManualTestSummaryQuery): Promise<Record<string, unknown>>;
}
