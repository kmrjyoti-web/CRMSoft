import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetEntityValuesQuery } from './get-entity-values.query';
export declare class GetEntityValuesHandler implements IQueryHandler<GetEntityValuesQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetEntityValuesQuery): Promise<({
        definition: {
            id: string;
            options: import("@prisma/working-client/runtime/library").JsonValue;
            fieldName: string;
            fieldLabel: string;
            fieldType: string;
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
    })[]>;
}
