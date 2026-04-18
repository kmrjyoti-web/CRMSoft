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
exports.ProfileController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const audit_skip_decorator_1 = require("../../../core/identity/audit/decorators/audit-skip.decorator");
const create_profile_command_1 = require("../application/commands/create-profile/create-profile.command");
const update_profile_command_1 = require("../application/commands/update-profile/update-profile.command");
const delete_profile_command_1 = require("../application/commands/delete-profile/delete-profile.command");
const clone_profile_command_1 = require("../application/commands/clone-profile/clone-profile.command");
const get_profile_list_query_1 = require("../application/queries/get-profile-list/get-profile-list.query");
const get_profile_detail_query_1 = require("../application/queries/get-profile-detail/get-profile-detail.query");
const profile_dto_1 = require("./dto/profile.dto");
let ProfileController = class ProfileController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, user) {
        const result = await this.commandBus.execute(new create_profile_command_1.CreateProfileCommand(dto.name, dto.targetEntity, dto.fieldMapping, dto.expectedHeaders, user.id, `${user.firstName || ''} ${user.lastName || ''}`.trim(), dto.description, dto.sourceSystem, dto.icon, dto.color, dto.defaultValues, dto.validationRules, dto.duplicateCheckFields, dto.duplicateStrategy, dto.fuzzyMatchEnabled, dto.fuzzyMatchFields, dto.fuzzyThreshold));
        return api_response_1.ApiResponse.success(result, 'Profile created');
    }
    async list(q) {
        const result = await this.queryBus.execute(new get_profile_list_query_1.GetProfileListQuery(q.targetEntity, q.status, +q.page, +q.limit));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async detail(id) {
        const result = await this.queryBus.execute(new get_profile_detail_query_1.GetProfileDetailQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async update(id, dto) {
        const result = await this.commandBus.execute(new update_profile_command_1.UpdateProfileCommand(id, dto));
        return api_response_1.ApiResponse.success(result, 'Profile updated');
    }
    async archive(id) {
        const result = await this.commandBus.execute(new delete_profile_command_1.DeleteProfileCommand(id));
        return api_response_1.ApiResponse.success(result, 'Profile archived');
    }
    async clone(id, dto, user) {
        const result = await this.commandBus.execute(new clone_profile_command_1.CloneProfileCommand(id, dto.newName, user.id, `${user.firstName || ''} ${user.lastName || ''}`.trim()));
        return api_response_1.ApiResponse.success(result, 'Profile cloned');
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('import:write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [profile_dto_1.CreateProfileDto, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('import:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "detail", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/clone'),
    (0, require_permissions_decorator_1.RequirePermissions)('import:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, profile_dto_1.CloneProfileDto, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "clone", null);
exports.ProfileController = ProfileController = __decorate([
    (0, common_1.Controller)('import/profiles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, audit_skip_decorator_1.AuditSkip)(),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], ProfileController);
//# sourceMappingURL=profile.controller.js.map