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
var ModerateReviewHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerateReviewHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const moderate_review_command_1 = require("./moderate-review.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let ModerateReviewHandler = ModerateReviewHandler_1 = class ModerateReviewHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(ModerateReviewHandler_1.name);
    }
    async execute(command) {
        try {
            const review = await this.mktPrisma.client.mktReview.findFirst({
                where: { id: command.reviewId, tenantId: command.tenantId, isDeleted: false },
            });
            if (!review)
                throw new common_1.NotFoundException(`Review ${command.reviewId} not found`);
            const statusMap = { APPROVE: 'APPROVED', REJECT: 'REJECTED', FLAG: 'FLAGGED' };
            const newStatus = statusMap[command.action];
            await this.mktPrisma.client.mktReview.update({
                where: { id: command.reviewId },
                data: {
                    status: newStatus,
                    moderatorId: command.moderatorId,
                    moderationNote: command.note,
                },
            });
            if (command.action === 'APPROVE') {
                await this.updateListingRating(review.listingId, command.tenantId);
            }
            this.logger.log(`Review ${command.reviewId} ${command.action}D by moderator ${command.moderatorId}`);
        }
        catch (error) {
            this.logger.error(`ModerateReviewHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateListingRating(listingId, tenantId) {
        const reviews = await this.mktPrisma.client.mktReview.findMany({
            where: { listingId, tenantId, status: 'APPROVED', isDeleted: false },
            select: { rating: true },
        });
        const count = reviews.length;
        const avgRating = count > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
            : null;
        await this.mktPrisma.client.mktListing.update({
            where: { id: listingId },
            data: { reviewCount: count, avgRating },
        });
    }
};
exports.ModerateReviewHandler = ModerateReviewHandler;
exports.ModerateReviewHandler = ModerateReviewHandler = ModerateReviewHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(moderate_review_command_1.ModerateReviewCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], ModerateReviewHandler);
//# sourceMappingURL=moderate-review.handler.js.map