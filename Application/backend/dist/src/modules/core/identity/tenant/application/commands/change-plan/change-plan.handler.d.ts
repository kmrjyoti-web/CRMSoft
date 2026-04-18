import { ICommandHandler } from '@nestjs/cqrs';
import { ChangePlanCommand } from './change-plan.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class ChangePlanHandler implements ICommandHandler<ChangePlanCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: ChangePlanCommand): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/identity-client").$Enums.SubscriptionStatus;
        planId: string;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
        trialEndsAt: Date | null;
        cancelledAt: Date | null;
        gatewayId: string | null;
    }>;
}
