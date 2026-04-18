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
var PublishListingHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishListingHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const publish_listing_command_1 = require("./publish-listing.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let PublishListingHandler = PublishListingHandler_1 = class PublishListingHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(PublishListingHandler_1.name);
    }
    async execute(command) {
        try {
            const listing = await this.mktPrisma.client.mktListing.findFirst({
                where: { id: command.id, tenantId: command.tenantId, isDeleted: false },
            });
            if (!listing) {
                throw new common_1.NotFoundException(`Listing ${command.id} not found`);
            }
            if (listing.status !== 'DRAFT' && listing.status !== 'SCHEDULED') {
                throw new common_1.BadRequestException(`Cannot publish listing in status: ${listing.status}`);
            }
            await this.mktPrisma.client.mktListing.update({
                where: { id: command.id },
                data: {
                    status: 'ACTIVE',
                    publishedAt: new Date(),
                    updatedById: command.publishedById,
                },
            });
            this.logger.log(`Listing published: ${command.id}`);
        }
        catch (error) {
            this.logger.error(`PublishListingHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.PublishListingHandler = PublishListingHandler;
exports.PublishListingHandler = PublishListingHandler = PublishListingHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(publish_listing_command_1.PublishListingCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], PublishListingHandler);
//# sourceMappingURL=publish-listing.handler.js.map