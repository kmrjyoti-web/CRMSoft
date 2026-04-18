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
exports.ServiceRateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let ServiceRateService = class ServiceRateService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRate(serviceKey) {
        const rate = await this.prisma.working.serviceRate.findUnique({ where: { serviceKey } });
        if (!rate)
            return null;
        return rate;
    }
    async estimateCost(serviceKey) {
        const rate = await this.getRate(serviceKey);
        if (!rate)
            return null;
        return {
            serviceKey: rate.serviceKey,
            displayName: rate.displayName,
            category: rate.category,
            baseTokens: rate.baseTokens,
            marginPct: rate.marginPct,
            finalTokens: rate.finalTokens,
        };
    }
    async findAll(params) {
        const where = {};
        if (params?.category)
            where.category = params.category;
        if (params?.isActive !== undefined)
            where.isActive = params.isActive;
        return this.prisma.working.serviceRate.findMany({
            where,
            orderBy: [{ category: 'asc' }, { serviceKey: 'asc' }],
        });
    }
    async findById(id) {
        const rate = await this.prisma.working.serviceRate.findUnique({ where: { id } });
        if (!rate)
            throw new common_1.NotFoundException('Service rate not found');
        return rate;
    }
    async create(data) {
        const marginPct = data.marginPct ?? 20;
        const finalTokens = Math.ceil(data.baseTokens * (1 + marginPct / 100));
        return this.prisma.working.serviceRate.create({
            data: {
                serviceKey: data.serviceKey,
                displayName: data.displayName,
                category: data.category,
                baseTokens: data.baseTokens,
                marginPct,
                finalTokens,
                description: data.description,
            },
        });
    }
    async update(id, data) {
        const existing = await this.findById(id);
        const baseTokens = data.baseTokens ?? existing.baseTokens;
        const marginPct = data.marginPct ?? existing.marginPct;
        const finalTokens = Math.ceil(baseTokens * (1 + marginPct / 100));
        return this.prisma.working.serviceRate.update({
            where: { id },
            data: { ...data, finalTokens },
        });
    }
    async delete(id) {
        await this.findById(id);
        return this.prisma.working.serviceRate.delete({ where: { id } });
    }
};
exports.ServiceRateService = ServiceRateService;
exports.ServiceRateService = ServiceRateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiceRateService);
//# sourceMappingURL=service-rate.service.js.map