import { PrismaService } from "../../../../../core/prisma/prisma.service";
import { TestType } from '@prisma/platform-client';
import { UnitTestRunner } from '../../infrastructure/runners/unit-test.runner';
import { FunctionalTestRunner } from '../../infrastructure/runners/functional-test.runner';
import { SmokeTestRunner } from '../../infrastructure/runners/smoke-test.runner';
import { ArchitectureTestRunner } from '../../infrastructure/runners/architecture-test.runner';
import { PenetrationTestRunner } from '../../infrastructure/runners/penetration-test.runner';
import { IntegrationTestRunner } from '../../infrastructure/runners/integration-test.runner';
import type { TestRunConfig } from '../../infrastructure/runners/test-runner.interface';
export declare class TestOrchestratorService {
    private readonly prisma;
    private readonly unitRunner;
    private readonly functionalRunner;
    private readonly smokeRunner;
    private readonly architectureRunner;
    private readonly penetrationRunner;
    private readonly integrationRunner;
    private readonly logger;
    private readonly runners;
    constructor(prisma: PrismaService, unitRunner: UnitTestRunner, functionalRunner: FunctionalTestRunner, smokeRunner: SmokeTestRunner, architectureRunner: ArchitectureTestRunner, penetrationRunner: PenetrationTestRunner, integrationRunner: IntegrationTestRunner);
    runAll(testRunId: string, testTypes: TestType[], config: TestRunConfig): Promise<void>;
}
