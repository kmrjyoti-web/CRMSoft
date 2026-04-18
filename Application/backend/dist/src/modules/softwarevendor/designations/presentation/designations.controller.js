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
exports.DesignationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const api_response_1 = require("../../../../common/utils/api-response");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const create_designation_dto_1 = require("./dto/create-designation.dto");
const update_designation_dto_1 = require("./dto/update-designation.dto");
let DesignationsController = class DesignationsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const desig = await this.prisma.designation.create({
            data: {
                name: dto.name,
                code: dto.code.toUpperCase(),
                description: dto.description,
                level: dto.level ?? 0,
                grade: dto.grade,
                departmentId: dto.departmentId,
                parentId: dto.parentId,
            },
        });
        return api_response_1.ApiResponse.success(desig, 'Designation created');
    }
    async findAll(page = '1', limit = '20', departmentId, search) {
        const p = Math.max(1, +page);
        const l = Math.min(100, Math.max(1, +limit));
        const where = {};
        if (departmentId)
            where.departmentId = departmentId;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.designation.findMany({
                where, skip: (p - 1) * l, take: l,
                orderBy: { level: 'asc' },
                include: { department: { select: { id: true, name: true } } },
            }),
            this.prisma.designation.count({ where }),
        ]);
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
    async getTree(departmentId) {
        const where = { isActive: true };
        if (departmentId)
            where.departmentId = departmentId;
        const all = await this.prisma.designation.findMany({
            where, orderBy: { level: 'asc' },
        });
        const map = new Map(all.map(d => [d.id, { ...d, children: [] }]));
        const roots = [];
        for (const d of map.values()) {
            if (d.parentId && map.has(d.parentId)) {
                map.get(d.parentId).children.push(d);
            }
            else {
                roots.push(d);
            }
        }
        return api_response_1.ApiResponse.success(roots, 'Designation tree');
    }
    async findOne(id) {
        const desig = await this.prisma.designation.findUniqueOrThrow({
            where: { id },
            include: { department: true, parent: true, children: true },
        });
        return api_response_1.ApiResponse.success(desig);
    }
    async update(id, dto) {
        const data = { ...dto };
        if (dto.code)
            data.code = dto.code.toUpperCase();
        const desig = await this.prisma.designation.update({ where: { id }, data });
        return api_response_1.ApiResponse.success(desig, 'Designation updated');
    }
    async deactivate(id) {
        const desig = await this.prisma.designation.update({
            where: { id }, data: { isActive: false },
        });
        return api_response_1.ApiResponse.success(desig, 'Designation deactivated');
    }
    async getUsers(id) {
        const users = await this.prisma.user.findMany({
            where: { designationId: id },
            select: {
                id: true, firstName: true, lastName: true,
                email: true, status: true,
            },
        });
        return api_response_1.ApiResponse.success(users);
    }
};
exports.DesignationsController = DesignationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create designation' }),
    (0, require_permissions_decorator_1.RequirePermissions)('designations:create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_designation_dto_1.CreateDesignationDto]),
    __metadata("design:returntype", Promise)
], DesignationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List designations' }),
    (0, require_permissions_decorator_1.RequirePermissions)('designations:read'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('departmentId')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], DesignationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tree'),
    (0, swagger_1.ApiOperation)({ summary: 'Get designation hierarchy' }),
    (0, require_permissions_decorator_1.RequirePermissions)('designations:read'),
    __param(0, (0, common_1.Query)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DesignationsController.prototype, "getTree", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get designation by ID' }),
    (0, require_permissions_decorator_1.RequirePermissions)('designations:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DesignationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update designation' }),
    (0, require_permissions_decorator_1.RequirePermissions)('designations:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_designation_dto_1.UpdateDesignationDto]),
    __metadata("design:returntype", Promise)
], DesignationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate designation' }),
    (0, require_permissions_decorator_1.RequirePermissions)('designations:delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DesignationsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Get)(':id/users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get users with this designation' }),
    (0, require_permissions_decorator_1.RequirePermissions)('designations:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DesignationsController.prototype, "getUsers", null);
exports.DesignationsController = DesignationsController = __decorate([
    (0, swagger_1.ApiTags)('Designations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('designations'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DesignationsController);
//# sourceMappingURL=designations.controller.js.map