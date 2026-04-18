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
var EngagePostHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagePostHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const engage_post_command_1 = require("./engage-post.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
const COUNTER_FIELD_MAP = {
    LIKE: 'likeCount',
    UNLIKE: 'likeCount',
    SHARE: 'shareCount',
    SAVE: 'saveCount',
    UNSAVE: 'saveCount',
    VIEW: 'viewCount',
};
let EngagePostHandler = EngagePostHandler_1 = class EngagePostHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(EngagePostHandler_1.name);
    }
    async execute(command) {
        const post = await this.mktPrisma.client.mktPost.findFirst({
            where: { id: command.postId, tenantId: command.tenantId, isDeleted: false },
        });
        if (!post)
            throw new common_1.NotFoundException(`Post ${command.postId} not found`);
        const isDecrement = command.action === 'UNLIKE' || command.action === 'UNSAVE';
        const counterField = COUNTER_FIELD_MAP[command.action];
        await this.mktPrisma.client.$transaction(async (tx) => {
            try {
                await tx.mktPostEngagement.create({
                    data: {
                        id: (0, crypto_1.randomUUID)(),
                        tenantId: command.tenantId,
                        postId: command.postId,
                        userId: command.userId,
                        action: command.action,
                        sharedTo: command.sharedTo,
                        city: command.city,
                        state: command.state,
                        deviceType: command.deviceType,
                    },
                });
            }
            catch (_e) {
                this.logger.debug(`Duplicate engagement ignored: ${command.postId}/${command.userId}/${command.action}`);
                return;
            }
            if (counterField) {
                await tx.mktPost.update({
                    where: { id: command.postId },
                    data: { [counterField]: { [isDecrement ? 'decrement' : 'increment']: 1 } },
                });
            }
        });
        this.logger.log(`Post ${command.postId} engaged with ${command.action} by user ${command.userId}`);
    }
};
exports.EngagePostHandler = EngagePostHandler;
exports.EngagePostHandler = EngagePostHandler = EngagePostHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(engage_post_command_1.EngagePostCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], EngagePostHandler);
//# sourceMappingURL=engage-post.handler.js.map