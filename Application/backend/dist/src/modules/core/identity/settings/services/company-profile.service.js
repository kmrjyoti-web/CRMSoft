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
var CompanyProfileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let CompanyProfileService = CompanyProfileService_1 = class CompanyProfileService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CompanyProfileService_1.name);
    }
    async get(tenantId) {
        const profile = await this.prisma.companyProfile.findUnique({ where: { tenantId } });
        if (profile)
            return profile;
        return this.prisma.companyProfile.create({
            data: {
                tenantId,
                companyName: 'My Company',
                country: 'India',
                countryCode: 'IN',
                currencyCode: 'INR',
                currencySymbol: '?',
                numberFormat: 'INDIAN',
                financialYearStart: 4,
                financialYearEnd: 3,
                timezone: 'Asia/Kolkata',
                locale: 'en-IN',
                dateFormat: 'DD/MM/YYYY',
                accountingMethod: 'ACCRUAL',
                inventoryMethod: 'FIFO',
                workingPattern: 'STANDARD',
                workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
                weekOff: ['SUN'],
            },
        });
    }
    async update(tenantId, data, userId) {
        return this.prisma.companyProfile.upsert({
            where: { tenantId },
            update: { ...data, updatedById: userId },
            create: { tenantId, companyName: data.companyName ?? 'My Company', ...data },
        });
    }
    async getPublic(tenantId) {
        const profile = await this.prisma.companyProfile.findUnique({ where: { tenantId } });
        if (!profile)
            return {};
        return {
            companyName: profile.companyName,
            legalName: profile.legalName,
            phone: profile.phone,
            email: profile.email,
            website: profile.website,
            addressLine1: profile.addressLine1,
            addressLine2: profile.addressLine2,
            city: profile.city,
            state: profile.state,
            country: profile.country,
            pincode: profile.pincode,
            gstNumber: profile.gstNumber,
            panNumber: profile.panNumber,
            bankName: profile.bankName,
            bankBranch: profile.bankBranch,
            accountNumber: profile.accountNumber,
            ifscCode: profile.ifscCode,
            accountType: profile.accountType,
            upiId: profile.upiId,
            linkedinUrl: profile.linkedinUrl,
            facebookUrl: profile.facebookUrl,
            twitterUrl: profile.twitterUrl,
            instagramUrl: profile.instagramUrl,
            youtubeUrl: profile.youtubeUrl,
        };
    }
};
exports.CompanyProfileService = CompanyProfileService;
exports.CompanyProfileService = CompanyProfileService = CompanyProfileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanyProfileService);
//# sourceMappingURL=company-profile.service.js.map