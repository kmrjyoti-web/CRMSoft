import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

export const OFFER_SCHEDULER_QUEUE = 'marketplace-offers';

export interface ActivateOfferJob {
  offerId: string;
  tenantId: string;
}

export interface DeactivateOfferJob {
  offerId: string;
  tenantId: string;
  reason: string;
}

export interface ResetCounterJob {
  offerId: string;
  tenantId: string;
}

export interface CheckLimitJob {
  offerId: string;
  tenantId: string;
}

@Processor(OFFER_SCHEDULER_QUEUE)
@Injectable()
export class OfferSchedulerProcessor {
  private readonly logger = new Logger(OfferSchedulerProcessor.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  @Process('ACTIVATE_OFFER')
  async handleActivateOffer(job: Job<ActivateOfferJob>): Promise<void> {
    const { offerId, tenantId } = job.data;
    this.logger.log(`Activating offer: ${offerId}`);

    const offer = await this.mktPrisma.client.mktOffer.findFirst({
      where: { id: offerId, tenantId, isDeleted: false },
    });

    if (!offer) {
      this.logger.warn(`Offer ${offerId} not found for activation`);
      return;
    }

    if (!['DRAFT', 'SCHEDULED'].includes(offer.status)) {
      this.logger.warn(`Offer ${offerId} is in status ${offer.status}, skipping activation`);
      return;
    }

    await this.mktPrisma.client.mktOffer.update({
      where: { id: offerId },
      data: { status: 'ACTIVE', publishedAt: offer.publishedAt ?? new Date() },
    });

    this.logger.log(`Offer ${offerId} activated successfully`);
  }

  @Process('DEACTIVATE_OFFER')
  async handleDeactivateOffer(job: Job<DeactivateOfferJob>): Promise<void> {
    const { offerId, tenantId, reason } = job.data;
    this.logger.log(`Deactivating offer: ${offerId}, reason: ${reason}`);

    const offer = await this.mktPrisma.client.mktOffer.findFirst({
      where: { id: offerId, tenantId, isDeleted: false },
    });

    if (!offer || offer.status !== 'ACTIVE') {
      this.logger.warn(`Offer ${offerId} not active, skipping deactivation`);
      return;
    }

    await this.mktPrisma.client.mktOffer.update({
      where: { id: offerId },
      data: {
        status: 'EXPIRED',
        closedAt: new Date(),
        closedReason: reason,
      },
    });

    this.logger.log(`Offer ${offerId} deactivated (${reason})`);
  }

  @Process('RESET_COUNTER')
  async handleResetCounter(job: Job<ResetCounterJob>): Promise<void> {
    const { offerId, tenantId } = job.data;
    this.logger.log(`Resetting counter for offer: ${offerId}`);

    const offer = await this.mktPrisma.client.mktOffer.findFirst({
      where: { id: offerId, tenantId, isDeleted: false },
    });

    if (!offer) {
      this.logger.warn(`Offer ${offerId} not found for counter reset`);
      return;
    }

    if (!['DAILY_RECURRING', 'WEEKLY_RECURRING'].includes(offer.offerType)) {
      this.logger.warn(`Offer ${offerId} is not recurring, skipping reset`);
      return;
    }

    await this.mktPrisma.client.mktOffer.update({
      where: { id: offerId },
      data: { currentRedemptions: 0, lastResetAt: new Date() },
    });

    this.logger.log(`Counter reset for offer ${offerId}`);
  }

  @Process('CHECK_LIMIT')
  async handleCheckLimit(job: Job<CheckLimitJob>): Promise<void> {
    const { offerId, tenantId } = job.data;

    const offer = await this.mktPrisma.client.mktOffer.findFirst({
      where: { id: offerId, tenantId, isDeleted: false },
    });

    if (!offer || !offer.maxRedemptions) return;

    if (offer.currentRedemptions >= offer.maxRedemptions && offer.autoCloseOnLimit && offer.status === 'ACTIVE') {
      await this.mktPrisma.client.mktOffer.update({
        where: { id: offerId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          closedReason: 'Redemption limit reached',
        },
      });
      this.logger.log(`Offer ${offerId} auto-closed: redemption limit reached`);
    }
  }
}
