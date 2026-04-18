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
var PostRequirementHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRequirementHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const post_requirement_command_1 = require("./post-requirement.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let PostRequirementHandler = PostRequirementHandler_1 = class PostRequirementHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(PostRequirementHandler_1.name);
    }
    async execute(command) {
        try {
            const id = (0, crypto_1.randomUUID)();
            const requirementConfig = {};
            if (command.quantity !== undefined)
                requirementConfig.quantity = command.quantity;
            if (command.targetPrice !== undefined)
                requirementConfig.targetPrice = command.targetPrice;
            if (command.deadline)
                requirementConfig.deadline = command.deadline;
            const listing = await this.mktPrisma.client.mktListing.create({
                data: {
                    id,
                    tenantId: command.tenantId,
                    authorId: command.authorId,
                    createdById: command.authorId,
                    listingType: 'REQUIREMENT',
                    title: command.title,
                    description: command.description,
                    categoryId: command.categoryId,
                    mediaUrls: command.mediaUrls ?? [],
                    currency: command.currency ?? 'INR',
                    requirementConfig,
                    attributes: command.attributes ?? {},
                    keywords: command.keywords ?? [],
                    status: 'ACTIVE',
                    publishedAt: new Date(),
                },
            });
            if (command.categoryId) {
                const matchingListings = await this.mktPrisma.client.mktListing.findMany({
                    where: {
                        tenantId: command.tenantId,
                        categoryId: command.categoryId,
                        listingType: { not: 'REQUIREMENT' },
                        status: 'ACTIVE',
                        isDeleted: false,
                    },
                    select: { id: true, authorId: true },
                    take: 50,
                });
                this.logger.log(`Requirement ${id} matched ${matchingListings.length} potential sellers in category ${command.categoryId}`);
            }
            this.logger.log(`Requirement posted: ${listing.id} by ${command.authorId}`);
            return listing.id;
        }
        catch (error) {
            this.logger.error(`PostRequirementHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.PostRequirementHandler = PostRequirementHandler;
exports.PostRequirementHandler = PostRequirementHandler = PostRequirementHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(post_requirement_command_1.PostRequirementCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], PostRequirementHandler);
//# sourceMappingURL=post-requirement.handler.js.map