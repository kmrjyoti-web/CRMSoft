import { Job } from 'bull';
import { DbOperationsService } from '../../infrastructure/db-operations.service';
import { ITestEnvRepository } from '../../infrastructure/repositories/test-env.repository';
export interface CreateTestEnvJobData {
    testEnvId: string;
}
export declare class TestEnvProcessor {
    private readonly dbOps;
    private readonly repo;
    private readonly logger;
    constructor(dbOps: DbOperationsService, repo: ITestEnvRepository);
    handleCreate(job: Job<CreateTestEnvJobData>): Promise<void>;
    private handleSeedData;
    private handleLiveClone;
    private handleBackupRestore;
    private updateStatus;
}
