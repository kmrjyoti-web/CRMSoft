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
exports.LocationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const api_response_1 = require("../../../../common/utils/api-response");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const create_location_dto_1 = require("./dto/create-location.dto");
const update_location_dto_1 = require("./dto/update-location.dto");
let LocationsController = class LocationsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const loc = await this.prisma.businessLocation.create({
            data: {
                name: dto.name,
                code: dto.code.toUpperCase(),
                level: dto.level,
                parentId: dto.parentId,
                latitude: dto.latitude,
                longitude: dto.longitude,
            },
        });
        return api_response_1.ApiResponse.success(loc, 'Location created');
    }
    async findAll(page = '1', limit = '50', level, parentId, search) {
        const p = Math.max(1, +page);
        const l = Math.min(200, Math.max(1, +limit));
        const where = {};
        if (level)
            where.level = level;
        if (parentId)
            where.parentId = parentId;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.businessLocation.findMany({
                where, skip: (p - 1) * l, take: l,
                orderBy: { name: 'asc' },
            }),
            this.prisma.businessLocation.count({ where }),
        ]);
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
    async getTree(rootCode) {
        const where = { isActive: true };
        if (rootCode) {
            const root = await this.prisma.businessLocation.findFirst({
                where: { code: rootCode.toUpperCase() },
            });
            if (root)
                where.OR = [{ id: root.id }, { parentId: root.id }];
        }
        const all = await this.prisma.businessLocation.findMany({
            where: rootCode ? undefined : where,
            orderBy: [{ level: 'asc' }, { name: 'asc' }],
        });
        const map = new Map(all.map(l => [l.id, { ...l, children: [] }]));
        const roots = [];
        for (const loc of map.values()) {
            if (loc.parentId && map.has(loc.parentId)) {
                map.get(loc.parentId).children.push(loc);
            }
            else {
                roots.push(loc);
            }
        }
        return api_response_1.ApiResponse.success(roots, 'Location tree');
    }
    async getCountries() {
        const countries = await this.prisma.businessLocation.findMany({
            where: { level: 'COUNTRY', isActive: true },
            orderBy: { name: 'asc' },
        });
        return api_response_1.ApiResponse.success(countries);
    }
    async findOne(id) {
        const loc = await this.prisma.businessLocation.findUniqueOrThrow({
            where: { id },
            include: { parent: true, children: { where: { isActive: true } } },
        });
        return api_response_1.ApiResponse.success(loc);
    }
    async getChildren(id) {
        const children = await this.prisma.businessLocation.findMany({
            where: { parentId: id, isActive: true },
            orderBy: { name: 'asc' },
        });
        return api_response_1.ApiResponse.success(children);
    }
    async update(id, dto) {
        const data = { ...dto };
        if (dto.code)
            data.code = dto.code.toUpperCase();
        const loc = await this.prisma.businessLocation.update({ where: { id }, data });
        return api_response_1.ApiResponse.success(loc, 'Location updated');
    }
    async deactivate(id) {
        const loc = await this.prisma.businessLocation.update({
            where: { id }, data: { isActive: false },
        });
        return api_response_1.ApiResponse.success(loc, 'Location deactivated');
    }
    async linkOrganization(id, organizationId, isPrimary) {
        const existing = await this.prisma.organizationLocation.findFirst({
            where: { organizationId, locationId: id },
        });
        let link;
        if (existing) {
            link = await this.prisma.organizationLocation.update({
                where: { id: existing.id },
                data: { isPrimary },
            });
        }
        else {
            link = await this.prisma.organizationLocation.create({
                data: { organizationId, locationId: id, isPrimary: isPrimary ?? false },
            });
        }
        return api_response_1.ApiResponse.success(link, 'Organization linked to location');
    }
    async unlinkOrganization(id, orgId) {
        await this.prisma.organizationLocation.deleteMany({
            where: { organizationId: orgId, locationId: id },
        });
        return api_response_1.ApiResponse.success(null, 'Organization unlinked');
    }
};
exports.LocationsController = LocationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create location' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_location_dto_1.CreateLocationDto]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List locations' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:read'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('level')),
    __param(3, (0, common_1.Query)('parentId')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tree'),
    (0, swagger_1.ApiOperation)({ summary: 'Get location hierarchy (Country ? State ? City ? Area)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:read'),
    __param(0, (0, common_1.Query)('rootCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getTree", null);
__decorate([
    (0, common_1.Get)('countries'),
    (0, swagger_1.ApiOperation)({ summary: 'List all countries' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getCountries", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get location by ID' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/children'),
    (0, swagger_1.ApiOperation)({ summary: 'Get child locations' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getChildren", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update location' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_location_dto_1.UpdateLocationDto]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate location' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':id/organizations'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Link organization to location' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('organizationId')),
    __param(2, (0, common_1.Body)('isPrimary')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "linkOrganization", null);
__decorate([
    (0, common_1.Delete)(':id/organizations/:orgId'),
    (0, swagger_1.ApiOperation)({ summary: 'Unlink organization from location' }),
    (0, require_permissions_decorator_1.RequirePermissions)('locations:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('orgId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "unlinkOrganization", null);
exports.LocationsController = LocationsController = __decorate([
    (0, swagger_1.ApiTags)('Business Locations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('business-locations'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LocationsController);
//# sourceMappingURL=locations.controller.js.map