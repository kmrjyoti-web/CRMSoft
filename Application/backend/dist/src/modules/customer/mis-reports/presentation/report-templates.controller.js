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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const create_template_dto_1 = require("./dto/create-template.dto");
const update_template_dto_1 = require("./dto/update-template.dto");
let ReportTemplatesController = class ReportTemplatesController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId, tenantId) {
        let reportDefId;
        if (dto.reportCode) {
            const def = await this.prisma.working.reportDefinition.findFirst({
                where: { code: dto.reportCode, tenantId },
            });
            if (def)
                reportDefId = def.id;
        }
        const template = await this.prisma.working.reportTemplate.create({
            data: {
                tenantId,
                name: dto.name,
                description: dto.description,
                reportDefId,
                layout: dto.layout,
                dataSource: dto.dataSource ?? undefined,
                isPublic: dto.isPublic ?? false,
                createdById: userId,
            },
            include: { reportDef: true },
        });
        return api_response_1.ApiResponse.success(template, 'Report template created');
    }
    async list(userId, tenantId) {
        const templates = await this.prisma.working.reportTemplate.findMany({
            where: {
                tenantId,
                OR: [{ createdById: userId }, { isPublic: true }],
            },
            include: { reportDef: true },
            orderBy: { createdAt: 'desc' },
        });
        return api_response_1.ApiResponse.success(templates, 'Report templates retrieved');
    }
    async getById(id, tenantId) {
        const template = await this.prisma.working.reportTemplate.findFirst({
            where: { id, tenantId },
            include: { reportDef: true },
        });
        if (!template)
            throw new common_1.NotFoundException('Report template not found');
        return api_response_1.ApiResponse.success(template, 'Report template retrieved');
    }
    async update(id, dto, userId) {
        const existing = await this.prisma.working.reportTemplate.findFirst({
            where: { id, createdById: userId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Report template not found');
        const updated = await this.prisma.working.reportTemplate.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.layout !== undefined && { layout: dto.layout }),
                ...(dto.dataSource !== undefined && { dataSource: dto.dataSource }),
                ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
            },
            include: { reportDef: true },
        });
        return api_response_1.ApiResponse.success(updated, 'Report template updated');
    }
    async remove(id, userId) {
        const result = await this.prisma.working.reportTemplate.deleteMany({
            where: { id, createdById: userId },
        });
        if (result.count === 0)
            throw new common_1.NotFoundException('Report template not found');
        return api_response_1.ApiResponse.success(null, 'Report template deleted');
    }
};
exports.ReportTemplatesController = ReportTemplatesController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_template_dto_1.CreateTemplateDto, String, String]),
    __metadata("design:returntype", Promise)
], ReportTemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportTemplatesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportTemplatesController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_template_dto_1.UpdateTemplateDto, String]),
    __metadata("design:returntype", Promise)
], ReportTemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportTemplatesController.prototype, "remove", null);
exports.ReportTemplatesController = ReportTemplatesController = __decorate([
    (0, common_1.Controller)('mis-reports/templates'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportTemplatesController);
//# sourceMappingURL=report-templates.controller.js.map