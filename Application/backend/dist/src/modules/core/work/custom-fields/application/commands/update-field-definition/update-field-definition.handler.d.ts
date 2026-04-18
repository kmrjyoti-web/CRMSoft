import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { UpdateFieldDefinitionCommand } from './update-field-definition.command';
export declare class UpdateFieldDefinitionHandler implements ICommandHandler<UpdateFieldDefinitionCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: UpdateFieldDefinitionCommand): Promise<{
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
    }>;
}
