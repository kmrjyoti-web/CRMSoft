import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bull';
import { OffersController } from './presentation/offers.controller';
import { MktPrismaService } from './infrastructure/mkt-prisma.service';
import { CreateOfferHandler } from './application/commands/create-offer/create-offer.handler';
import { ActivateOfferHandler } from './application/commands/activate-offer/activate-offer.handler';
import { RedeemOfferHandler } from './application/commands/redeem-offer/redeem-offer.handler';
import { GetOfferHandler } from './application/queries/get-offer/get-offer.handler';
import { ListOffersHandler } from './application/queries/list-offers/list-offers.handler';
import { CheckEligibilityHandler } from './application/queries/check-eligibility/check-eligibility.handler';
import { OfferSchedulerProcessor, OFFER_SCHEDULER_QUEUE } from './application/jobs/offer-scheduler.processor';

const CommandHandlers = [CreateOfferHandler, ActivateOfferHandler, RedeemOfferHandler];
const QueryHandlers = [GetOfferHandler, ListOffersHandler, CheckEligibilityHandler];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({ name: OFFER_SCHEDULER_QUEUE }),
  ],
  controllers: [OffersController],
  providers: [
    MktPrismaService,
    ...CommandHandlers,
    ...QueryHandlers,
    OfferSchedulerProcessor,
  ],
  exports: [MktPrismaService],
})
export class OffersModule {}
