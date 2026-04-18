import { IQueryHandler } from '@nestjs/cqrs';
import { ListTestEnvsQuery } from './list-test-envs.query';
import { ITestEnvRepository } from '../../../infrastructure/repositories/test-env.repository';
export declare class ListTestEnvsHandler implements IQueryHandler<ListTestEnvsQuery> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestEnvRepository);
    execute(query: ListTestEnvsQuery): Promise<any[]>;
}
