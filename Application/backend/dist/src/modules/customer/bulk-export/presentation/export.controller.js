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
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const audit_skip_decorator_1 = require("../../../core/identity/audit/decorators/audit-skip.decorator");
const export_service_1 = require("../services/export.service");
const export_dto_1 = require("./dto/export.dto");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const path = require("path");
const fs = require("fs");
let ExportController = class ExportController {
    constructor(exportService, prisma) {
        this.exportService = exportService;
        this.prisma = prisma;
    }
    async create(dto, user) {
        const result = await this.exportService.createExport({
            targetEntity: dto.targetEntity,
            format: dto.format || 'xlsx',
            filters: dto.filters,
            columns: dto.columns,
            createdById: user.id,
            createdByName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        });
        return api_response_1.ApiResponse.success(result, 'Export started');
    }
    async list(q) {
        const page = +q.page || 1;
        const limit = +q.limit || 20;
        const [data, total] = await Promise.all([
            this.prisma.working.exportJob.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.working.exportJob.count(),
        ]);
        return api_response_1.ApiResponse.paginated(data, total, page, limit);
    }
    async download(jobId, res) {
        const job = await this.prisma.working.exportJob.findUniqueOrThrow({ where: { id: jobId } });
        if (!job.fileUrl)
            return res.status(404).json(api_response_1.ApiResponse.error('File not ready'));
        const filePath = path.join(process.cwd(), 'uploads', job.fileUrl);
        if (!fs.existsSync(filePath))
            return res.status(404).json(api_response_1.ApiResponse.error('File not found'));
        return res.download(filePath);
    }
    async template(entityType, res) {
        const buffer = await this.exportService.generateTemplate(entityType);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${entityType.toLowerCase()}-template.xlsx`);
        res.send(buffer);
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('export:write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [export_dto_1.CreateExportDto, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('jobs'),
    (0, require_permissions_decorator_1.RequirePermissions)('export:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':jobId/download'),
    (0, require_permissions_decorator_1.RequirePermissions)('export:read'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "download", null);
__decorate([
    (0, common_1.Get)('template/:entityType'),
    (0, require_permissions_decorator_1.RequirePermissions)('export:read'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "template", null);
exports.ExportController = ExportController = __decorate([
    (0, common_1.Controller)('export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, audit_skip_decorator_1.AuditSkip)(),
    __metadata("design:paramtypes", [export_service_1.ExportService,
        prisma_service_1.PrismaService])
], ExportController);
//# sourceMappingURL=export.controller.js.map