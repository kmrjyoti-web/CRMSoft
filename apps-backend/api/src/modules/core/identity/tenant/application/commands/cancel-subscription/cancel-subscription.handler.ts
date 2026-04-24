import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CancelSubscriptionCommand } from './cancel-subscription.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { PaymentGatewayService } from '../../../services/payment-gateway.service';

@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionHandler implements ICommandHandler<CancelSubscriptionCommand> {
  private readonly logger = new Logger(CancelSubscriptionHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentGateway: PaymentGatewayService,
  ) {}

  async execute(command: CancelSubscriptionCommand) {
    try {
      const subscription = await this.prisma.identity.subscription.findFirstOrThrow({
        where: { id: command.subscriptionId, tenantId: command.tenantId },
      });

      if (subscription.gatewayId) {
        await this.paymentGateway.cancelSubscription(subscription.gatewayId);
      }

      const updated = await this.prisma.identity.subscription.update({
        where: { id: command.subscriptionId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      this.logger.log(`Subscription cancelled: ${updated.id} for tenant ${command.tenantId}`);
      return updated;
    } catch (error) {
      this.logger.error(`CancelSubscriptionHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
