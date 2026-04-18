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
var CreatePostHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePostHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const create_post_command_1 = require("./create-post.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let CreatePostHandler = CreatePostHandler_1 = class CreatePostHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(CreatePostHandler_1.name);
    }
    async execute(command) {
        try {
            const id = (0, crypto_1.randomUUID)();
            const post = await this.mktPrisma.client.mktPost.create({
                data: {
                    id,
                    tenantId: command.tenantId,
                    authorId: command.authorId,
                    createdById: command.createdById,
                    postType: command.postType,
                    content: command.content,
                    mediaUrls: command.mediaUrls ?? [],
                    linkedListingId: command.linkedListingId,
                    linkedOfferId: command.linkedOfferId,
                    rating: command.rating,
                    productId: command.productId,
                    visibility: command.visibility ?? 'PUBLIC',
                    visibilityConfig: command.visibilityConfig,
                    publishAt: command.publishAt,
                    expiresAt: command.expiresAt,
                    hashtags: command.hashtags ?? [],
                    mentions: command.mentions ?? [],
                    pollConfig: command.pollConfig,
                    status: command.publishAt && command.publishAt > new Date() ? 'SCHEDULED' : 'ACTIVE',
                    publishedAt: (!command.publishAt || command.publishAt <= new Date()) ? new Date() : undefined,
                },
            });
            this.logger.log(`Post created: ${post.id} (type: ${post.postType}) by ${command.authorId}`);
            return post.id;
        }
        catch (error) {
            this.logger.error(`CreatePostHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreatePostHandler = CreatePostHandler;
exports.CreatePostHandler = CreatePostHandler = CreatePostHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_post_command_1.CreatePostCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], CreatePostHandler);
//# sourceMappingURL=create-post.handler.js.map