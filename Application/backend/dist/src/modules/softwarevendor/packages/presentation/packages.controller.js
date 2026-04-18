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
exports.PackagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const api_response_1 = require("../../../../common/utils/api-response");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const create_package_dto_1 = require("./dto/create-package.dto");
const update_package_dto_1 = require("./dto/update-package.dto");
let PackagesController = class PackagesController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const pkg = await this.prisma.platform.package.create({
            data: { ...dto, code: dto.code.toUpperCase() },
        });
        return api_response_1.ApiResponse.success(pkg, 'Package created');
    }
    async findAll(page = '1', limit = '20', search) {
        const p = Math.max(1, +page);
        const l = Math.min(100, Math.max(1, +limit));
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.platform.package.findMany({ where, skip: (p - 1) * l, take: l, orderBy: { name: 'asc' } }),
            this.prisma.platform.package.count({ where }),
        ]);
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
    async findOne(id) {
        const pkg = await this.prisma.platform.package.findUniqueOrThrow({ where: { id } });
        return api_response_1.ApiResponse.success(pkg);
    }
    async update(id, dto) {
        const data = { ...dto };
        if (dto.code)
            data.code = dto.code.toUpperCase();
        const pkg = await this.prisma.platform.package.update({ where: { id }, data });
        return api_response_1.ApiResponse.success(pkg, 'Package updated');
    }
    async deactivate(id) {
        const pkg = await this.prisma.platform.package.update({ where: { id }, data: { isActive: false } });
        return api_response_1.ApiResponse.success(pkg, 'Package deactivated');
    }
};
exports.PackagesController = PackagesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create package' }),
    (0, require_permissions_decorator_1.RequirePermissions)('packages:create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_package_dto_1.CreatePackageDto]),
    __metadata("design:returntype", Promise)
], PackagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List packages' }),
    (0, require_permissions_decorator_1.RequirePermissions)('packages:read'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], PackagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get package by ID' }),
    (0, require_permissions_decorator_1.RequirePermissions)('packages:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PackagesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update package' }),
    (0, require_permissions_decorator_1.RequirePermissions)('packages:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_package_dto_1.UpdatePackageDto]),
    __metadata("design:returntype", Promise)
], PackagesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate package' }),
    (0, require_permissions_decorator_1.RequirePermissions)('packages:delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PackagesController.prototype, "deactivate", null);
exports.PackagesController = PackagesController = __decorate([
    (0, swagger_1.ApiTags)('Packages'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('packages'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PackagesController);
//# sourceMappingURL=packages.controller.js.map