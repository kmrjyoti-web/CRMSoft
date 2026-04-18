import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateTestRunDto } from './dto/create-test-run.dto';
export declare class TestRunnerController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    getDashboard(tenantId: string, days?: number): Promise<ApiResponse<any>>;
    runAutoTests(tenantId: string, userId: string, dto: CreateTestRunDto): Promise<ApiResponse<any>>;
    runSelectiveTests(tenantId: string, userId: string, dto: CreateTestRunDto): Promise<ApiResponse<any>>;
    list(tenantId: string, status?: string, page?: number, limit?: number): Promise<ApiResponse<any>>;
    compareRuns(runId1: string, runId2: string): Promise<ApiResponse<any>>;
    getById(id: string): Promise<ApiResponse<any>>;
    getResults(testRunId: string, testType?: string, status?: string, module?: string, page?: number, limit?: number): Promise<ApiResponse<any>>;
    getResultsTree(testRunId: string): Promise<ApiResponse<any>>;
    rerunFailed(testRunId: string, tenantId: string, userId: string): Promise<ApiResponse<any>>;
    cancel(testRunId: string): Promise<ApiResponse<any>>;
}
