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
var WaTemplateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaTemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const wa_api_service_1 = require("./wa-api.service");
let WaTemplateService = WaTemplateService_1 = class WaTemplateService {
    constructor(prisma, waApiService) {
        this.prisma = prisma;
        this.waApiService = waApiService;
        this.logger = new common_1.Logger(WaTemplateService_1.name);
    }
    async syncFromMeta(wabaId) {
        const metaTemplates = await this.waApiService.getTemplates(wabaId);
        let added = 0;
        let updated = 0;
        for (const mt of metaTemplates) {
            const existing = await this.prisma.working.waTemplate.findFirst({
                where: { metaTemplateId: mt.id },
            });
            const headerComponent = mt.components?.find((c) => c.type === 'HEADER');
            const bodyComponent = mt.components?.find((c) => c.type === 'BODY');
            const footerComponent = mt.components?.find((c) => c.type === 'FOOTER');
            const buttonsComponent = mt.components?.find((c) => c.type === 'BUTTONS');
            const data = {
                name: mt.name,
                language: mt.language,
                category: this.mapCategory(mt.category),
                status: this.mapStatus(mt.status),
                headerType: headerComponent?.format || null,
                headerContent: headerComponent?.text || null,
                bodyText: bodyComponent?.text || '',
                footerText: footerComponent?.text || null,
                buttons: buttonsComponent?.buttons || null,
                lastSyncedAt: new Date(),
                rejectionReason: mt.rejected_reason || null,
            };
            if (existing) {
                await this.prisma.working.waTemplate.update({
                    where: { id: existing.id },
                    data,
                });
                updated++;
            }
            else {
                await this.prisma.working.waTemplate.create({
                    data: {
                        ...data,
                        wabaId,
                        metaTemplateId: mt.id,
                    },
                });
                added++;
            }
        }
        return { synced: metaTemplates.length, added, updated };
    }
    async createOnMeta(wabaId, templateData) {
        const components = [];
        if (templateData.headerType) {
            components.push({
                type: 'HEADER',
                format: templateData.headerType,
                text: templateData.headerContent,
            });
        }
        components.push({
            type: 'BODY',
            text: templateData.bodyText,
        });
        if (templateData.footerText) {
            components.push({ type: 'FOOTER', text: templateData.footerText });
        }
        if (templateData.buttons) {
            components.push({ type: 'BUTTONS', buttons: templateData.buttons });
        }
        const metaResult = await this.waApiService.createTemplate(wabaId, {
            name: templateData.name,
            language: templateData.language,
            category: templateData.category,
            components,
        });
        return this.prisma.working.waTemplate.create({
            data: {
                wabaId,
                metaTemplateId: metaResult.id,
                name: templateData.name,
                language: templateData.language,
                category: this.mapCategory(templateData.category),
                status: 'PENDING',
                headerType: templateData.headerType,
                headerContent: templateData.headerContent,
                bodyText: templateData.bodyText,
                footerText: templateData.footerText,
                buttons: templateData.buttons,
                variables: templateData.variables,
                sampleValues: templateData.sampleValues,
            },
        });
    }
    async deleteOnMeta(templateId) {
        const template = await this.prisma.working.waTemplate.findUniqueOrThrow({ where: { id: templateId } });
        await this.waApiService.deleteTemplate(template.wabaId, template.name);
        await this.prisma.working.waTemplate.update({
            where: { id: templateId },
            data: { status: 'DELETED' },
        });
    }
    mapCategory(category) {
        const map = {
            UTILITY: 'UTILITY',
            AUTHENTICATION: 'AUTHENTICATION',
            MARKETING: 'MARKETING',
        };
        return map[category] || 'UTILITY';
    }
    mapStatus(status) {
        const map = {
            APPROVED: 'APPROVED',
            PENDING: 'PENDING',
            REJECTED: 'REJECTED',
            PAUSED: 'PAUSED',
            DISABLED: 'DISABLED',
        };
        return map[status] || 'PENDING';
    }
};
exports.WaTemplateService = WaTemplateService;
exports.WaTemplateService = WaTemplateService = WaTemplateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wa_api_service_1.WaApiService])
], WaTemplateService);
//# sourceMappingURL=wa-template.service.js.map