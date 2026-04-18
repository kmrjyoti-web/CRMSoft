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
exports.MisReportsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const fs = require("fs");
const path = require("path");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const report_engine_service_1 = require("../infrastructure/report-engine.service");
const generate_report_dto_1 = require("./dto/generate-report.dto");
const export_report_dto_1 = require("./dto/export-report.dto");
const drill_down_dto_1 = require("./dto/drill-down.dto");
const query_exports_dto_1 = require("./dto/query-exports.dto");
let MisReportsController = class MisReportsController {
    constructor(reportEngine, prisma) {
        this.reportEngine = reportEngine;
        this.prisma = prisma;
    }
    async listDefinitions(category) {
        const definitions = this.reportEngine.getDefinitions(category);
        return api_response_1.ApiResponse.success(definitions, 'Report definitions retrieved');
    }
    async getDefinition(code) {
        const definition = this.reportEngine.getDefinition(code);
        return api_response_1.ApiResponse.success(definition, 'Report definition retrieved');
    }
    async generate(code, dto, user) {
        const params = {
            dateFrom: new Date(dto.dateFrom),
            dateTo: new Date(dto.dateTo),
            userId: dto.userId,
            groupBy: dto.groupBy,
            filters: dto.filters,
            comparePrevious: dto.comparePrevious,
        };
        const data = await this.reportEngine.generate(code, params);
        return api_response_1.ApiResponse.success(data, 'Report generated');
    }
    async exportReport(code, dto, user) {
        const params = {
            dateFrom: new Date(dto.dateFrom),
            dateTo: new Date(dto.dateTo),
            userId: dto.userId,
            groupBy: dto.groupBy,
            filters: dto.filters,
            comparePrevious: dto.comparePrevious,
        };
        const result = await this.reportEngine.export(code, params, dto.format, user.id, `${user.firstName} ${user.lastName}`, 'MANUAL');
        return api_response_1.ApiResponse.success(result, 'Report exported');
    }
    async drillDown(code, dto) {
        const drillParams = {
            reportCode: code,
            dimension: dto.dimension,
            value: dto.value,
            dateFrom: new Date(dto.dateFrom),
            dateTo: new Date(dto.dateTo),
            filters: dto.filters,
            page: dto.page || 1,
            limit: dto.limit || 20,
        };
        const result = await this.reportEngine.drillDown(code, drillParams);
        return api_response_1.ApiResponse.success(result, 'Drill-down data retrieved');
    }
    async getExports(dto, userId) {
        const where = { exportedById: userId };
        if (dto.reportCode)
            where.reportCode = dto.reportCode;
        if (dto.exportSource)
            where.exportSource = dto.exportSource;
        const page = dto.page || 1;
        const limit = dto.limit || 20;
        const [data, total] = await Promise.all([
            this.prisma.working.reportExportLog.findMany({
                where, skip: (page - 1) * limit, take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.working.reportExportLog.count({ where }),
        ]);
        return api_response_1.ApiResponse.paginated(data, total, page, limit);
    }
    async download(id, res) {
        const exportLog = await this.prisma.working.reportExportLog.findFirst({ where: { id } });
        if (!exportLog || !exportLog.fileUrl) {
            return res.status(404).json(api_response_1.ApiResponse.error('Export file not found'));
        }
        const filePath = path.isAbsolute(exportLog.fileUrl)
            ? exportLog.fileUrl
            : path.join(process.cwd(), 'uploads', exportLog.fileUrl);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json(api_response_1.ApiResponse.error('File not found on disk'));
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes = {
            '.csv': 'text/csv',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.pdf': 'application/pdf',
        };
        res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
        return fs.createReadStream(filePath).pipe(res);
    }
};
exports.MisReportsController = MisReportsController;
__decorate([
    (0, common_1.Get)('definitions'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MisReportsController.prototype, "listDefinitions", null);
__decorate([
    (0, common_1.Get)('definitions/:code'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MisReportsController.prototype, "getDefinition", null);
__decorate([
    (0, common_1.Post)('generate/:code'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, generate_report_dto_1.GenerateReportDto, Object]),
    __metadata("design:returntype", Promise)
], MisReportsController.prototype, "generate", null);
__decorate([
    (0, common_1.Post)('export/:code'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:export'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, export_report_dto_1.ExportReportDto, Object]),
    __metadata("design:returntype", Promise)
], MisReportsController.prototype, "exportReport", null);
__decorate([
    (0, common_1.Post)('drill-down/:code'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, drill_down_dto_1.DrillDownDto]),
    __metadata("design:returntype", Promise)
], MisReportsController.prototype, "drillDown", null);
__decorate([
    (0, common_1.Get)('exports'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_exports_dto_1.QueryExportsDto, String]),
    __metadata("design:returntype", Promise)
], MisReportsController.prototype, "getExports", null);
__decorate([
    (0, common_1.Get)('exports/:id/download'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MisReportsController.prototype, "download", null);
exports.MisReportsController = MisReportsController = __decorate([
    (0, common_1.Controller)('mis-reports'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [report_engine_service_1.ReportEngineService,
        prisma_service_1.PrismaService])
], MisReportsController);
//# sourceMappingURL=reports.controller.js.map