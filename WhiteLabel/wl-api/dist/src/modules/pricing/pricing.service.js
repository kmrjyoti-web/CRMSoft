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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
class Decimal {
    val;
    constructor(v) {
        if (typeof v === 'object' && v !== null && typeof v.toNumber === 'function') {
            this.val = v.toNumber();
        }
        else {
            this.val = Number(v);
        }
    }
    lessThan(other) { return this.val < new Decimal(other).val; }
    minus(other) { return new Decimal(this.val - new Decimal(other).val); }
    toNumber() { return this.val; }
}
let PricingService = class PricingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listServices() {
        return this.prisma.servicePricingTier.findMany({ where: { isActive: true }, orderBy: { serviceName: 'asc' } });
    }
    async createService(dto) {
        return this.prisma.servicePricingTier.create({ data: dto });
    }
    async updateService(serviceCode, dto) {
        return this.prisma.servicePricingTier.update({ where: { serviceCode }, data: dto });
    }
    async getPartnerPricing(partnerId) {
        return this.prisma.partnerServicePricing.findMany({
            where: { partnerId },
            include: { service: true },
        });
    }
    async setPartnerPricing(dto) {
        const service = await this.prisma.servicePricingTier.findUnique({ where: { serviceCode: dto.serviceCode } });
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        if (new Decimal(dto.pricePerUnit).lessThan(service.baseCostPerUnit)) {
            throw new common_1.BadRequestException(`Partner price cannot be below base cost (${service.baseCostPerUnit})`);
        }
        return this.prisma.partnerServicePricing.upsert({
            where: { partnerId_serviceCode: { partnerId: dto.partnerId, serviceCode: dto.serviceCode } },
            create: dto,
            update: dto,
        });
    }
    async setCustomerPricing(dto) {
        const partnerP = await this.prisma.partnerServicePricing.findUnique({
            where: { partnerId_serviceCode: { partnerId: dto.partnerId, serviceCode: dto.serviceCode } },
        });
        if (partnerP && partnerP.customerMinPrice && new Decimal(dto.customerPricePerUnit).lessThan(partnerP.customerMinPrice)) {
            throw new common_1.BadRequestException(`Customer price cannot be below minimum (${partnerP.customerMinPrice})`);
        }
        return this.prisma.partnerCustomerPricing.upsert({
            where: { partnerId_serviceCode: { partnerId: dto.partnerId, serviceCode: dto.serviceCode } },
            create: dto,
            update: dto,
        });
    }
    async getPricingChain(partnerId, serviceCode) {
        const [service, partnerP, customerP] = await Promise.all([
            this.prisma.servicePricingTier.findUnique({ where: { serviceCode } }),
            this.prisma.partnerServicePricing.findUnique({ where: { partnerId_serviceCode: { partnerId, serviceCode } } }),
            this.prisma.partnerCustomerPricing.findUnique({ where: { partnerId_serviceCode: { partnerId, serviceCode } } }),
        ]);
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        const yourMargin = partnerP ? new Decimal(partnerP.pricePerUnit).minus(service.baseCostPerUnit).toNumber() : null;
        const partnerMargin = partnerP && customerP ? new Decimal(customerP.customerPricePerUnit).minus(partnerP.pricePerUnit).toNumber() : null;
        return { service, partnerPricing: partnerP, customerPricing: customerP, margins: { yourMarginPerUnit: yourMargin, partnerMarginPerUnit: partnerMargin } };
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PricingService);
//# sourceMappingURL=pricing.service.js.map