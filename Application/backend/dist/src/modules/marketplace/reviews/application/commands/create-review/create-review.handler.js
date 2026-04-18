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
var CreateReviewHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReviewHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const create_review_command_1 = require("./create-review.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let CreateReviewHandler = CreateReviewHandler_1 = class CreateReviewHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(CreateReviewHandler_1.name);
    }
    async execute(command) {
        try {
            if (command.rating < 1 || command.rating > 5) {
                throw new common_1.BadRequestException('Rating must be between 1 and 5');
            }
            const listing = await this.mktPrisma.client.mktListing.findFirst({
                where: { id: command.listingId, tenantId: command.tenantId, isDeleted: false },
            });
            if (!listing) {
                throw new common_1.NotFoundException(`Listing ${command.listingId} not found`);
            }
            const isVerifiedPurchase = Boolean(command.orderId);
            const status = isVerifiedPurchase ? 'APPROVED' : 'PENDING';
            const id = (0, crypto_1.randomUUID)();
            const review = await this.mktPrisma.client.mktReview.create({
                data: {
                    id,
                    tenantId: command.tenantId,
                    listingId: command.listingId,
                    reviewerId: command.reviewerId,
                    rating: command.rating,
                    title: command.title,
                    body: command.body,
                    mediaUrls: command.mediaUrls ?? [],
                    isVerifiedPurchase,
                    orderId: command.orderId,
                    status: status,
                },
            });
            if (status === 'APPROVED') {
                await this.updateListingRating(command.listingId, command.tenantId);
            }
            this.logger.log(`Review ${id} created for listing ${command.listingId}, status: ${status}`);
            return review;
        }
        catch (error) {
            this.logger.error(`CreateReviewHandler failed: ${error.message}`, error.stack);
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
            data: {
                reviewCount: count,
                avgRating,
            },
        });
    }
};
exports.CreateReviewHandler = CreateReviewHandler;
exports.CreateReviewHandler = CreateReviewHandler = CreateReviewHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_review_command_1.CreateReviewCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], CreateReviewHandler);
//# sourceMappingURL=create-review.handler.js.map