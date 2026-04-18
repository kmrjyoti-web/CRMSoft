import { IQueryHandler } from '@nestjs/cqrs';
import { ListManualTestLogsQuery } from './list-manual-test-logs.query';
import { IManualTestLogRepository } from '../../../infrastructure/repositories/manual-test-log.repository';
export declare class ListManualTestLogsHandler implements IQueryHandler<ListManualTestLogsQuery> {
    private readonly repo;
    private readonly logger;
    constructor(repo: IManualTestLogRepository);
    execute(query: ListManualTestLogsQuery): Promise<Record<string, unknown>[]>;
}
