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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const soft_delete_user_command_1 = require("../application/commands/soft-delete-user/soft-delete-user.command");
const restore_user_command_1 = require("../application/commands/restore-user/restore-user.command");
const permanent_delete_user_command_1 = require("../application/commands/permanent-delete-user/permanent-delete-user.command");
const list_users_query_1 = require("../application/queries/list-users/list-users.query");
const get_user_query_1 = require("../application/queries/get-user/get-user.query");
const current_user_decorator_1 = require("../../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../../common/utils/api-response");
class UpdateUserDto {
}
__decorate([
    (0, swagger_2.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "designationId", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "status", void 0);
let UsersController = class UsersController {
    constructor(commandBus, queryBus, prisma) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.prisma = prisma;
    }
    async findAll(req, page, limit, search, status, userType, roleId) {
        const tenantId = req.user?.tenantId;
        const result = await this.queryBus.execute(new list_users_query_1.ListUsersQuery(tenantId, Number(page) || 1, Math.min(Number(limit) || 50, 10000), search, status, userType, roleId));
        return api_response_1.ApiResponse.success(result);
    }
    async findOne(id, req) {
        const tenantId = req.user?.tenantId;
        const user = await this.queryBus.execute(new get_user_query_1.GetUserQuery(id, tenantId));
        return api_response_1.ApiResponse.success(user);
    }
    async update(id, dto) {
        const data = {};
        if (dto.firstName !== undefined)
            data.firstName = dto.firstName;
        if (dto.lastName !== undefined)
            data.lastName = dto.lastName;
        if (dto.phone !== undefined)
            data.phone = dto.phone || null;
        if (dto.roleId !== undefined)
            data.roleId = dto.roleId;
        if (dto.departmentId !== undefined)
            data.departmentId = dto.departmentId || null;
        if (dto.designationId !== undefined)
            data.designationId = dto.designationId || null;
        if (dto.status !== undefined)
            data.status = dto.status;
        const user = await this.prisma.identity.user.update({
            where: { id },
            data,
            include: { role: true, department: true, designation: true },
        });
        return api_response_1.ApiResponse.success(user, 'User updated');
    }
    async softDelete(id, userId) {
        await this.commandBus.execute(new soft_delete_user_command_1.SoftDeleteUserCommand(id, userId));
        return api_response_1.ApiResponse.success({ id, isDeleted: true }, 'User soft-deleted');
    }
    async restore(id) {
        await this.commandBus.execute(new restore_user_command_1.RestoreUserCommand(id));
        return api_response_1.ApiResponse.success({ id, isDeleted: false }, 'User restored');
    }
    async permanentDelete(id) {
        await this.commandBus.execute(new permanent_delete_user_command_1.PermanentDeleteUserCommand(id));
        return api_response_1.ApiResponse.success({ id, deleted: true }, 'User permanently deleted');
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all users with role, department, designation' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('userType')),
    __param(6, (0, common_1.Query)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID with role, department, designation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile (name, phone, role, department, designation, status)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/soft-delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete user (mark as deleted, recoverable)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a soft-deleted user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':id/permanent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete a soft-deleted user (irreversible)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "permanentDelete", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        prisma_service_1.PrismaService])
], UsersController);
//# sourceMappingURL=users.controller.js.map