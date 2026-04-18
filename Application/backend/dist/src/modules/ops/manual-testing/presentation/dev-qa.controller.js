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
exports.DevQAController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const dev_qa_notion_service_1 = require("../services/dev-qa-notion.service");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let DevQAController = class DevQAController {
    constructor(devQAService, prisma) {
        this.devQAService = devQAService;
        this.prisma = prisma;
    }
    async generatePlan(user, name, modules) {
        const result = await this.devQAService.generateModuleTestPlan(name ?? `Dev QA Plan � ${new Date().toLocaleDateString()}`, modules, user.id, user.tenantId);
        return api_response_1.ApiResponse.success(result);
    }
    async syncToNotion(planId, user) {
        const result = await this.devQAService.syncToNotion(planId, user.tenantId);
        return api_response_1.ApiResponse.success(result);
    }
    async pullFromNotion(planId, user) {
        const result = await this.devQAService.pullFromNotion(planId, user.tenantId);
        return api_response_1.ApiResponse.success(result);
    }
    async getDashboard(user) {
        const [plans, totalItems, passedItems, failedItems] = await Promise.all([
            this.prisma.platform.testPlan.findMany({
                where: { tenantId: user.tenantId },
                select: { id: true, name: true, status: true, progress: true, totalItems: true, passedItems: true, failedItems: true, notionSyncedAt: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
            this.prisma.platform.testPlanItem.count({ where: { plan: { tenantId: user.tenantId } } }),
            this.prisma.platform.testPlanItem.count({ where: { plan: { tenantId: user.tenantId }, status: 'PASSED' } }),
            this.prisma.platform.testPlanItem.count({ where: { plan: { tenantId: user.tenantId }, status: 'FAILED' } }),
        ]);
        return api_response_1.ApiResponse.success({
            plans,
            stats: {
                totalItems,
                passedItems,
                failedItems,
                notStarted: totalItems - passedItems - failedItems,
                overallPassRate: totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 0,
            },
        });
    }
    async listPlans(user, page = 1, limit = 20) {
        const [data, total] = await Promise.all([
            this.prisma.platform.testPlan.findMany({
                where: { tenantId: user.tenantId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true, name: true, description: true, status: true, progress: true,
                    totalItems: true, passedItems: true, failedItems: true,
                    notionPageId: true, notionSyncedAt: true, createdAt: true,
                },
            }),
            this.prisma.platform.testPlan.count({ where: { tenantId: user.tenantId } }),
        ]);
        return api_response_1.ApiResponse.success({ data, meta: { total, page, limit } });
    }
};
exports.DevQAController = DevQAController;
__decorate([
    (0, common_1.Post)('generate-plan'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Body)('modules')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Array]),
    __metadata("design:returntype", Promise)
], DevQAController.prototype, "generatePlan", null);
__decorate([
    (0, common_1.Post)(':planId/sync-notion'),
    __param(0, (0, common_1.Param)('planId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DevQAController.prototype, "syncToNotion", null);
__decorate([
    (0, common_1.Post)(':planId/pull-notion'),
    __param(0, (0, common_1.Param)('planId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DevQAController.prototype, "pullFromNotion", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevQAController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('plans'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DevQAController.prototype, "listPlans", null);
exports.DevQAController = DevQAController = __decorate([
    (0, common_1.Controller)('ops/dev-qa'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_permissions_decorator_1.RequirePermissions)('ops:manage'),
    __metadata("design:paramtypes", [dev_qa_notion_service_1.DevQANotionService,
        prisma_service_1.PrismaService])
], DevQAController);
//# sourceMappingURL=dev-qa.controller.js.map