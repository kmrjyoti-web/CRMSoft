import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetFormSchemaQuery } from './get-form-schema.query';
export declare class GetFormSchemaHandler implements IQueryHandler<GetFormSchemaQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetFormSchemaQuery): Promise<{
        definitionId: string;
        fieldName: string;
        fieldLabel: string;
        fieldType: string;
        isRequired: boolean;
        defaultValue: string | null;
        options: import("@prisma/working-client/runtime/library").JsonValue;
        sortOrder: number;
        valueColumn: string;
    }[]>;
    private getValueColumn;
}
