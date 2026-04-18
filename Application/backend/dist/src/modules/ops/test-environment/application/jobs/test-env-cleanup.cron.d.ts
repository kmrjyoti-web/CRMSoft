import { ITestEnvRepository } from '../../infrastructure/repositories/test-env.repository';
import { DbOperationsService } from '../../infrastructure/db-operations.service';
export declare class TestEnvCleanupCron {
    private readonly repo;
    private readonly dbOps;
    private readonly logger;
    constructor(repo: ITestEnvRepository, dbOps: DbOperationsService);
    cleanupExpiredEnvironments(): Promise<void>;
}
