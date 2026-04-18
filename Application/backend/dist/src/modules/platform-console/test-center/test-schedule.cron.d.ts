import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { TestRunnerService } from './test-runner.service';
import { TestCoverageService } from './test-coverage.service';
export declare class TestScheduleCron {
    private readonly db;
    private readonly testRunner;
    private readonly coverageService;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService, testRunner: TestRunnerService, coverageService: TestCoverageService);
    checkSchedules(): Promise<void>;
    nightlyTestRun(): Promise<void>;
    weeklyCoverageRefresh(): Promise<void>;
}
