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
exports.PermissionsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const list_permissions_query_1 = require("../application/queries/list-permissions/list-permissions.query");
const api_response_1 = require("../../../../../common/utils/api-response");
let PermissionsController = class PermissionsController {
    constructor(queryBus, prisma) {
        this.queryBus = queryBus;
        this.prisma = prisma;
    }
    async findAll(module, search) {
        const permissions = await this.queryBus.execute(new list_permissions_query_1.ListPermissionsQuery(module, search));
        return api_response_1.ApiResponse.success(permissions);
    }
    async getMatrix(req) {
        const tenantId = req.user?.tenantId;
        const where = {};
        if (tenantId) {
            const roles = await this.prisma.identity.role.findMany({
                where: { tenantId },
                select: { id: true },
            });
            const roleIds = roles.map((r) => r.id);
            where.roleId = { in: roleIds };
        }
        const rolePerms = await this.prisma.identity.rolePermission.findMany({
            where,
            select: { roleId: true, permissionId: true },
        });
        const matrix = {};
        for (const rp of rolePerms) {
            if (!matrix[rp.roleId])
                matrix[rp.roleId] = [];
            matrix[rp.roleId].push(rp.permissionId);
        }
        return api_response_1.ApiResponse.success(matrix);
    }
};
exports.PermissionsController = PermissionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List permissions (optionally filtered by module)' }),
    __param(0, (0, common_1.Query)('module')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('matrix'),
    (0, swagger_1.ApiOperation)({ summary: 'Get permission matrix (role ? permission IDs) for current tenant' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "getMatrix", null);
exports.PermissionsController = PermissionsController = __decorate([
    (0, swagger_1.ApiTags)('Permissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('permissions'),
    __metadata("design:paramtypes", [cqrs_1.QueryBus,
        prisma_service_1.PrismaService])
], PermissionsController);
//# sourceMappingURL=permissions.controller.js.map