import { Job } from 'bull';
import { PrismaService } from "../../../../../core/prisma/prisma.service";
import { TestGroupRunnerService } from '../services/test-group-runner.service';
export declare const TEST_GROUP_QUEUE = "ops-test-groups";
export interface TestGroupJobData {
    executionId: string;
}
export declare class TestGroupProcessor {
    private readonly runner;
    private readonly prisma;
    private readonly logger;
    constructor(runner: TestGroupRunnerService, prisma: PrismaService);
    handleRunTestGroup(job: Job<TestGroupJobData>): Promise<void>;
}
