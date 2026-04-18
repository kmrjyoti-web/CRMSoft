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
exports.NotificationTemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const industry_filter_util_1 = require("../../../../../common/utils/industry-filter.util");
let NotificationTemplateService = class NotificationTemplateService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async render(templateName, variables) {
        const template = await this.prisma.notificationTemplate.findFirst({
            where: { name: templateName },
        });
        if (!template || !template.isActive) {
            throw new common_1.NotFoundException(`Template "${templateName}" not found`);
        }
        const subject = this.interpolate(template.subject || '', variables);
        const body = this.interpolate(template.body, variables);
        return {
            subject,
            body,
            category: template.category,
            channels: template.channels,
        };
    }
    interpolate(text, variables) {
        return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
    }
    async create(data) {
        const existing = await this.prisma.notificationTemplate.findFirst({
            where: { name: data.name },
        });
        if (existing)
            throw new common_1.ConflictException(`Template "${data.name}" already exists`);
        return this.prisma.notificationTemplate.create({
            data: {
                name: data.name,
                category: data.category,
                subject: data.subject,
                body: data.body,
                channels: data.channels || ['IN_APP'],
                variables: data.variables || [],
            },
        });
    }
    async update(id, data) {
        const template = await this.prisma.notificationTemplate.findUnique({ where: { id } });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        return this.prisma.notificationTemplate.update({
            where: { id },
            data,
        });
    }
    async getAll(params) {
        const where = { ...(0, industry_filter_util_1.industryFilter)(params?.industryCode) };
        if (params?.category)
            where.category = params.category;
        if (params?.isActive !== undefined)
            where.isActive = params.isActive;
        return this.prisma.notificationTemplate.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }
    async getByName(name) {
        const template = await this.prisma.notificationTemplate.findFirst({ where: { name } });
        if (!template)
            throw new common_1.NotFoundException(`Template "${name}" not found`);
        return template;
    }
};
exports.NotificationTemplateService = NotificationTemplateService;
exports.NotificationTemplateService = NotificationTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationTemplateService);
//# sourceMappingURL=template.service.js.map