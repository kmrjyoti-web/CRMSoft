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
var ErrorReportController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorReportController = void 0;
const common_1 = require("@nestjs/common");
const escalation_service_1 = require("./escalation.service");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const common_2 = require("@nestjs/common");
const error_center_errors_1 = require("./error-center.errors");
let ErrorReportController = ErrorReportController_1 = class ErrorReportController {
    constructor(escalationService, db) {
        this.escalationService = escalationService;
        this.db = db;
        this.logger = new common_2.Logger(ErrorReportController_1.name);
    }
    async submitReport(body, userAgent) {
        try {
            const browserInfo = {
                ...(body.browserInfo ?? {}),
                userAgent: userAgent ?? 'unknown',
            };
            return await this.escalationService.submitCustomerReport({
                ...body,
                browserInfo,
            });
        }
        catch (error) {
            this.logger.error(`ErrorReportController.submitReport failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getMyReports(reportedBy, brandId, page, limit, status) {
        try {
            const take = Math.min(parseInt(limit ?? '20'), 100);
            const skip = (parseInt(page ?? '1') - 1) * take;
            const where = { reportedBy, brandId };
            if (status)
                where.status = status;
            const [items, total] = await Promise.all([
                this.db.customerErrorReport.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take,
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        errorCode: true,
                        createdAt: true,
                        resolvedAt: true,
                        escalatedAt: true,
                    },
                }),
                this.db.customerErrorReport.count({ where }),
            ]);
            return { items, total, page: parseInt(page ?? '1'), limit: take };
        }
        catch (error) {
            this.logger.error(`ErrorReportController.getMyReports failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getReport(id) {
        try {
            const report = await this.db.customerErrorReport.findUnique({
                where: { id },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    errorCode: true,
                    screenshots: true,
                    status: true,
                    createdAt: true,
                    resolvedAt: true,
                    escalatedAt: true,
                },
            });
            if (!report) {
                throw new common_2.NotFoundException(error_center_errors_1.ERROR_CENTER_ERRORS.REPORT_NOT_FOUND.message);
            }
            return report;
        }
        catch (error) {
            this.logger.error(`ErrorReportController.getReport failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ErrorReportController = ErrorReportController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ErrorReportController.prototype, "submitReport", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Query)('reportedBy')),
    __param(1, (0, common_1.Query)('brandId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ErrorReportController.prototype, "getMyReports", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ErrorReportController.prototype, "getReport", null);
exports.ErrorReportController = ErrorReportController = ErrorReportController_1 = __decorate([
    (0, common_1.Controller)('errors/report'),
    __metadata("design:paramtypes", [escalation_service_1.EscalationService,
        platform_console_prisma_service_1.PlatformConsolePrismaService])
], ErrorReportController);
//# sourceMappingURL=error-report.controller.js.map