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
exports.SyncAdminController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const working_client_1 = require("@prisma/working-client");
const api_response_1 = require("../../../../common/utils/api-response");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const sync_engine_service_1 = require("../services/sync-engine.service");
const flush_service_1 = require("../services/flush.service");
const sync_analytics_service_1 = require("../services/sync-analytics.service");
const update_policy_dto_1 = require("./dto/update-policy.dto");
const create_warning_rule_dto_1 = require("./dto/create-warning-rule.dto");
const update_warning_rule_dto_1 = require("./dto/update-warning-rule.dto");
const issue_flush_dto_1 = require("./dto/issue-flush.dto");
const sync_query_dto_1 = require("./dto/sync-query.dto");
let SyncAdminController = class SyncAdminController {
    constructor(prisma, syncEngine, flushService, analyticsService) {
        this.prisma = prisma;
        this.syncEngine = syncEngine;
        this.flushService = flushService;
        this.analyticsService = analyticsService;
    }
    async listPolicies() {
        const policies = await this.prisma.working.syncPolicy.findMany({
            include: { warningRules: true },
            orderBy: { syncPriority: 'asc' },
        });
        return api_response_1.ApiResponse.success(policies, 'Sync policies retrieved');
    }
    async getPolicy(id) {
        const policy = await this.prisma.working.syncPolicy.findUnique({
            where: { id },
            include: { warningRules: true },
        });
        return api_response_1.ApiResponse.success(policy, 'Policy retrieved');
    }
    async updatePolicy(id, dto, user) {
        const policy = await this.prisma.working.syncPolicy.update({
            where: { id },
            data: {
                ...(dto.direction !== undefined && { direction: dto.direction }),
                ...(dto.syncIntervalMinutes !== undefined && { syncIntervalMinutes: dto.syncIntervalMinutes }),
                ...(dto.maxRowsOffline !== undefined && { maxRowsOffline: dto.maxRowsOffline }),
                ...(dto.maxStorageMb !== undefined && { maxStorageMb: dto.maxStorageMb }),
                ...(dto.maxDataAgeDays !== undefined && { maxDataAgeDays: dto.maxDataAgeDays }),
                ...(dto.conflictStrategy !== undefined && { conflictStrategy: dto.conflictStrategy }),
                ...(dto.downloadScope !== undefined && { downloadScope: dto.downloadScope }),
                ...(dto.downloadFilter !== undefined && { downloadFilter: dto.downloadFilter === null ? working_client_1.Prisma.JsonNull : dto.downloadFilter }),
                ...(dto.syncPriority !== undefined && { syncPriority: dto.syncPriority }),
                ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
                updatedById: user.id,
                updatedByName: `${user.firstName} ${user.lastName}`,
            },
        });
        return api_response_1.ApiResponse.success(policy, 'Policy updated');
    }
    async togglePolicy(id, user) {
        const existing = await this.prisma.working.syncPolicy.findUnique({ where: { id } });
        const policy = await this.prisma.working.syncPolicy.update({
            where: { id },
            data: {
                isEnabled: !existing?.isEnabled,
                updatedById: user.id,
                updatedByName: `${user.firstName} ${user.lastName}`,
            },
        });
        return api_response_1.ApiResponse.success(policy, `Policy ${policy.isEnabled ? 'enabled' : 'disabled'}`);
    }
    async createWarningRule(dto) {
        const rule = await this.prisma.working.syncWarningRule.create({
            data: {
                policyId: dto.policyId,
                name: dto.name,
                description: dto.description,
                trigger: dto.trigger,
                thresholdValue: dto.thresholdValue,
                thresholdUnit: dto.thresholdUnit,
                level1Action: dto.level1Action || 'WARN_ONLY',
                level1Threshold: dto.level1Threshold,
                level1Message: dto.level1Message,
                level2Action: dto.level2Action,
                level2Threshold: dto.level2Threshold,
                level2Message: dto.level2Message,
                level2DelayMinutes: dto.level2DelayMinutes,
                level3Action: dto.level3Action,
                level3Threshold: dto.level3Threshold,
                level3Message: dto.level3Message,
                appliesToRoles: dto.appliesToRoles || [],
                appliesToUsers: dto.appliesToUsers || [],
                priority: dto.priority || 5,
            },
        });
        return api_response_1.ApiResponse.success(rule, 'Warning rule created');
    }
    async listWarningRules() {
        const rules = await this.prisma.working.syncWarningRule.findMany({
            include: { policy: true },
            orderBy: { priority: 'asc' },
        });
        return api_response_1.ApiResponse.success(rules, 'Warning rules retrieved');
    }
    async updateWarningRule(id, dto) {
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.trigger !== undefined)
            updateData.trigger = dto.trigger;
        if (dto.thresholdValue !== undefined)
            updateData.thresholdValue = dto.thresholdValue;
        if (dto.thresholdUnit !== undefined)
            updateData.thresholdUnit = dto.thresholdUnit;
        if (dto.level1Action !== undefined)
            updateData.level1Action = dto.level1Action;
        if (dto.level1Threshold !== undefined)
            updateData.level1Threshold = dto.level1Threshold;
        if (dto.level1Message !== undefined)
            updateData.level1Message = dto.level1Message;
        if (dto.level2Action !== undefined)
            updateData.level2Action = dto.level2Action;
        if (dto.level2Threshold !== undefined)
            updateData.level2Threshold = dto.level2Threshold;
        if (dto.level2Message !== undefined)
            updateData.level2Message = dto.level2Message;
        if (dto.level2DelayMinutes !== undefined)
            updateData.level2DelayMinutes = dto.level2DelayMinutes;
        if (dto.level3Action !== undefined)
            updateData.level3Action = dto.level3Action;
        if (dto.level3Threshold !== undefined)
            updateData.level3Threshold = dto.level3Threshold;
        if (dto.level3Message !== undefined)
            updateData.level3Message = dto.level3Message;
        if (dto.appliesToRoles !== undefined)
            updateData.appliesToRoles = dto.appliesToRoles;
        if (dto.appliesToUsers !== undefined)
            updateData.appliesToUsers = dto.appliesToUsers;
        if (dto.priority !== undefined)
            updateData.priority = dto.priority;
        if (dto.isEnabled !== undefined)
            updateData.isEnabled = dto.isEnabled;
        const rule = await this.prisma.working.syncWarningRule.update({
            where: { id },
            data: updateData,
        });
        return api_response_1.ApiResponse.success(rule, 'Warning rule updated');
    }
    async deleteWarningRule(id) {
        await this.prisma.working.syncWarningRule.delete({ where: { id } });
        return api_response_1.ApiResponse.success(null, 'Warning rule deleted');
    }
    async issueFlush(dto, user) {
        const command = await this.flushService.issueFlush({
            flushType: dto.flushType,
            targetUserId: dto.targetUserId,
            targetDeviceId: dto.targetDeviceId,
            targetEntity: dto.targetEntity,
            reason: dto.reason,
            redownloadAfter: dto.redownloadAfter,
            issuedById: user.id,
            issuedByName: `${user.firstName} ${user.lastName}`,
        });
        return api_response_1.ApiResponse.success(command, 'Flush command issued');
    }
    async listFlushCommands(targetUserId, status) {
        const result = await this.flushService.getFlushCommands({ targetUserId, status });
        return api_response_1.ApiResponse.success(result.data, 'Flush commands retrieved');
    }
    async listDevices(userId, status) {
        const devices = await this.syncEngine.getDevices({ userId, status });
        return api_response_1.ApiResponse.success(devices, 'Devices retrieved');
    }
    async blockDevice(id) {
        await this.syncEngine.blockDevice(id);
        return api_response_1.ApiResponse.success(null, 'Device blocked');
    }
    async getDashboard() {
        const dashboard = await this.analyticsService.getDashboard();
        return api_response_1.ApiResponse.success(dashboard, 'Sync dashboard retrieved');
    }
    async getAuditLog(query) {
        const result = await this.analyticsService.getAuditLog({
            userId: query.userId,
            deviceId: query.deviceId,
            action: query.action,
            entityName: query.entityName,
            dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
            dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
            page: query.page,
            limit: query.limit,
        });
        return api_response_1.ApiResponse.paginated(result.data, result.total, query.page || 1, query.limit || 20);
    }
    async getAnalytics(dateFrom, dateTo) {
        const analytics = await this.analyticsService.getAnalytics(dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
        return api_response_1.ApiResponse.success(analytics, 'Sync analytics retrieved');
    }
};
exports.SyncAdminController = SyncAdminController;
__decorate([
    (0, common_1.Get)('policies'),
    (0, swagger_1.ApiOperation)({ summary: 'List all sync policies' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncAdminController.prototype, "listPolicies", null);
__decorate([
    (0, common_1.Get)('policies/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get policy detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SyncAdminController.prototype, "getPolicy", null);
__decorate([
    (0, common_1.Put)('policies/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sync policy (direction, frequency, limits)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_policy_dto_1.UpdatePolicyDto, Object]),
    __metadata("design:returntype", Promise)
], SyncAdminController.prototype, "updatePolicy", null);
__decorate([
    (0, common_1.Post)('policies/:id/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Enable or disable entity sync' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SyncAdminController.prototype, "togglePolicy", null);
__decorate([
    (0, common_1.Post)('warning-rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a warning rule' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_warning_rule_dto_1.CreateWarningRuleDto]),
    __metadata("design:returntype", Promise)
], SyncAdminController.prototype, "createWarningRule", null);
__decorate([
    (0, common_1.Get)('warning-rules'),
    (0, swagger_1.ApiOperation)({ summary: 'List warning rules' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncAdminController.prototype, "listWarningRules", null);
__decorate([
    (0, common_1.Put)('warning-rules/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a warning rule' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_warning_rule_dto_1.UpdateWarningRuleDto]),
    __metadata("design:returntype", Promise)
], SyncAdminController.prototype, "updateWarningRule", null);
__decorate([
    (0, common_1.Delete)('warning-rules/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a warning rule' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SyncAdminController.prototype, "deleteWarningRule", null);
__decorate([
    (0, common_1.Post)('flush'),
    (0, swagger_1.ApiOperation)({ summary: 'Issue a remote flush command' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [issue_flush_dto_1.IssueFlushDto, Object]),
    __metadata("design:returntype", Promise)
], SyncAdminController.prototype, "issueFlush", null);
__decorate([
    (0, common_1.Get)('flush-commands'),
    (0, swagger_1.ApiOperation)({ summary: 'List flush command history' }),
    __param(0, (0, common_1.Query)('targetUserId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SyncAdminController.prototype, "listFlushCommands", null);
__decorate([
    (0, common_1.Get)('devices'),
    (0, swagger_1.ApiOperation)({ summary: 'List all devices and their sync status' }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SyncAdminController.prototype, "listDevices", null);
__decorate([
    (0, common_1.Post)('devices/:id/block'),
    (0, swagger_1.ApiOperation)({ summary: 'Block a device from syncing' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SyncAdminController.prototype, "blockDevice", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Sync health overview dashboard' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncAdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('audit'),
    (0, swagger_1.ApiOperation)({ summary: 'Sync audit log' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sync_query_dto_1.SyncQueryDto]),
    __metadata("design:returntype", Promise)
], SyncAdminController.prototype, "getAuditLog", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Sync frequency, conflict rates, performance metrics' }),
    __param(0, (0, common_1.Query)('dateFrom')),
    __param(1, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SyncAdminController.prototype, "getAnalytics", null);
exports.SyncAdminController = SyncAdminController = __decorate([
    (0, swagger_1.ApiTags)('Sync Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/sync'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sync_engine_service_1.SyncEngineService,
        flush_service_1.FlushService,
        sync_analytics_service_1.SyncAnalyticsService])
], SyncAdminController);
//# sourceMappingURL=sync-admin.controller.js.map