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
exports.TestErrorController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const test_error_analyzer_service_1 = require("../infrastructure/services/test-error-analyzer.service");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let TestErrorController = class TestErrorController {
    constructor(errorAnalyzer, prisma) {
        this.errorAnalyzer = errorAnalyzer;
        this.prisma = prisma;
    }
    async getDashboard(user, days) {
        const data = await this.errorAnalyzer.getErrorDashboard(user?.tenantId ?? null, days);
        return api_response_1.ApiResponse.success(data);
    }
    async listErrors(testRunId, category, severity, isResolved, page = 1, limit = 20) {
        const where = {};
        if (testRunId)
            where.testRunId = testRunId;
        if (category)
            where.errorCategory = category;
        if (severity)
            where.severity = severity;
        if (isResolved !== undefined)
            where.isResolved = isResolved === 'true';
        const [data, total] = await Promise.all([
            this.prisma.platform.testErrorLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.platform.testErrorLog.count({ where }),
        ]);
        return api_response_1.ApiResponse.success({ data, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
    }
    async getError(id) {
        const error = await this.prisma.platform.testErrorLog.findUnique({
            where: { id },
            include: { testRun: { select: { id: true, status: true, createdAt: true } } },
        });
        return api_response_1.ApiResponse.success(error);
    }
    async reportToVendor(id, context) {
        await this.errorAnalyzer.reportToVendor(id, context);
        return api_response_1.ApiResponse.success({ reported: true });
    }
    async resolveError(id, user, resolution) {
        await this.errorAnalyzer.markResolved(id, user?.id ?? 'system', resolution ?? 'Resolved');
        return api_response_1.ApiResponse.success({ resolved: true });
    }
    async generateFromRun(testRunId) {
        const count = await this.errorAnalyzer.persistRunErrors(testRunId);
        return api_response_1.ApiResponse.success({ generated: count });
    }
};
exports.TestErrorController = TestErrorController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('days', new common_1.DefaultValuePipe(30), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], TestErrorController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('testRunId')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('severity')),
    __param(3, (0, common_1.Query)('isResolved')),
    __param(4, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(5, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], TestErrorController.prototype, "listErrors", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestErrorController.prototype, "getError", null);
__decorate([
    (0, common_1.Post)(':id/report'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('context')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TestErrorController.prototype, "reportToVendor", null);
__decorate([
    (0, common_1.Patch)(':id/resolve'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('resolution')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], TestErrorController.prototype, "resolveError", null);
__decorate([
    (0, common_1.Post)('generate/:testRunId'),
    __param(0, (0, common_1.Param)('testRunId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestErrorController.prototype, "generateFromRun", null);
exports.TestErrorController = TestErrorController = __decorate([
    (0, common_1.Controller)('ops/test-error'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_permissions_decorator_1.RequirePermissions)('ops:manage'),
    __metadata("design:paramtypes", [test_error_analyzer_service_1.TestErrorAnalyzerService,
        prisma_service_1.PrismaService])
], TestErrorController);
//# sourceMappingURL=test-error.controller.js.map