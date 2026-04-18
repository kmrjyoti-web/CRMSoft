import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
export declare class ScheduledTestController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(tenantId: string, userId: string, body: {
        name: string;
        cronExpression: string;
        targetModules: string[];
        testTypes: string[];
        description?: string;
        dbSourceType?: string;
    }): Promise<ApiResponse<any>>;
    list(tenantId: string, isActive?: string, page?: number, limit?: number): Promise<ApiResponse<any>>;
    getById(id: string, tenantId: string): Promise<ApiResponse<any>>;
    update(id: string, tenantId: string, body: {
        name?: string;
        description?: string;
        cronExpression?: string;
        targetModules?: string[];
        testTypes?: string[];
        dbSourceType?: string;
        isActive?: boolean;
    }): Promise<ApiResponse<any>>;
    delete(id: string, tenantId: string): Promise<ApiResponse<null>>;
    trigger(id: string, tenantId: string, userId: string): Promise<ApiResponse<any>>;
    getRuns(id: string, tenantId: string, limit?: number): Promise<ApiResponse<any>>;
}
