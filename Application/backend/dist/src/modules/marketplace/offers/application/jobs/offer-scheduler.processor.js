"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OfferSchedulerProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferSchedulerProcessor = exports.OFFER_SCHEDULER_QUEUE = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const mkt_prisma_service_1 = require("../../infrastructure/mkt-prisma.service");
exports.OFFER_SCHEDULER_QUEUE = 'marketplace-offers';
let OfferSchedulerProcessor = OfferSchedulerProcessor_1 = class OfferSchedulerProcessor {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(OfferSchedulerProcessor_1.name);
    }
    async handleActivateOffer(job) {
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
    async handleDeactivateOffer(job) {
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
    async handleResetCounter(job) {
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
    async handleCheckLimit(job) {
        const { offerId, tenantId } = job.data;
        const offer = await this.mktPrisma.client.mktOffer.findFirst({
            where: { id: offerId, tenantId, isDeleted: false },
        });
        if (!offer || !offer.maxRedemptions)
            return;
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
};
exports.OfferSchedulerProcessor = OfferSchedulerProcessor;
__decorate([
    (0, bull_1.Process)('ACTIVATE_OFFER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OfferSchedulerProcessor.prototype, "handleActivateOffer", null);
__decorate([
    (0, bull_1.Process)('DEACTIVATE_OFFER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OfferSchedulerProcessor.prototype, "handleDeactivateOffer", null);
__decorate([
    (0, bull_1.Process)('RESET_COUNTER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OfferSchedulerProcessor.prototype, "handleResetCounter", null);
__decorate([
    (0, bull_1.Process)('CHECK_LIMIT'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OfferSchedulerProcessor.prototype, "handleCheckLimit", null);
exports.OfferSchedulerProcessor = OfferSchedulerProcessor = OfferSchedulerProcessor_1 = __decorate([
    (0, bull_1.Processor)(exports.OFFER_SCHEDULER_QUEUE),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], OfferSchedulerProcessor);
//# sourceMappingURL=offer-scheduler.processor.js.map