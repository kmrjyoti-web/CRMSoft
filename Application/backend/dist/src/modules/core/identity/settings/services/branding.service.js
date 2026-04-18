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
var BrandingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../../common/errors/app-error");
const path = require("path");
const fs = require("fs");
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/x-icon'];
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const LOGO_FIELD_MAP = {
    logo: 'logoUrl',
    logoLight: 'logoLightUrl',
    favicon: 'faviconUrl',
    loginBanner: 'loginBannerUrl',
    emailHeaderLogo: 'emailHeaderLogoUrl',
};
let BrandingService = BrandingService_1 = class BrandingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(BrandingService_1.name);
    }
    async get(tenantId) {
        const branding = await this.prisma.identity.tenantBranding.findUnique({ where: { tenantId } });
        if (!branding)
            throw app_error_1.AppError.from('CONFIG_ERROR');
        return branding;
    }
    async getByDomain(domain) {
        return this.prisma.identity.tenantBranding.findFirst({
            where: { customDomain: domain, domainVerified: true },
        });
    }
    async update(tenantId, data) {
        return this.prisma.identity.tenantBranding.upsert({
            where: { tenantId },
            update: data,
            create: { tenantId, ...data },
        });
    }
    async uploadLogo(tenantId, file, type) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            throw app_error_1.AppError.from('VALIDATION_ERROR');
        }
        if (file.size > MAX_FILE_SIZE) {
            throw app_error_1.AppError.from('VALIDATION_ERROR');
        }
        const uploadDir = path.join(process.cwd(), 'uploads', 'branding', tenantId);
        fs.mkdirSync(uploadDir, { recursive: true });
        const ext = path.extname(file.originalname) || '.png';
        const filename = `${type}-${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, file.buffer);
        const url = `/uploads/branding/${tenantId}/${filename}`;
        const field = LOGO_FIELD_MAP[type];
        await this.prisma.identity.tenantBranding.upsert({
            where: { tenantId },
            update: { [field]: url },
            create: { tenantId, [field]: url },
        });
        return { url };
    }
    async resetToDefaults(tenantId) {
        await this.prisma.identity.tenantBranding.delete({ where: { tenantId } }).catch(() => { });
        await this.prisma.identity.tenantBranding.create({ data: { tenantId } });
    }
    async getCssVariables(tenantId) {
        const b = await this.get(tenantId);
        return {
            '--primary': b.primaryColor,
            '--secondary': b.secondaryColor,
            '--accent': b.accentColor,
            '--sidebar-bg': b.sidebarColor,
            '--sidebar-text': b.sidebarTextColor,
            '--header-bg': b.headerColor,
            '--header-text': b.headerTextColor,
            '--button-bg': b.buttonColor,
            '--button-text': b.buttonTextColor,
            '--link': b.linkColor,
            '--danger': b.dangerColor,
            '--success': b.successColor,
            '--warning': b.warningColor,
            '--font-family': b.fontFamily,
            '--heading-font': b.headingFontFamily ?? b.fontFamily,
            '--font-size': b.fontSize,
        };
    }
};
exports.BrandingService = BrandingService;
exports.BrandingService = BrandingService = BrandingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BrandingService);
//# sourceMappingURL=branding.service.js.map