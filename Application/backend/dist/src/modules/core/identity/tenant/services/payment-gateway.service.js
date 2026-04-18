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
var PaymentGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let PaymentGatewayService = PaymentGatewayService_1 = class PaymentGatewayService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PaymentGatewayService_1.name);
    }
    async createSubscription(tenantId, planId) {
        this.logger.log(`Creating gateway subscription for tenant ${tenantId}, plan ${planId}`);
        return { gatewayId: `gw_${Date.now()}` };
    }
    async cancelSubscription(gatewayId) {
        this.logger.log(`Cancelling gateway subscription ${gatewayId}`);
    }
    async handleWebhook(body, signature) {
        this.logger.log('Processing payment webhook');
        return { event: 'payment.captured' };
    }
};
exports.PaymentGatewayService = PaymentGatewayService;
exports.PaymentGatewayService = PaymentGatewayService = PaymentGatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentGatewayService);
//# sourceMappingURL=payment-gateway.service.js.map