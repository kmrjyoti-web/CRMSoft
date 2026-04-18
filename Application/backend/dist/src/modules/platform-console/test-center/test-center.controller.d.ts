import { TestCenterService } from './test-center.service';
import { TestRunnerService } from './test-runner.service';
import { TestCoverageService } from './test-coverage.service';
import { CreateTestPlanDto } from './dto/create-test-plan.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { RunTestsDto } from './dto/run-tests.dto';
export declare class TestCenterController {
    private readonly testCenterService;
    private readonly testRunnerService;
    private readonly testCoverageService;
    private readonly logger;
    constructor(testCenterService: TestCenterService, testRunnerService: TestRunnerService, testCoverageService: TestCoverageService);
    getStats(): Promise<object>;
    getPlans(page?: string, limit?: string): Promise<{
        data: any[];
        total: number;
    }>;
    createPlan(dto: CreateTestPlanDto): Promise<any>;
    getPlan(id: string): Promise<any>;
    updatePlan(id: string, body: {
        name?: string;
        description?: string;
        scenarios?: any[];
        isActive?: boolean;
    }): Promise<any>;
    deletePlan(id: string): Promise<any>;
    runTests(dto: RunTestsDto): Promise<any>;
    runForModule(module: string): Promise<any>;
    runForVertical(code: string): Promise<any>;
    getLatestExecution(): Promise<any>;
    getExecutions(status?: string, moduleScope?: string, triggerType?: string, page?: string, limit?: string): Promise<{
        data: any[];
        total: number;
    }>;
    getExecution(id: string): Promise<any>;
    getSchedules(): Promise<any[]>;
    createSchedule(dto: CreateScheduleDto): Promise<any>;
    updateSchedule(id: string, body: {
        cronExpression?: string;
        isActive?: boolean;
        moduleScope?: string;
    }): Promise<any>;
    deleteSchedule(id: string): Promise<any>;
    getCoverageOverview(): Promise<object>;
    refreshCoverage(): Promise<any[]>;
    getModuleCoverage(module: string): Promise<any>;
}
