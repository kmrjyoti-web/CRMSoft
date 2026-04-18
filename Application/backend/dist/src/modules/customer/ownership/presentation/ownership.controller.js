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
exports.OwnershipController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const passport_1 = require("@nestjs/passport");
const api_response_1 = require("../../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const assign_owner_command_1 = require("../application/commands/assign-owner/assign-owner.command");
const transfer_owner_command_1 = require("../application/commands/transfer-owner/transfer-owner.command");
const revoke_owner_command_1 = require("../application/commands/revoke-owner/revoke-owner.command");
const delegate_ownership_command_1 = require("../application/commands/delegate-ownership/delegate-ownership.command");
const revert_delegation_command_1 = require("../application/commands/revert-delegation/revert-delegation.command");
const bulk_assign_command_1 = require("../application/commands/bulk-assign/bulk-assign.command");
const bulk_transfer_command_1 = require("../application/commands/bulk-transfer/bulk-transfer.command");
const get_entity_owners_query_1 = require("../application/queries/get-entity-owners/get-entity-owners.query");
const get_user_entities_query_1 = require("../application/queries/get-user-entities/get-user-entities.query");
const get_ownership_history_query_1 = require("../application/queries/get-ownership-history/get-ownership-history.query");
const get_unassigned_entities_query_1 = require("../application/queries/get-unassigned-entities/get-unassigned-entities.query");
const get_reassignment_preview_query_1 = require("../application/queries/get-reassignment-preview/get-reassignment-preview.query");
const get_delegation_status_query_1 = require("../application/queries/get-delegation-status/get-delegation-status.query");
const assign_owner_dto_1 = require("./dto/assign-owner.dto");
const transfer_owner_dto_1 = require("./dto/transfer-owner.dto");
const delegate_ownership_dto_1 = require("./dto/delegate-ownership.dto");
const bulk_assign_dto_1 = require("./dto/bulk-assign.dto");
const bulk_transfer_dto_1 = require("./dto/bulk-transfer.dto");
const ownership_core_service_1 = require("../services/ownership-core.service");
const pagination_dto_1 = require("../../../../common/dto/pagination.dto");
let OwnershipController = class OwnershipController {
    constructor(commandBus, queryBus, ownershipCore) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.ownershipCore = ownershipCore;
    }
    async assign(dto, userId) {
        const result = await this.commandBus.execute(new assign_owner_command_1.AssignOwnerCommand(dto.entityType, dto.entityId, dto.userId, dto.ownerType, userId, dto.reason, dto.reasonDetail, dto.method, dto.validFrom ? new Date(dto.validFrom) : undefined, dto.validTo ? new Date(dto.validTo) : undefined));
        return api_response_1.ApiResponse.success(result, 'Owner assigned');
    }
    async transfer(dto, userId) {
        const result = await this.commandBus.execute(new transfer_owner_command_1.TransferOwnerCommand(dto.entityType, dto.entityId, dto.fromUserId, dto.toUserId, dto.ownerType, userId, dto.reason, dto.reasonDetail));
        return api_response_1.ApiResponse.success(result, 'Ownership transferred');
    }
    async revoke(dto, userId) {
        await this.commandBus.execute(new revoke_owner_command_1.RevokeOwnerCommand(dto.entityType, dto.entityId, dto.userId, dto.ownerType, userId, dto.reason));
        return api_response_1.ApiResponse.success(null, 'Ownership revoked');
    }
    async delegate(dto, userId) {
        const result = await this.commandBus.execute(new delegate_ownership_command_1.DelegateOwnershipCommand(dto.fromUserId, dto.toUserId, new Date(dto.startDate), new Date(dto.endDate), dto.reason, userId, dto.entityType));
        return api_response_1.ApiResponse.success(result, 'Ownership delegated');
    }
    async revertDelegation(id, userId) {
        const result = await this.commandBus.execute(new revert_delegation_command_1.RevertDelegationCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Delegation reverted');
    }
    async bulkAssign(dto, userId) {
        const result = await this.commandBus.execute(new bulk_assign_command_1.BulkAssignCommand(dto.entityType, dto.entityIds, dto.userId, dto.ownerType, dto.reason, userId));
        return api_response_1.ApiResponse.success(result, 'Bulk assignment complete');
    }
    async bulkTransfer(dto, userId) {
        const result = await this.commandBus.execute(new bulk_transfer_command_1.BulkTransferCommand(dto.fromUserId, dto.toUserId, userId, dto.reason, dto.reasonDetail, dto.entityType));
        return api_response_1.ApiResponse.success(result, 'Bulk transfer complete');
    }
    async getEntityOwners(entityType, entityId) {
        const result = await this.queryBus.execute(new get_entity_owners_query_1.GetEntityOwnersQuery(entityType, entityId));
        return api_response_1.ApiResponse.success(result);
    }
    async getUserEntities(userId, query) {
        const result = await this.queryBus.execute(new get_user_entities_query_1.GetUserEntitiesQuery(userId, query.entityType, query.ownerType));
        return api_response_1.ApiResponse.success(result);
    }
    async getHistory(entityType, entityId, query) {
        const result = await this.queryBus.execute(new get_ownership_history_query_1.GetOwnershipHistoryQuery(entityType, entityId, query.page, query.limit));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getUnassigned(query) {
        const result = await this.queryBus.execute(new get_unassigned_entities_query_1.GetUnassignedEntitiesQuery(query.entityType || 'LEAD', query.page, query.limit));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getReassignmentPreview(fromUserId, query) {
        const result = await this.queryBus.execute(new get_reassignment_preview_query_1.GetReassignmentPreviewQuery(fromUserId, query.toUserId, query.entityType));
        return api_response_1.ApiResponse.success(result);
    }
    async getMyEntities(userId, query) {
        const result = await this.queryBus.execute(new get_user_entities_query_1.GetUserEntitiesQuery(userId, query.entityType, query.ownerType));
        return api_response_1.ApiResponse.success(result);
    }
    async getStats() {
        const result = await this.ownershipCore.getUserEntities({ userId: '', isActive: true });
        return api_response_1.ApiResponse.success(result.summary);
    }
    async getRecentChanges(query) {
        const result = await this.ownershipCore.getHistory({ entityType: '', entityId: '', page: query.page, limit: query.limit });
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getDelegationStatus(query) {
        const result = await this.queryBus.execute(new get_delegation_status_query_1.GetDelegationStatusQuery(query.userId, query.isActive === 'true'));
        return api_response_1.ApiResponse.success(result);
    }
};
exports.OwnershipController = OwnershipController;
__decorate([
    (0, common_1.Post)('assign'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_owner_dto_1.AssignOwnerDto, String]),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transfer_owner_dto_1.TransferOwnerDto, String]),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "transfer", null);
__decorate([
    (0, common_1.Post)('revoke'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:delete'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_owner_dto_1.AssignOwnerDto, String]),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "revoke", null);
__decorate([
    (0, common_1.Post)('delegate'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delegate_ownership_dto_1.DelegateOwnershipDto, String]),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "delegate", null);
__decorate([
    (0, common_1.Post)('revert-delegation/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "revertDelegation", null);
__decorate([
    (0, common_1.Post)('bulk-assign'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_assign_dto_1.BulkAssignDto, String]),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "bulkAssign", null);
__decorate([
    (0, common_1.Post)('bulk-transfer'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_transfer_dto_1.BulkTransferDto, String]),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "bulkTransfer", null);
__decorate([
    (0, common_1.Get)('entity/:entityType/:entityId'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:read'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "getEntityOwners", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:read'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "getUserEntities", null);
__decorate([
    (0, common_1.Get)('history/:entityType/:entityId'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:read'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('unassigned'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "getUnassigned", null);
__decorate([
    (0, common_1.Get)('reassignment-preview/:fromUserId'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:read'),
    __param(0, (0, common_1.Param)('fromUserId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "getReassignmentPreview", null);
__decorate([
    (0, common_1.Get)('my-entities'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "getMyEntities", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('recent-changes'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "getRecentChanges", null);
__decorate([
    (0, common_1.Get)('delegation-status'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OwnershipController.prototype, "getDelegationStatus", null);
exports.OwnershipController = OwnershipController = __decorate([
    (0, common_1.Controller)('ownership'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        ownership_core_service_1.OwnershipCoreService])
], OwnershipController);
//# sourceMappingURL=ownership.controller.js.map