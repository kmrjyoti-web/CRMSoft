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
var UnfollowUserHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnfollowUserHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const unfollow_user_command_1 = require("./unfollow-user.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let UnfollowUserHandler = UnfollowUserHandler_1 = class UnfollowUserHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(UnfollowUserHandler_1.name);
    }
    async execute(command) {
        try {
            const { followerId, followingId } = command;
            const existing = await this.mktPrisma.client.mktFollow.findFirst({
                where: { followerId, followingId },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Follow relationship not found');
            }
            await this.mktPrisma.client.mktFollow.delete({
                where: { id: existing.id },
            });
            this.logger.log(`User ${followerId} unfollowed ${followingId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`UnfollowUserHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UnfollowUserHandler = UnfollowUserHandler;
exports.UnfollowUserHandler = UnfollowUserHandler = UnfollowUserHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(unfollow_user_command_1.UnfollowUserCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], UnfollowUserHandler);
//# sourceMappingURL=unfollow-user.handler.js.map