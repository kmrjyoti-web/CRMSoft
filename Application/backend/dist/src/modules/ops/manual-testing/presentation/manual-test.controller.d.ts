import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateManualTestLogDto, UpdateManualTestLogDto, GetUploadUrlDto } from './dto/manual-test-log.dto';
export declare class ManualTestController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    log(tenantId: string, userId: string, dto: CreateManualTestLogDto): Promise<ApiResponse<any>>;
    getUploadUrl(tenantId: string, dto: GetUploadUrlDto): Promise<ApiResponse<any>>;
    getSummary(tenantId: string, testRunId?: string, from?: string, to?: string): Promise<ApiResponse<any>>;
    list(tenantId: string, testRunId?: string, module?: string, status?: string, userId?: string, page?: string, limit?: string): Promise<ApiResponse<any>>;
    getById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateManualTestLogDto): Promise<ApiResponse<any>>;
    createPlan(tenantId: string, userId: string, body: {
        name: string;
        description?: string;
        version?: string;
        targetModules?: string[];
        items?: Array<{
            moduleName: string;
            componentName: string;
            functionality: string;
            layer: string;
            priority?: string;
        }>;
    }): Promise<ApiResponse<any>>;
    listPlans(tenantId: string, status?: string, search?: string, page?: string, limit?: string): Promise<ApiResponse<any>>;
    getPlan(planId: string, tenantId: string): Promise<ApiResponse<any>>;
    updatePlan(planId: string, tenantId: string, body: {
        name?: string;
        description?: string;
        version?: string;
        targetModules?: string[];
        status?: string;
    }): Promise<ApiResponse<any>>;
    updatePlanItem(planId: string, itemId: string, tenantId: string, userId: string, body: {
        status?: string;
        notes?: string;
        errorDetails?: string;
        priority?: string;
        moduleName?: string;
        componentName?: string;
        functionality?: string;
        layer?: string;
    }): Promise<ApiResponse<any>>;
}
