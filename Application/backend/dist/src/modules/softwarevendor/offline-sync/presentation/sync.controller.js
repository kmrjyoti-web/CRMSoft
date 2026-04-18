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
exports.SyncController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const sync_engine_service_1 = require("../services/sync-engine.service");
const pull_service_1 = require("../services/pull.service");
const push_service_1 = require("../services/push.service");
const conflict_resolver_service_1 = require("../services/conflict-resolver.service");
const flush_service_1 = require("../services/flush.service");
const pull_entity_dto_1 = require("./dto/pull-entity.dto");
const push_changes_dto_1 = require("./dto/push-changes.dto");
const register_device_dto_1 = require("./dto/register-device.dto");
const heartbeat_dto_1 = require("./dto/heartbeat.dto");
const resolve_conflict_dto_1 = require("./dto/resolve-conflict.dto");
let SyncController = class SyncController {
    constructor(syncEngine, pullService, pushService, conflictResolver, flushService) {
        this.syncEngine = syncEngine;
        this.pullService = pullService;
        this.pushService = pushService;
        this.conflictResolver = conflictResolver;
        this.flushService = flushService;
    }
    async getConfig(userId) {
        const config = await this.syncEngine.getConfig(userId);
        return api_response_1.ApiResponse.success(config, 'Sync config retrieved');
    }
    async getStatus(userId, deviceId) {
        const status = await this.syncEngine.getSyncStatus(userId, deviceId);
        return api_response_1.ApiResponse.success(status, 'Sync status retrieved');
    }
    async pullEntity(entityName, dto, userId) {
        const result = await this.pullService.pull({
            entityName,
            userId,
            deviceId: dto.deviceId,
            lastPulledAt: dto.lastPulledAt ? new Date(dto.lastPulledAt) : null,
            cursor: dto.cursor,
            limit: dto.limit,
        });
        return api_response_1.ApiResponse.success(result, `Pulled ${result.downloadedCount} ${entityName} records`);
    }
    async fullSync(body, userId) {
        const result = await this.pullService.fullSync(userId, body.deviceId);
        return api_response_1.ApiResponse.success(result, `Full sync complete: ${result.totalRecords} records`);
    }
    async push(dto, userId) {
        const result = await this.pushService.push({
            userId,
            deviceId: dto.deviceId,
            changes: dto.changes,
        });
        return api_response_1.ApiResponse.success(result, `Pushed ${result.totalProcessed} changes`);
    }
    async heartbeat(dto, userId, req) {
        await this.syncEngine.heartbeat(userId, dto.deviceId, {
            pendingUploadCount: dto.pendingUploadCount,
            storageUsedMb: dto.storageUsedMb,
            recordCounts: dto.recordCounts,
            entitySyncState: dto.entitySyncState,
        }, req.ip);
        return api_response_1.ApiResponse.success(null, 'Heartbeat recorded');
    }
    async registerDevice(dto, userId) {
        const device = await this.syncEngine.registerDevice(userId, dto);
        return api_response_1.ApiResponse.success(device, 'Device registered');
    }
    async removeDevice(deviceId, userId) {
        await this.syncEngine.removeDevice(userId, deviceId);
        return api_response_1.ApiResponse.success(null, 'Device removed');
    }
    async acknowledgeFlush(flushId, body) {
        await this.flushService.acknowledgeFlush(flushId, body.deviceId);
        return api_response_1.ApiResponse.success(null, 'Flush acknowledged');
    }
    async listConflicts(userId) {
        const conflicts = await this.conflictResolver.getPendingConflicts(userId);
        return api_response_1.ApiResponse.success(conflicts, 'Conflicts retrieved');
    }
    async getConflict(id) {
        const conflict = await this.conflictResolver.getConflictDetail(id);
        return api_response_1.ApiResponse.success(conflict, 'Conflict detail retrieved');
    }
    async resolveConflict(id, dto, userId) {
        await this.conflictResolver.manualResolve(id, {
            resolvedData: dto.resolvedData,
            userId,
        });
        return api_response_1.ApiResponse.success(null, 'Conflict resolved');
    }
};
exports.SyncController = SyncController;
__decorate([
    (0, common_1.Get)('config'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch sync policies, warning rules, and global settings' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sync status: warnings, enforcement, flush commands' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('pull/:entityName'),
    (0, swagger_1.ApiOperation)({ summary: 'Delta download — get records changed since lastPulledAt' }),
    __param(0, (0, common_1.Param)('entityName')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pull_entity_dto_1.PullEntityDto, String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "pullEntity", null);
__decorate([
    (0, common_1.Post)('pull/full'),
    (0, swagger_1.ApiOperation)({ summary: 'Full initial sync — download all enabled entities' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "fullSync", null);
__decorate([
    (0, common_1.Post)('push'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload offline changes (batch)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [push_changes_dto_1.PushChangesDto, String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "push", null);
__decorate([
    (0, common_1.Post)('heartbeat'),
    (0, swagger_1.ApiOperation)({ summary: 'Report device status to server' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [heartbeat_dto_1.HeartbeatDto, String, Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "heartbeat", null);
__decorate([
    (0, common_1.Post)('device/register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a device for sync' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_device_dto_1.RegisterDeviceDto, String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "registerDevice", null);
__decorate([
    (0, common_1.Delete)('device/:deviceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a device from sync' }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "removeDevice", null);
__decorate([
    (0, common_1.Post)('flush/:flushId/acknowledge'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm flush executed on device' }),
    __param(0, (0, common_1.Param)('flushId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "acknowledgeFlush", null);
__decorate([
    (0, common_1.Get)('conflicts'),
    (0, swagger_1.ApiOperation)({ summary: 'List pending conflicts for current user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "listConflicts", null);
__decorate([
    (0, common_1.Get)('conflicts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get conflict detail (side-by-side)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "getConflict", null);
__decorate([
    (0, common_1.Post)('conflicts/:id/resolve'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually resolve a conflict' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, resolve_conflict_dto_1.ResolveConflictDto, String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "resolveConflict", null);
exports.SyncController = SyncController = __decorate([
    (0, swagger_1.ApiTags)('Sync'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('sync'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [sync_engine_service_1.SyncEngineService,
        pull_service_1.PullService,
        push_service_1.PushService,
        conflict_resolver_service_1.ConflictResolverService,
        flush_service_1.FlushService])
], SyncController);
//# sourceMappingURL=sync.controller.js.map