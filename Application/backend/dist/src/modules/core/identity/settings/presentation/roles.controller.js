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
exports.RolesController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const list_roles_query_1 = require("../application/queries/list-roles/list-roles.query");
const get_role_query_1 = require("../application/queries/get-role/get-role.query");
const api_response_1 = require("../../../../../common/utils/api-response");
class CreateRoleDto {
}
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoleDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CreateRoleDto.prototype, "permissionIds", void 0);
class UpdateRoleDto {
}
__decorate([
    (0, swagger_2.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRoleDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRoleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], UpdateRoleDto.prototype, "permissionIds", void 0);
class UpdateRolePermissionsDto {
}
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], UpdateRolePermissionsDto.prototype, "permissionIds", void 0);
let RolesController = class RolesController {
    constructor(queryBus, prisma) {
        this.queryBus = queryBus;
        this.prisma = prisma;
    }
    async findAll(req, search) {
        const tenantId = req.user?.tenantId;
        const roles = await this.queryBus.execute(new list_roles_query_1.ListRolesQuery(tenantId, search));
        return api_response_1.ApiResponse.success(roles);
    }
    async findOne(id, req) {
        const tenantId = req.user?.tenantId;
        const role = await this.queryBus.execute(new get_role_query_1.GetRoleQuery(id, tenantId));
        return api_response_1.ApiResponse.success(role);
    }
    async create(dto) {
        const role = await this.prisma.identity.role.create({
            data: {
                name: dto.name,
                displayName: dto.displayName,
                description: dto.description,
                permissions: dto.permissionIds?.length
                    ? { create: dto.permissionIds.map((pid) => ({ permissionId: pid })) }
                    : undefined,
            },
            include: {
                permissions: { include: { permission: true } },
                _count: { select: { users: true } },
            },
        });
        const result = { ...role, permissions: role.permissions.map((rp) => rp.permission) };
        return api_response_1.ApiResponse.success(result, 'Role created');
    }
    async update(id, dto) {
        await this.prisma.identity.role.update({
            where: { id },
            data: {
                ...(dto.displayName !== undefined && { displayName: dto.displayName }),
                ...(dto.description !== undefined && { description: dto.description }),
            },
        });
        if (dto.permissionIds !== undefined) {
            await this.prisma.identity.rolePermission.deleteMany({ where: { roleId: id } });
            if (dto.permissionIds.length > 0) {
                await this.prisma.identity.rolePermission.createMany({
                    data: dto.permissionIds.map((pid) => ({ roleId: id, permissionId: pid })),
                });
            }
        }
        const role = await this.prisma.identity.role.findUniqueOrThrow({
            where: { id },
            include: {
                permissions: { include: { permission: true } },
                _count: { select: { users: true } },
            },
        });
        const result = { ...role, permissions: role.permissions.map((rp) => rp.permission) };
        return api_response_1.ApiResponse.success(result, 'Role updated');
    }
    async updatePermissions(req, id, dto) {
        const tenantId = req.user?.tenantId;
        const deleteWhere = { roleId: id };
        if (tenantId)
            deleteWhere.tenantId = tenantId;
        await this.prisma.identity.rolePermission.deleteMany({ where: deleteWhere });
        if (dto.permissionIds.length > 0) {
            await this.prisma.identity.rolePermission.createMany({
                data: dto.permissionIds.map((pid) => ({
                    roleId: id,
                    permissionId: pid,
                    ...(tenantId ? { tenantId } : {}),
                })),
            });
        }
        return api_response_1.ApiResponse.success({ roleId: id, permissionCount: dto.permissionIds.length }, 'Permissions updated');
    }
    async remove(id) {
        const role = await this.prisma.identity.role.findUniqueOrThrow({ where: { id } });
        if (role.isSystem) {
            throw new common_1.NotFoundException('Cannot delete system roles');
        }
        await this.prisma.identity.rolePermission.deleteMany({ where: { roleId: id } });
        await this.prisma.identity.role.delete({ where: { id } });
        return api_response_1.ApiResponse.success({ id }, 'Role deleted');
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all roles with user counts' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get role by ID with permissions' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new role' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateRoleDto]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update role (display name, description, permissions)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateRoleDto]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Update role permissions (replace all)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpdateRolePermissionsDto]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "updatePermissions", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a custom role' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "remove", null);
exports.RolesController = RolesController = __decorate([
    (0, swagger_1.ApiTags)('Roles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('roles'),
    __metadata("design:paramtypes", [cqrs_1.QueryBus,
        prisma_service_1.PrismaService])
], RolesController);
//# sourceMappingURL=roles.controller.js.map