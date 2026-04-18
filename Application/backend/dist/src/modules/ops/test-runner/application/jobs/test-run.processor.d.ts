import { Job } from 'bull';
import { PrismaService } from "../../../../../core/prisma/prisma.service";
import { TestOrchestratorService } from '../services/test-orchestrator.service';
export declare const TEST_RUNNER_QUEUE = "ops-test-runner";
export interface TestRunJobData {
    testRunId: string;
}
export declare class TestRunProcessor {
    private readonly orchestrator;
    private readonly prisma;
    private readonly logger;
    constructor(orchestrator: TestOrchestratorService, prisma: PrismaService);
    handleRunTests(job: Job<TestRunJobData>): Promise<void>;
}
