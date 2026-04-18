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
var FollowUserHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowUserHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const follow_user_command_1 = require("./follow-user.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let FollowUserHandler = FollowUserHandler_1 = class FollowUserHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(FollowUserHandler_1.name);
    }
    async execute(command) {
        const { tenantId, followerId, followingId } = command;
        if (followerId === followingId) {
            throw new common_1.ConflictException('Cannot follow yourself');
        }
        try {
            await this.mktPrisma.client.mktFollow.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    tenantId,
                    followerId,
                    followingId,
                },
            });
            this.logger.log(`User ${followerId} followed ${followingId}`);
            return { success: true };
        }
        catch {
            throw new common_1.ConflictException('Already following this user');
        }
    }
};
exports.FollowUserHandler = FollowUserHandler;
exports.FollowUserHandler = FollowUserHandler = FollowUserHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(follow_user_command_1.FollowUserCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], FollowUserHandler);
//# sourceMappingURL=follow-user.handler.js.map