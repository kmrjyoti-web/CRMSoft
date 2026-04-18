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
var DomainVerifierService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainVerifierService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const crypto_1 = require("crypto");
const app_error_1 = require("../../../../../common/errors/app-error");
const dns = require("dns");
const util_1 = require("util");
const resolveTxt = (0, util_1.promisify)(dns.resolveTxt);
let DomainVerifierService = DomainVerifierService_1 = class DomainVerifierService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DomainVerifierService_1.name);
    }
    async initiate(tenantId, domain) {
        const token = `crm-verify-${(0, crypto_1.randomBytes)(16).toString('hex')}`;
        await this.prisma.identity.tenantBranding.upsert({
            where: { tenantId },
            update: {
                customDomain: domain,
                domainVerified: false,
                domainVerifyToken: token,
                domainVerifyMethod: 'DNS_TXT',
            },
            create: {
                tenantId,
                customDomain: domain,
                domainVerifyToken: token,
                domainVerifyMethod: 'DNS_TXT',
            },
        });
        return {
            domain,
            verifyMethod: 'DNS_TXT',
            verifyToken: token,
            instructions: `Add a DNS TXT record: _crm-verify.${domain} → ${token}`,
        };
    }
    async verify(tenantId) {
        const branding = await this.prisma.identity.tenantBranding.findUnique({ where: { tenantId } });
        if (!branding?.customDomain || !branding.domainVerifyToken) {
            throw app_error_1.AppError.from('CONFIG_ERROR');
        }
        try {
            const records = await resolveTxt(`_crm-verify.${branding.customDomain}`);
            const flat = records.flat();
            const found = flat.includes(branding.domainVerifyToken);
            if (found) {
                await this.prisma.identity.tenantBranding.update({
                    where: { tenantId },
                    data: { domainVerified: true },
                });
                this.logger.log(`Domain verified: ${branding.customDomain}`);
                return { verified: true };
            }
            return { verified: false, error: 'TXT record not found. Allow up to 48 hours for DNS propagation.' };
        }
        catch (err) {
            return { verified: false, error: `DNS lookup failed: ${err.message}` };
        }
    }
};
exports.DomainVerifierService = DomainVerifierService;
exports.DomainVerifierService = DomainVerifierService = DomainVerifierService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DomainVerifierService);
//# sourceMappingURL=domain-verifier.service.js.map