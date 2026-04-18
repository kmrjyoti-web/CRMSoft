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
exports.SoftwareOfferService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let SoftwareOfferService = class SoftwareOfferService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.platform.softwareOffer.create({
            data: {
                name: data.name,
                code: data.code,
                description: data.description ?? null,
                offerType: data.offerType,
                value: data.value,
                applicablePlanIds: data.applicablePlanIds ?? [],
                validFrom: data.validFrom,
                validTo: data.validTo,
                maxRedemptions: data.maxRedemptions ?? 0,
                currentRedemptions: 0,
                isActive: data.isActive ?? true,
                autoApply: data.autoApply ?? false,
                terms: data.terms ?? null,
            },
        });
    }
    async update(id, data) {
        const offer = await this.prisma.platform.softwareOffer.findUnique({ where: { id } });
        if (!offer) {
            throw new common_1.NotFoundException(`Software offer ${id} not found`);
        }
        return this.prisma.platform.softwareOffer.update({
            where: { id },
            data,
        });
    }
    async deactivate(id) {
        const offer = await this.prisma.platform.softwareOffer.findUnique({ where: { id } });
        if (!offer) {
            throw new common_1.NotFoundException(`Software offer ${id} not found`);
        }
        return this.prisma.platform.softwareOffer.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async listAll(query) {
        const where = {};
        if (query.isActive !== undefined) {
            where.isActive = query.isActive;
        }
        return this.prisma.platform.softwareOffer.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async getById(id) {
        const offer = await this.prisma.platform.softwareOffer.findUnique({ where: { id } });
        if (!offer) {
            throw new common_1.NotFoundException(`Software offer ${id} not found`);
        }
        return offer;
    }
    async getApplicable(planId) {
        const now = new Date();
        const offers = await this.prisma.platform.softwareOffer.findMany({
            where: {
                isActive: true,
                validFrom: { lte: now },
                validTo: { gte: now },
            },
            orderBy: { createdAt: 'desc' },
        });
        return offers.filter((offer) => offer.applicablePlanIds.length === 0 || offer.applicablePlanIds.includes(planId));
    }
    async redeem(offerId, tenantId) {
        const offer = await this.prisma.platform.softwareOffer.findUnique({ where: { id: offerId } });
        if (!offer) {
            throw new common_1.NotFoundException(`Software offer ${offerId} not found`);
        }
        const validity = await this.checkValidity(offerId);
        if (!validity.valid) {
            throw new common_1.BadRequestException(`Offer cannot be redeemed: ${validity.reason}`);
        }
        if (offer.maxRedemptions > 0 && offer.currentRedemptions >= offer.maxRedemptions) {
            throw new common_1.BadRequestException('Offer has reached maximum redemptions');
        }
        const tenant = await this.prisma.identity.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant ${tenantId} not found`);
        }
        return this.prisma.platform.softwareOffer.update({
            where: { id: offerId },
            data: { currentRedemptions: { increment: 1 } },
        });
    }
    async checkValidity(offerId) {
        const offer = await this.prisma.platform.softwareOffer.findUnique({ where: { id: offerId } });
        if (!offer) {
            return { valid: false, reason: 'Offer not found' };
        }
        if (!offer.isActive) {
            return { valid: false, reason: 'Offer is inactive' };
        }
        const now = new Date();
        if (now < offer.validFrom) {
            return { valid: false, reason: 'Offer has not started yet' };
        }
        if (now > offer.validTo) {
            return { valid: false, reason: 'Offer has expired' };
        }
        if (offer.maxRedemptions > 0 && offer.currentRedemptions >= offer.maxRedemptions) {
            return { valid: false, reason: 'Maximum redemptions reached' };
        }
        return { valid: true };
    }
};
exports.SoftwareOfferService = SoftwareOfferService;
exports.SoftwareOfferService = SoftwareOfferService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SoftwareOfferService);
//# sourceMappingURL=software-offer.service.js.map