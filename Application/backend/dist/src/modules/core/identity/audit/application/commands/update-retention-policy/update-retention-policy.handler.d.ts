import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateRetentionPolicyCommand } from './update-retention-policy.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class UpdateRetentionPolicyHandler implements ICommandHandler<UpdateRetentionPolicyCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: UpdateRetentionPolicyCommand): Promise<{
        id: string;
        tenantId: string;
        entityType: import("@prisma/identity-client").$Enums.AuditEntityType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        retentionDays: number;
        archiveEnabled: boolean;
    }>;
}
