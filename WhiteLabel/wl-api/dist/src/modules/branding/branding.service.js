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
exports.BrandingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BrandingService = class BrandingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.partnerBranding.create({ data: dto });
    }
    async getByPartner(partnerId) {
        const b = await this.prisma.partnerBranding.findUnique({ where: { partnerId } });
        if (!b)
            throw new common_1.NotFoundException('Branding not found');
        return b;
    }
    async getByDomain(domain) {
        const pd = await this.prisma.partnerDomain.findUnique({ where: { domain }, include: { partner: { include: { branding: true } } } });
        if (!pd)
            throw new common_1.NotFoundException('Domain not found');
        return pd.partner.branding;
    }
    async update(partnerId, dto) {
        await this.getByPartner(partnerId);
        return this.prisma.partnerBranding.update({ where: { partnerId }, data: dto });
    }
};
exports.BrandingService = BrandingService;
exports.BrandingService = BrandingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BrandingService);
//# sourceMappingURL=branding.service.js.map