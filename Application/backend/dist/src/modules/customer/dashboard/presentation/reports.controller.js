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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const export_report_dto_1 = require("./dto/export-report.dto");
const export_report_command_1 = require("../application/commands/export-report/export-report.command");
const get_report_exports_query_1 = require("../application/queries/get-report-exports/get-report-exports.query");
const fs = require("fs");
const path = require("path");
let ReportsController = class ReportsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async exportReport(dto, user) {
        const result = await this.commandBus.execute(new export_report_command_1.ExportReportCommand(dto.reportType, dto.format, { dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : undefined, dateTo: dto.dateTo ? new Date(dto.dateTo) : undefined, userId: dto.userId, status: dto.status }, user.id, `${user.firstName} ${user.lastName}`));
        return api_response_1.ApiResponse.success(result, 'Report generated');
    }
    async exportHistory(userId, page, limit) {
        const result = await this.queryBus.execute(new get_report_exports_query_1.GetReportExportsQuery(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20));
        return api_response_1.ApiResponse.success(result);
    }
    async download(id, res) {
        const log = await this.queryBus.execute(new get_report_exports_query_1.GetReportExportsQuery(id));
        if (log?.data?.[0]?.fileUrl && fs.existsSync(log.data[0].fileUrl)) {
            const filePath = log.data[0].fileUrl;
            const ext = path.extname(filePath);
            const contentTypes = {
                '.csv': 'text/csv', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                '.json': 'application/json', '.pdf': 'application/pdf',
            };
            res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
            fs.createReadStream(filePath).pipe(res);
        }
        else {
            res.status(404).json(api_response_1.ApiResponse.error('File not found'));
        }
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Post)('export'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:export'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [export_report_dto_1.ExportReportDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportReport", null);
__decorate([
    (0, common_1.Get)('exports'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportHistory", null);
__decorate([
    (0, common_1.Get)('exports/:id/download'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "download", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, cqrs_1.QueryBus])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map