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
exports.GitBranchesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const git_branches_service_1 = require("./git-branches.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateBranchDto {
    partnerId;
    branchType;
    parentBranch;
    suffix;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "partnerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.BranchType),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "branchType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "parentBranch", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "suffix", void 0);
class UpdateScopeDto {
    allowedScope;
    restrictedModules;
}
__decorate([
    (0, class_validator_1.IsEnum)(client_1.BranchScope),
    __metadata("design:type", String)
], UpdateScopeDto.prototype, "allowedScope", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateScopeDto.prototype, "restrictedModules", void 0);
let GitBranchesController = class GitBranchesController {
    gitBranchesService;
    constructor(gitBranchesService) {
        this.gitBranchesService = gitBranchesService;
    }
    create(dto) {
        return this.gitBranchesService.createBranch(dto);
    }
    list(partnerId) {
        return this.gitBranchesService.listBranches(partnerId);
    }
    getStatus(branchId) {
        return this.gitBranchesService.getBranchStatus(branchId);
    }
    mergeUpstream(branchId) {
        return this.gitBranchesService.mergeUpstream(branchId);
    }
    deleteBranch(branchId) {
        return this.gitBranchesService.deleteBranch(branchId);
    }
    updateScope(branchId, dto) {
        return this.gitBranchesService.updateScope(branchId, dto);
    }
};
exports.GitBranchesController = GitBranchesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateBranchDto]),
    __metadata("design:returntype", void 0)
], GitBranchesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':partnerId'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GitBranchesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':branchId/status'),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GitBranchesController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)(':branchId/merge-upstream'),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GitBranchesController.prototype, "mergeUpstream", null);
__decorate([
    (0, common_1.Delete)(':branchId'),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GitBranchesController.prototype, "deleteBranch", null);
__decorate([
    (0, common_1.Patch)(':branchId/scope'),
    __param(0, (0, common_1.Param)('branchId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateScopeDto]),
    __metadata("design:returntype", void 0)
], GitBranchesController.prototype, "updateScope", null);
exports.GitBranchesController = GitBranchesController = __decorate([
    (0, swagger_1.ApiTags)('git-branches'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)('git-branches'),
    __metadata("design:paramtypes", [git_branches_service_1.GitBranchesService])
], GitBranchesController);
//# sourceMappingURL=git-branches.controller.js.map