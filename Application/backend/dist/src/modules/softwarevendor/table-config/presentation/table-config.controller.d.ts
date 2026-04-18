import { ApiResponse } from '../../../../common/utils/api-response';
import { TableConfigService } from '../services/table-config.service';
import { UpsertTableConfigDto } from './dto/upsert-table-config.dto';
export declare class TableConfigController {
    private readonly service;
    constructor(service: TableConfigService);
    getConfig(tableKey: string, userId: string, tenantId: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        config: import("@prisma/working-client/runtime/library").JsonValue;
        userId: string | null;
        tableKey: string;
    } | null>>;
    upsertConfig(tableKey: string, dto: UpsertTableConfigDto, userId: string, tenantId: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        config: import("@prisma/working-client/runtime/library").JsonValue;
        userId: string | null;
        tableKey: string;
    }>>;
    upsertDefault(tableKey: string, dto: UpsertTableConfigDto, tenantId: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        config: import("@prisma/working-client/runtime/library").JsonValue;
        userId: string | null;
        tableKey: string;
    }>>;
    resetConfig(tableKey: string, userId: string, tenantId: string): Promise<ApiResponse<{
        deleted: boolean;
    }>>;
}
