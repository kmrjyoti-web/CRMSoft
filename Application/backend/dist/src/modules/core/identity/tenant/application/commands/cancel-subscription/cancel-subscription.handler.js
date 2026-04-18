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
var CancelSubscriptionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelSubscriptionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const cancel_subscription_command_1 = require("./cancel-subscription.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const payment_gateway_service_1 = require("../../../services/payment-gateway.service");
let CancelSubscriptionHandler = CancelSubscriptionHandler_1 = class CancelSubscriptionHandler {
    constructor(prisma, paymentGateway) {
        this.prisma = prisma;
        this.paymentGateway = paymentGateway;
        this.logger = new common_1.Logger(CancelSubscriptionHandler_1.name);
    }
    async execute(command) {
        try {
            const subscription = await this.prisma.identity.subscription.findFirstOrThrow({
                where: { id: command.subscriptionId, tenantId: command.tenantId },
            });
            if (subscription.gatewayId) {
                await this.paymentGateway.cancelSubscription(subscription.gatewayId);
            }
            const updated = await this.prisma.identity.subscription.update({
                where: { id: command.subscriptionId },
                data: {
                    status: 'CANCELLED',
                    cancelledAt: new Date(),
                },
            });
            this.logger.log(`Subscription cancelled: ${updated.id} for tenant ${command.tenantId}`);
            return updated;
        }
        catch (error) {
            this.logger.error(`CancelSubscriptionHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CancelSubscriptionHandler = CancelSubscriptionHandler;
exports.CancelSubscriptionHandler = CancelSubscriptionHandler = CancelSubscriptionHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(cancel_subscription_command_1.CancelSubscriptionCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payment_gateway_service_1.PaymentGatewayService])
], CancelSubscriptionHandler);
//# sourceMappingURL=cancel-subscription.handler.js.map