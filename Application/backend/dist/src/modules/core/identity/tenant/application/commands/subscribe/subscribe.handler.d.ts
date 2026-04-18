import { ICommandHandler } from '@nestjs/cqrs';
import { SubscribeCommand } from './subscribe.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { PaymentGatewayService } from '../../../services/payment-gateway.service';
export declare class SubscribeHandler implements ICommandHandler<SubscribeCommand> {
    private readonly prisma;
    private readonly paymentGateway;
    private readonly logger;
    constructor(prisma: PrismaService, paymentGateway: PaymentGatewayService);
    execute(command: SubscribeCommand): Promise<{
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
