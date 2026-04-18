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
var GetFollowingHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFollowingHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_following_query_1 = require("./get-following.query");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let GetFollowingHandler = GetFollowingHandler_1 = class GetFollowingHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(GetFollowingHandler_1.name);
    }
    async execute(query) {
        try {
            const { userId, page, limit } = query;
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                this.mktPrisma.client.mktFollow.findMany({
                    where: { followerId: userId },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                this.mktPrisma.client.mktFollow.count({ where: { followerId: userId } }),
            ]);
            return {
                data,
                meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            };
        }
        catch (error) {
            this.logger.error(`GetFollowingHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetFollowingHandler = GetFollowingHandler;
exports.GetFollowingHandler = GetFollowingHandler = GetFollowingHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_following_query_1.GetFollowingQuery),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], GetFollowingHandler);
//# sourceMappingURL=get-following.handler.js.map