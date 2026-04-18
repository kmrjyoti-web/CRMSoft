import { IQueryHandler } from '@nestjs/cqrs';
import { GetManualTestLogQuery } from './get-manual-test-log.query';
import { IManualTestLogRepository } from '../../../infrastructure/repositories/manual-test-log.repository';
export declare class GetManualTestLogHandler implements IQueryHandler<GetManualTestLogQuery> {
    private readonly repo;
    private readonly logger;
    constructor(repo: IManualTestLogRepository);
    execute(query: GetManualTestLogQuery): Promise<Record<string, unknown>>;
}
