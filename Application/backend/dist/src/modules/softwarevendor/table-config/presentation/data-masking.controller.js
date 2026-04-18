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
exports.DataMaskingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const data_masking_service_1 = require("../services/data-masking.service");
const create_masking_policy_dto_1 = require("./dto/create-masking-policy.dto");
const unmask_request_dto_1 = require("./dto/unmask-request.dto");
let DataMaskingController = class DataMaskingController {
    constructor(service) {
        this.service = service;
    }
    async getRules(tableKey, userId, roleId, tenantId) {
        const rules = await this.service.getMaskingRules(tableKey, userId, roleId, tenantId);
        return api_response_1.ApiResponse.success(rules);
    }
    async listPolicies(tenantId, tableKey) {
        const policies = await this.service.listPolicies(tenantId, tableKey);
        return api_response_1.ApiResponse.success(policies);
    }
    async createPolicy(dto, tenantId) {
        const policy = await this.service.createPolicy(tenantId, dto);
        return api_response_1.ApiResponse.success(policy, 'Masking policy created');
    }
    async updatePolicy(id, dto) {
        const policy = await this.service.updatePolicy(id, dto);
        return api_response_1.ApiResponse.success(policy, 'Masking policy updated');
    }
    async deletePolicy(id) {
        const result = await this.service.deletePolicy(id);
        return api_response_1.ApiResponse.success(result, 'Masking policy deleted');
    }
    async unmask(dto, userId, tenantId) {
        const value = await this.service.getUnmaskedValue(dto.tableKey, dto.columnId, dto.recordId, userId, tenantId);
        return api_response_1.ApiResponse.success({ value }, 'Value unmasked');
    }
};
exports.DataMaskingController = DataMaskingController;
__decorate([
    (0, common_1.Get)(':tableKey'),
    (0, swagger_1.ApiOperation)({ summary: 'Get masking rules for current user on a table' }),
    __param(0, (0, common_1.Param)('tableKey')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('roleId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], DataMaskingController.prototype, "getRules", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all masking policies (admin only)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('data-masking:manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('tableKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DataMaskingController.prototype, "listPolicies", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create masking policy (admin only)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('data-masking:manage'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_masking_policy_dto_1.CreateMaskingPolicyDto, String]),
    __metadata("design:returntype", Promise)
], DataMaskingController.prototype, "createPolicy", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update masking policy (admin only)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('data-masking:manage'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_masking_policy_dto_1.UpdateMaskingPolicyDto]),
    __metadata("design:returntype", Promise)
], DataMaskingController.prototype, "updatePolicy", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete masking policy (admin only)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('data-masking:manage'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DataMaskingController.prototype, "deletePolicy", null);
__decorate([
    (0, common_1.Post)('unmask'),
    (0, swagger_1.ApiOperation)({ summary: 'Unmask a specific field value (logs audit trail)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [unmask_request_dto_1.UnmaskRequestDto, String, String]),
    __metadata("design:returntype", Promise)
], DataMaskingController.prototype, "unmask", null);
exports.DataMaskingController = DataMaskingController = __decorate([
    (0, swagger_1.ApiTags)('Data Masking'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('data-masking'),
    __metadata("design:paramtypes", [data_masking_service_1.DataMaskingService])
], DataMaskingController);
//# sourceMappingURL=data-masking.controller.js.map