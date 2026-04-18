import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetFieldDefinitionsQuery } from './get-field-definitions.query';
export declare class GetFieldDefinitionsHandler implements IQueryHandler<GetFieldDefinitionsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetFieldDefinitionsQuery): Promise<{
        id: string;
        tenantId: string;
        entityType: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        sortOrder: number;
        defaultValue: string | null;
        isRequired: boolean;
        options: import("@prisma/working-client/runtime/library").JsonValue | null;
        fieldName: string;
        fieldLabel: string;
        fieldType: string;
    }[]>;
}
