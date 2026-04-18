import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateTestGroupDto, UpdateTestGroupDto } from './dto/create-test-group.dto';
export declare class TestGroupsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(tenantId: string, userId: string, dto: CreateTestGroupDto): Promise<ApiResponse<any>>;
    list(tenantId: string, status?: string, module?: string): Promise<ApiResponse<any>>;
    getOperators(): Promise<ApiResponse<{
        code: string;
        label: string;
        example: string;
    }[]>>;
    getExecution(executionId: string): Promise<ApiResponse<any>>;
    getById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateTestGroupDto): Promise<ApiResponse<any>>;
    delete(id: string): Promise<ApiResponse<any>>;
    run(groupId: string, tenantId: string, userId: string, body: {
        testEnvId?: string;
    }): Promise<ApiResponse<any>>;
    listExecutions(groupId: string): Promise<ApiResponse<any>>;
}
