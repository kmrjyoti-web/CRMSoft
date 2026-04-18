import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../../../common/utils/api-response';
import { CreateFieldDefinitionDto } from './dto/create-field-definition.dto';
import { UpdateFieldDefinitionDto } from './dto/update-field-definition.dto';
import { BulkSetFieldValuesDto } from './dto/set-field-value.dto';
export declare class CustomFieldsController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly prisma;
    constructor(commandBus: CommandBus, queryBus: QueryBus, prisma: PrismaService);
    createDefinition(dto: CreateFieldDefinitionDto): Promise<ApiResponse<any>>;
    getDefinitions(entityType: string, includeInactive?: string): Promise<ApiResponse<any>>;
    updateDefinition(id: string, dto: UpdateFieldDefinitionDto): Promise<ApiResponse<any>>;
    deleteDefinition(id: string): Promise<ApiResponse<any>>;
    setValues(entityType: string, entityId: string, dto: BulkSetFieldValuesDto): Promise<ApiResponse<any>>;
    getValues(entityType: string, entityId: string): Promise<ApiResponse<any>>;
    getFormSchema(entityType: string): Promise<ApiResponse<any>>;
    filterByField(entityType: string, fieldName: string, operator: string | undefined, value: string, page?: string, limit?: string): Promise<ApiResponse<({
        definition: {
            fieldName: string;
            fieldLabel: string;
        };
    } & {
        id: string;
        tenantId: string;
        entityType: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        entityId: string;
        definitionId: string;
        valueText: string | null;
        valueNumber: number | null;
        valueDate: Date | null;
        valueBoolean: boolean | null;
        valueJson: import("@prisma/working-client/runtime/library").JsonValue | null;
        valueDropdown: string | null;
    })[]>>;
    private buildFilterWhere;
}
