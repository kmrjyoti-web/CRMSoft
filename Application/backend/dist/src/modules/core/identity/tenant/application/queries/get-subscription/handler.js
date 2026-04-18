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
var GetSubscriptionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSubscriptionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const query_1 = require("./query");
let GetSubscriptionHandler = GetSubscriptionHandler_1 = class GetSubscriptionHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetSubscriptionHandler_1.name);
    }
    async execute(query) {
        this.logger.log(`Fetching subscription for tenant: ${query.tenantId}`);
        const subscription = await this.prisma.identity.subscription.findFirst({
            where: {
                tenantId: query.tenantId,
                status: { in: ['ACTIVE', 'TRIALING'] },
            },
            include: { plan: true },
        });
        if (!subscription) {
            throw new common_1.NotFoundException(`No active subscription found for tenant ${query.tenantId}`);
        }
        return subscription;
    }
};
exports.GetSubscriptionHandler = GetSubscriptionHandler;
exports.GetSubscriptionHandler = GetSubscriptionHandler = GetSubscriptionHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(query_1.GetSubscriptionQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetSubscriptionHandler);
//# sourceMappingURL=handler.js.map