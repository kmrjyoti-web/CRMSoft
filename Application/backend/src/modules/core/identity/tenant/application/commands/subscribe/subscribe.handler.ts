import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SubscribeCommand } from './subscribe.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { PaymentGatewayService } from '../../../services/payment-gateway.service';

@CommandHandler(SubscribeCommand)
export class SubscribeHandler implements ICommandHandler<SubscribeCommand> {
  private readonly logger = new Logger(SubscribeHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentGateway: PaymentGatewayService,
  ) {}

  async execute(command: SubscribeCommand) {
    const { gatewayId } = await this.paymentGateway.createSubscription(
      command.tenantId,
      command.planId,
    );

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription = await this.prisma.identity.subscription.create({
      data: {
        tenantId: command.tenantId,
        planId: command.planId,
        status: 'ACTIVE',
        gatewayId: gatewayId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    this.logger.log(`Subscription created: ${subscription.id} for tenant ${command.tenantId}`);
    return subscription;
  }
}
