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
exports.DepartmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const api_response_1 = require("../../../../common/utils/api-response");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const create_department_dto_1 = require("./dto/create-department.dto");
const update_department_dto_1 = require("./dto/update-department.dto");
let DepartmentsController = class DepartmentsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const dept = await this.prisma.department.create({
            data: {
                name: dto.name,
                displayName: dto.displayName,
                code: dto.code.toUpperCase(),
                description: dto.description,
                level: dto.level ?? 0,
                parentId: dto.parentId,
                headUserId: dto.headUserId,
                path: await this.buildPath(dto.parentId, dto.code.toUpperCase()),
            },
        });
        return api_response_1.ApiResponse.success(dept, 'Department created');
    }
    async findAll(page = '1', limit = '20', search) {
        const p = Math.max(1, +page);
        const l = Math.min(100, Math.max(1, +limit));
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { displayName: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.department.findMany({
                where, skip: (p - 1) * l, take: l,
                orderBy: { name: 'asc' },
                include: { headUser: { select: { id: true, firstName: true, lastName: true } } },
            }),
            this.prisma.department.count({ where }),
        ]);
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
    async getTree() {
        const all = await this.prisma.department.findMany({
            where: { isActive: true },
            orderBy: { level: 'asc' },
            include: { headUser: { select: { id: true, firstName: true, lastName: true } } },
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
        return api_response_1.ApiResponse.success(roots, 'Department tree');
    }
    async findOne(id) {
        const dept = await this.prisma.department.findUniqueOrThrow({
            where: { id },
            include: {
                parent: true,
                children: true,
                headUser: { select: { id: true, firstName: true, lastName: true } },
                designations: { where: { isActive: true } },
            },
        });
        return api_response_1.ApiResponse.success(dept);
    }
    async update(id, dto) {
        const data = { ...dto };
        if (dto.code)
            data.code = dto.code.toUpperCase();
        if (dto.parentId !== undefined || dto.code) {
            const current = await this.prisma.department.findUniqueOrThrow({ where: { id } });
            const code = dto.code?.toUpperCase() ?? current.code;
            data.path = await this.buildPath(dto.parentId ?? current.parentId, code);
        }
        const dept = await this.prisma.department.update({ where: { id }, data });
        return api_response_1.ApiResponse.success(dept, 'Department updated');
    }
    async deactivate(id) {
        const dept = await this.prisma.department.update({
            where: { id }, data: { isActive: false },
        });
        return api_response_1.ApiResponse.success(dept, 'Department deactivated');
    }
    async setHead(id, userId) {
        const dept = await this.prisma.department.update({
            where: { id }, data: { headUserId: userId },
        });
        return api_response_1.ApiResponse.success(dept, 'Department head set');
    }
    async getUsers(id) {
        const users = await this.prisma.user.findMany({
            where: { departmentId: id },
            select: {
                id: true, firstName: true, lastName: true,
                email: true, status: true, designation: true,
            },
        });
        return api_response_1.ApiResponse.success(users);
    }
    async buildPath(parentId, code) {
        if (!parentId)
            return `/${code}`;
        const parent = await this.prisma.department.findUnique({ where: { id: parentId } });
        return parent?.path ? `${parent.path}/${code}` : `/${code}`;
    }
};
exports.DepartmentsController = DepartmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create department' }),
    (0, require_permissions_decorator_1.RequirePermissions)('departments:create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_department_dto_1.CreateDepartmentDto]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List departments' }),
    (0, require_permissions_decorator_1.RequirePermissions)('departments:read'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tree'),
    (0, swagger_1.ApiOperation)({ summary: 'Get department hierarchy tree' }),
    (0, require_permissions_decorator_1.RequirePermissions)('departments:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "getTree", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get department by ID' }),
    (0, require_permissions_decorator_1.RequirePermissions)('departments:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update department' }),
    (0, require_permissions_decorator_1.RequirePermissions)('departments:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_department_dto_1.UpdateDepartmentDto]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate department' }),
    (0, require_permissions_decorator_1.RequirePermissions)('departments:delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':id/set-head'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Set department head' }),
    (0, require_permissions_decorator_1.RequirePermissions)('departments:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "setHead", null);
__decorate([
    (0, common_1.Get)(':id/users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get users in department' }),
    (0, require_permissions_decorator_1.RequirePermissions)('departments:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "getUsers", null);
exports.DepartmentsController = DepartmentsController = __decorate([
    (0, swagger_1.ApiTags)('Departments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('departments'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DepartmentsController);
//# sourceMappingURL=departments.controller.js.map