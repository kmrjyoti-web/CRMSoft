import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RedeemOfferCommand } from './redeem-offer.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
import { OfferEntity } from '../../../domain/entities/offer.entity';

@CommandHandler(RedeemOfferCommand)
@Injectable()
export class RedeemOfferHandler implements ICommandHandler<RedeemOfferCommand> {
  private readonly logger = new Logger(RedeemOfferHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: RedeemOfferCommand): Promise<{ redemptionId: string; discountAmount: number }> {
    const raw = await this.mktPrisma.client.mktOffer.findFirst({
      where: { id: command.offerId, tenantId: command.tenantId, isDeleted: false },
    });

    if (!raw) throw new NotFoundException(`Offer ${command.offerId} not found`);

    const offer = OfferEntity.fromPrisma(raw);

    // Check per-user redemption count
    const userRedemptionCount = await this.mktPrisma.client.mktOfferRedemption.count({
      where: { offerId: command.offerId, userId: command.userId },
    });

    const eligibility = offer.isEligible({
      userId: command.userId,
      city: command.city,
      state: command.state,
      pincode: command.pincode,
      grade: command.grade,
      groupId: command.groupId,
      isVerified: command.isVerified,
      orderValue: command.orderValue,
      quantity: command.quantity,
      productId: command.productId,
      categoryId: command.categoryId,
      userRedemptionCount,
    });

    if (!eligibility.eligible) {
      throw new BadRequestException(eligibility.reason ?? 'Not eligible for this offer');
    }

    const discountAmount = offer.calculateDiscount(command.orderValue ?? 0, command.quantity);

    // Run redemption + counter update atomically
    const redemptionId = randomUUID();

    await this.mktPrisma.client.$transaction(async (tx: any) => {
      await tx.mktOfferRedemption.create({
        data: {
          id: redemptionId,
          offerId: command.offerId,
          userId: command.userId,
          tenantId: command.tenantId,
          orderId: command.orderId,
          discountApplied: discountAmount,
          orderValue: command.orderValue,
          city: command.city,
          state: command.state,
          deviceType: command.deviceType,
        },
      });

      const newCount = raw.currentRedemptions + 1;
      const shouldClose =
        raw.autoCloseOnLimit &&
        raw.maxRedemptions !== null &&
        raw.maxRedemptions !== undefined &&
        newCount >= raw.maxRedemptions;

      await tx.mktOffer.update({
        where: { id: command.offerId },
        data: {
          currentRedemptions: { increment: 1 },
          orderCount: { increment: 1 },
          totalOrderValue: { increment: command.orderValue ?? 0 },
          ...(shouldClose ? { status: 'CLOSED', closedAt: new Date(), closedReason: 'Redemption limit reached' } : {}),
        },
      });
    });

    this.logger.log(`Offer ${command.offerId} redeemed by user ${command.userId}, discount: ${discountAmount}`);
    return { redemptionId, discountAmount };
  }
}
