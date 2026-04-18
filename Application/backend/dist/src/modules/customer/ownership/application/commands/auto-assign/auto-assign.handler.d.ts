import { ICommandHandler } from '@nestjs/cqrs';
import { AutoAssignCommand } from './auto-assign.command';
import { RuleEngineService } from '../../../services/rule-engine.service';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class AutoAssignHandler implements ICommandHandler<AutoAssignCommand> {
    private readonly ruleEngine;
    private readonly prisma;
    private readonly logger;
    constructor(ruleEngine: RuleEngineService, prisma: PrismaService);
    execute(command: AutoAssignCommand): Promise<{
        assigned: boolean;
        reason: string;
        rule?: undefined;
        owner?: undefined;
    } | {
        assigned: boolean;
        rule: string;
        owner: {
            id: string;
            tenantId: string;
            entityType: import("@prisma/working-client").$Enums.EntityType;
            isActive: boolean;
            configJson: import("@prisma/working-client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            userId: string | null;
            priority: number;
            entityId: string;
            validFrom: Date;
            validTo: Date | null;
            ownerType: import("@prisma/working-client").$Enums.OwnerType;
            teamId: string | null;
            assignedById: string;
            assignmentReason: string | null;
        } | null;
        reason?: undefined;
    }>;
}
