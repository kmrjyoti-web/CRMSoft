import { Queue } from 'bull';
import { IScheduledTestRepository } from '../../infrastructure/repositories/scheduled-test.repository';
import { IScheduledTestRunRepository } from '../../infrastructure/repositories/scheduled-test-run.repository';
export declare class ScheduledTestCron {
    private readonly testRepo;
    private readonly runRepo;
    private readonly queue;
    private readonly logger;
    constructor(testRepo: IScheduledTestRepository, runRepo: IScheduledTestRunRepository, queue: Queue);
    dispatchDueTests(): Promise<void>;
}
