import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { GetOfferQuery } from './get-offer.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@QueryHandler(GetOfferQuery)
@Injectable()
export class GetOfferHandler implements IQueryHandler<GetOfferQuery> {
    private readonly logger = new Logger(GetOfferHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: GetOfferQuery) {
    try {
      const offer = await this.mktPrisma.client.mktOffer.findFirst({
        where: { id: query.id, tenantId: query.tenantId, isDeleted: false },
        include: {
          analyticsSummary: true,
          _count: { select: { redemptions: true } },
        },
      });
      if (!offer) throw new NotFoundException(`Offer ${query.id} not found`);
      return offer;
    } catch (error) {
      this.logger.error(`GetOfferHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
