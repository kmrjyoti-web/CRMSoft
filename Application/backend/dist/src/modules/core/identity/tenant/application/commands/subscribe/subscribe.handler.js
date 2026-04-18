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
var SubscribeHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscribeHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const subscribe_command_1 = require("./subscribe.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const payment_gateway_service_1 = require("../../../services/payment-gateway.service");
let SubscribeHandler = SubscribeHandler_1 = class SubscribeHandler {
    constructor(prisma, paymentGateway) {
        this.prisma = prisma;
        this.paymentGateway = paymentGateway;
        this.logger = new common_1.Logger(SubscribeHandler_1.name);
    }
    async execute(command) {
        try {
            const { gatewayId } = await this.paymentGateway.createSubscription(command.tenantId, command.planId);
            const now = new Date();
            const periodEnd = new Date(now);
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            const subscription = await this.prisma.identity.subscription.create({
                data: {
                    tenantId: command.tenantId,
                    planId: command.planId,
                    status: 'ACTIVE',
                    gatewayId: gatewayId,
                    currentPeriodStart: now,
                    currentPeriodEnd: periodEnd,
                },
            });
            this.logger.log(`Subscription created: ${subscription.id} for tenant ${command.tenantId}`);
            return subscription;
        }
        catch (error) {
            this.logger.error(`SubscribeHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SubscribeHandler = SubscribeHandler;
exports.SubscribeHandler = SubscribeHandler = SubscribeHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(subscribe_command_1.SubscribeCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payment_gateway_service_1.PaymentGatewayService])
], SubscribeHandler);
//# sourceMappingURL=subscribe.handler.js.map