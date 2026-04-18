import { Job } from 'bull';
import { MktPrismaService } from '../../infrastructure/mkt-prisma.service';
export declare const OFFER_SCHEDULER_QUEUE = "marketplace-offers";
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
export declare class OfferSchedulerProcessor {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    handleActivateOffer(job: Job<ActivateOfferJob>): Promise<void>;
    handleDeactivateOffer(job: Job<DeactivateOfferJob>): Promise<void>;
    handleResetCounter(job: Job<ResetCounterJob>): Promise<void>;
    handleCheckLimit(job: Job<CheckLimitJob>): Promise<void>;
}
