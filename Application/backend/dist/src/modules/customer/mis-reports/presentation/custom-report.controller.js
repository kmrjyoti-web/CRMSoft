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
exports.CustomReportController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const report_engine_service_1 = require("../infrastructure/report-engine.service");
const custom_report_dto_1 = require("./dto/custom-report.dto");
let CustomReportController = class CustomReportController {
    constructor(reportEngine, prisma) {
        this.reportEngine = reportEngine;
        this.prisma = prisma;
    }
    async build(dto, user) {
        const params = {
            dateFrom: new Date(dto.dateFrom),
            dateTo: new Date(dto.dateTo),
            tenantId: user.tenantId,
            page: dto.page,
            limit: dto.limit,
            filters: {
                entity: dto.entity,
                columns: dto.columns,
                entityFilters: dto.entityFilters,
                groupByField: dto.groupByField,
                aggregations: dto.aggregations,
                sortByField: dto.sortByField,
                sortDirection: dto.sortDirection,
                chartType: dto.chartType,
            },
        };
        const data = await this.reportEngine.generate('CUSTOM_REPORT', params);
        return api_response_1.ApiResponse.success(data, 'Custom report generated');
    }
    async save(dto, userId) {
        const reportDef = await this.prisma.working.reportDefinition.findFirst({
            where: { code: 'CUSTOM_REPORT' },
        });
        if (!reportDef) {
            throw new common_1.NotFoundException('Custom report definition not found');
        }
        const bookmark = await this.prisma.working.reportBookmark.create({
            data: {
                reportDefId: reportDef.id,
                userId,
                name: dto.name,
                filters: {
                    entity: dto.entity,
                    columns: dto.columns,
                    entityFilters: dto.entityFilters,
                    groupByField: dto.groupByField,
                    aggregations: dto.aggregations,
                    sortByField: dto.sortByField,
                    sortDirection: dto.sortDirection,
                    chartType: dto.chartType,
                },
                isPinned: dto.isPinned ?? false,
            },
            include: { reportDef: true },
        });
        return api_response_1.ApiResponse.success(bookmark, 'Custom report saved as bookmark');
    }
};
exports.CustomReportController = CustomReportController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [custom_report_dto_1.CustomReportDto, Object]),
    __metadata("design:returntype", Promise)
], CustomReportController.prototype, "build", null);
__decorate([
    (0, common_1.Post)('save'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [custom_report_dto_1.SaveCustomReportDto, String]),
    __metadata("design:returntype", Promise)
], CustomReportController.prototype, "save", null);
exports.CustomReportController = CustomReportController = __decorate([
    (0, common_1.Controller)('mis-reports/custom'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [report_engine_service_1.ReportEngineService,
        prisma_service_1.PrismaService])
], CustomReportController);
//# sourceMappingURL=custom-report.controller.js.map