import { IQueryHandler } from '@nestjs/cqrs';
import { GetTestEnvQuery } from './get-test-env.query';
import { ITestEnvRepository } from '../../../infrastructure/repositories/test-env.repository';
export declare class GetTestEnvHandler implements IQueryHandler<GetTestEnvQuery> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestEnvRepository);
    execute(query: GetTestEnvQuery): Promise<any>;
}
