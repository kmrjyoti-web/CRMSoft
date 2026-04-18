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
var UpdateListingHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateListingHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_listing_command_1 = require("./update-listing.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let UpdateListingHandler = UpdateListingHandler_1 = class UpdateListingHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(UpdateListingHandler_1.name);
    }
    async execute(command) {
        try {
            const existing = await this.mktPrisma.client.mktListing.findFirst({
                where: { id: command.id, tenantId: command.tenantId, isDeleted: false },
            });
            if (!existing) {
                throw new common_1.NotFoundException(`Listing ${command.id} not found`);
            }
            const updateData = { updatedById: command.updatedById };
            if (command.title !== undefined)
                updateData.title = command.title;
            if (command.description !== undefined)
                updateData.description = command.description;
            if (command.shortDescription !== undefined)
                updateData.shortDescription = command.shortDescription;
            if (command.categoryId !== undefined)
                updateData.categoryId = command.categoryId;
            if (command.subcategoryId !== undefined)
                updateData.subcategoryId = command.subcategoryId;
            if (command.mediaUrls !== undefined)
                updateData.mediaUrls = command.mediaUrls;
            if (command.basePrice !== undefined)
                updateData.basePrice = command.basePrice;
            if (command.mrp !== undefined)
                updateData.mrp = command.mrp;
            if (command.minOrderQty !== undefined)
                updateData.minOrderQty = command.minOrderQty;
            if (command.maxOrderQty !== undefined)
                updateData.maxOrderQty = command.maxOrderQty;
            if (command.hsnCode !== undefined)
                updateData.hsnCode = command.hsnCode;
            if (command.gstRate !== undefined)
                updateData.gstRate = command.gstRate;
            if (command.stockAvailable !== undefined)
                updateData.stockAvailable = command.stockAvailable;
            if (command.visibility !== undefined)
                updateData.visibility = command.visibility;
            if (command.visibilityConfig !== undefined)
                updateData.visibilityConfig = command.visibilityConfig;
            if (command.publishAt !== undefined)
                updateData.publishAt = command.publishAt;
            if (command.expiresAt !== undefined)
                updateData.expiresAt = command.expiresAt;
            if (command.attributes !== undefined)
                updateData.attributes = command.attributes;
            if (command.keywords !== undefined)
                updateData.keywords = command.keywords;
            if (command.shippingConfig !== undefined)
                updateData.shippingConfig = command.shippingConfig;
            if (command.requirementConfig !== undefined)
                updateData.requirementConfig = command.requirementConfig;
            await this.mktPrisma.client.mktListing.update({
                where: { id: command.id },
                data: updateData,
            });
            this.logger.log(`Listing updated: ${command.id}`);
        }
        catch (error) {
            this.logger.error(`UpdateListingHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateListingHandler = UpdateListingHandler;
exports.UpdateListingHandler = UpdateListingHandler = UpdateListingHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_listing_command_1.UpdateListingCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], UpdateListingHandler);
//# sourceMappingURL=update-listing.handler.js.map