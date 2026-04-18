import { ApiResponse } from '../../../../common/utils/api-response';
import { TaskLogicService } from '../task-logic.service';
import { UpsertTaskLogicConfigDto } from './dto/upsert-task-logic-config.dto';
export declare class TaskLogicController {
    private readonly taskLogicService;
    constructor(taskLogicService: TaskLogicService);
    getAll(): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        value: import("@prisma/working-client/runtime/library").JsonValue;
        configKey: string;
    }[]>>;
    getByKey(key: string): Promise<ApiResponse<any>>;
    upsert(key: string, dto: UpsertTaskLogicConfigDto): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        value: import("@prisma/working-client/runtime/library").JsonValue;
        configKey: string;
    }>>;
    remove(key: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        value: import("@prisma/working-client/runtime/library").JsonValue;
        configKey: string;
    }>>;
}
