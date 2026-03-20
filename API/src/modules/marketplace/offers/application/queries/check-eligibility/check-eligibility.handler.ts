import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CheckEligibilityQuery } from './check-eligibility.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
import { OfferEntity } from '../../../domain/entities/offer.entity';

@QueryHandler(CheckEligibilityQuery)
@Injectable()
export class CheckEligibilityHandler implements IQueryHandler<CheckEligibilityQuery> {
  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: CheckEligibilityQuery) {
    const raw = await this.mktPrisma.client.mktOffer.findFirst({
      where: { id: query.offerId, tenantId: query.tenantId, isDeleted: false },
    });

    if (!raw) throw new NotFoundException(`Offer ${query.offerId} not found`);

    const offer = OfferEntity.fromPrisma(raw);

    const userRedemptionCount = await this.mktPrisma.client.mktOfferRedemption.count({
      where: { offerId: query.offerId, userId: query.userId },
    });

    const result = offer.isEligible({
      userId: query.userId,
      city: query.city,
      state: query.state,
      pincode: query.pincode,
      grade: query.grade,
      groupId: query.groupId,
      isVerified: query.isVerified,
      orderValue: query.orderValue,
      quantity: query.quantity,
      productId: query.productId,
      categoryId: query.categoryId,
      userRedemptionCount,
    });

    const discountAmount = result.eligible
      ? offer.calculateDiscount(query.orderValue ?? 0, query.quantity)
      : 0;

    return {
      ...result,
      discountAmount,
      offer: { id: raw.id, title: raw.title, discountType: raw.discountType, discountValue: raw.discountValue },
    };
  }
}
