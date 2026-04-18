import { ICommandHandler } from '@nestjs/cqrs';
import { CleanupTestEnvCommand } from './cleanup-test-env.command';
import { ITestEnvRepository } from '../../../infrastructure/repositories/test-env.repository';
import { DbOperationsService } from '../../../infrastructure/db-operations.service';
export declare class CleanupTestEnvHandler implements ICommandHandler<CleanupTestEnvCommand> {
    private readonly repo;
    private readonly dbOps;
    private readonly logger;
    constructor(repo: ITestEnvRepository, dbOps: DbOperationsService);
    execute(cmd: CleanupTestEnvCommand): Promise<{
        cleaned: boolean;
    }>;
}
