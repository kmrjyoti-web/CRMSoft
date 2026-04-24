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
exports.DomainsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
let DomainsService = class DomainsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async add(dto) {
        const existing = await this.prisma.partnerDomain.findUnique({ where: { domain: dto.domain } });
        if (existing)
            throw new common_1.ConflictException('Domain already registered');
        const verificationToken = (0, crypto_1.randomUUID)();
        const dnsRecords = {
            cname: { type: 'CNAME', name: `_verify.${dto.domain}`, value: `verify.whitelabel.crmsoft.in` },
            txt: { type: 'TXT', name: `_wl-verify.${dto.domain}`, value: verificationToken },
        };
        return this.prisma.partnerDomain.create({ data: { ...dto, verificationToken, dnsRecords } });
    }
    async listByPartner(partnerId) {
        return this.prisma.partnerDomain.findMany({ where: { partnerId }, orderBy: { createdAt: 'desc' } });
    }
    async remove(id) {
        const d = await this.prisma.partnerDomain.findUnique({ where: { id } });
        if (!d)
            throw new common_1.NotFoundException('Domain not found');
        return this.prisma.partnerDomain.delete({ where: { id } });
    }
    async verify(id) {
        const d = await this.prisma.partnerDomain.findUnique({ where: { id } });
        if (!d)
            throw new common_1.NotFoundException('Domain not found');
        return this.prisma.partnerDomain.update({ where: { id }, data: { isVerified: true, verifiedAt: new Date(), sslStatus: 'ACTIVE' } });
    }
    async getDnsRecords(id) {
        const d = await this.prisma.partnerDomain.findUnique({ where: { id } });
        if (!d)
            throw new common_1.NotFoundException('Domain not found');
        return { domain: d.domain, verificationToken: d.verificationToken, dnsRecords: d.dnsRecords };
    }
};
exports.DomainsService = DomainsService;
exports.DomainsService = DomainsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DomainsService);
//# sourceMappingURL=domains.service.js.map