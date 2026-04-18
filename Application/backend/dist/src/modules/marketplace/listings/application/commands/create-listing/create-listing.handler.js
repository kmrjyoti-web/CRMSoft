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
var CreateListingHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateListingHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const create_listing_command_1 = require("./create-listing.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let CreateListingHandler = CreateListingHandler_1 = class CreateListingHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(CreateListingHandler_1.name);
    }
    async execute(command) {
        try {
            const id = (0, crypto_1.randomUUID)();
            const listing = await this.mktPrisma.client.mktListing.create({
                data: {
                    id,
                    tenantId: command.tenantId,
                    authorId: command.authorId,
                    listingType: command.listingType,
                    title: command.title,
                    description: command.description,
                    shortDescription: command.shortDescription,
                    categoryId: command.categoryId,
                    subcategoryId: command.subcategoryId,
                    mediaUrls: command.mediaUrls ?? [],
                    currency: command.currency ?? 'INR',
                    basePrice: command.basePrice ?? 0,
                    mrp: command.mrp,
                    minOrderQty: command.minOrderQty ?? 1,
                    maxOrderQty: command.maxOrderQty,
                    hsnCode: command.hsnCode,
                    gstRate: command.gstRate,
                    trackInventory: command.trackInventory !== false,
                    stockAvailable: command.stockAvailable ?? 0,
                    visibility: command.visibility ?? 'PUBLIC',
                    visibilityConfig: command.visibilityConfig,
                    publishAt: command.publishAt,
                    expiresAt: command.expiresAt,
                    attributes: command.attributes ?? {},
                    keywords: command.keywords ?? [],
                    shippingConfig: command.shippingConfig,
                    requirementConfig: command.requirementConfig,
                    createdById: command.createdById,
                    status: command.publishAt && command.publishAt > new Date() ? 'SCHEDULED' : 'DRAFT',
                    priceTiers: command.priceTiers?.length
                        ? {
                            create: command.priceTiers.map((tier) => ({
                                id: (0, crypto_1.randomUUID)(),
                                label: tier.label,
                                minQty: tier.minQty,
                                maxQty: tier.maxQty,
                                pricePerUnit: tier.pricePerUnit,
                                requiresVerification: tier.requiresVerification ?? false,
                            })),
                        }
                        : undefined,
                },
            });
            this.logger.log(`Listing created: ${listing.id} (${listing.title}) by tenant ${command.tenantId}`);
            return listing.id;
        }
        catch (error) {
            this.logger.error(`CreateListingHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateListingHandler = CreateListingHandler;
exports.CreateListingHandler = CreateListingHandler = CreateListingHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_listing_command_1.CreateListingCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], CreateListingHandler);
//# sourceMappingURL=create-listing.handler.js.map