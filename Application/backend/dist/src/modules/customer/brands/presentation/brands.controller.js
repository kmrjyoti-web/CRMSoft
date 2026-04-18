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
exports.BrandsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const api_response_1 = require("../../../../common/utils/api-response");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const create_brand_dto_1 = require("./dto/create-brand.dto");
const update_brand_dto_1 = require("./dto/update-brand.dto");
const link_brand_dto_1 = require("./dto/link-brand.dto");
let BrandsController = class BrandsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const brand = await this.prisma.working.brand.create({
            data: { ...dto, code: dto.code.toUpperCase() },
        });
        return api_response_1.ApiResponse.success(brand, 'Brand created');
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
            this.prisma.working.brand.findMany({ where, skip: (p - 1) * l, take: l, orderBy: { name: 'asc' } }),
            this.prisma.working.brand.count({ where }),
        ]);
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
    async findOne(id) {
        const brand = await this.prisma.working.brand.findUniqueOrThrow({
            where: { id },
            include: {
                brandOrganizations: { include: { organization: { select: { id: true, name: true } } } },
                brandContacts: { include: { contact: { select: { id: true, firstName: true, lastName: true } } } },
            },
        });
        return api_response_1.ApiResponse.success(brand);
    }
    async update(id, dto) {
        const data = { ...dto };
        if (dto.code)
            data.code = dto.code.toUpperCase();
        const brand = await this.prisma.working.brand.update({ where: { id }, data });
        return api_response_1.ApiResponse.success(brand, 'Brand updated');
    }
    async deactivate(id) {
        const brand = await this.prisma.working.brand.update({ where: { id }, data: { isActive: false } });
        return api_response_1.ApiResponse.success(brand, 'Brand deactivated');
    }
    async linkOrganization(id, dto) {
        const existing = await this.prisma.working.brandOrganization.findFirst({
            where: { brandId: id, organizationId: dto.organizationId },
        });
        let link;
        if (existing) {
            link = await this.prisma.working.brandOrganization.update({
                where: { id: existing.id },
                data: { isPrimary: dto.isPrimary, notes: dto.notes },
            });
        }
        else {
            link = await this.prisma.working.brandOrganization.create({
                data: { brandId: id, ...dto },
            });
        }
        return api_response_1.ApiResponse.success(link, 'Organization linked');
    }
    async unlinkOrganization(id, orgId) {
        await this.prisma.working.brandOrganization.deleteMany({
            where: { brandId: id, organizationId: orgId },
        });
        return api_response_1.ApiResponse.success(null, 'Organization unlinked');
    }
    async linkContact(id, dto) {
        const existing = await this.prisma.working.brandContact.findFirst({
            where: { brandId: id, contactId: dto.contactId },
        });
        let link;
        if (existing) {
            link = await this.prisma.working.brandContact.update({
                where: { id: existing.id },
                data: { role: dto.role, isPrimary: dto.isPrimary },
            });
        }
        else {
            link = await this.prisma.working.brandContact.create({
                data: { brandId: id, ...dto },
            });
        }
        return api_response_1.ApiResponse.success(link, 'Contact linked');
    }
    async unlinkContact(id, contactId) {
        await this.prisma.working.brandContact.deleteMany({
            where: { brandId: id, contactId },
        });
        return api_response_1.ApiResponse.success(null, 'Contact unlinked');
    }
    async getOrganizations(id) {
        const orgs = await this.prisma.working.brandOrganization.findMany({
            where: { brandId: id },
            include: { organization: { select: { id: true, name: true, city: true } } },
        });
        return api_response_1.ApiResponse.success(orgs);
    }
    async getContacts(id) {
        const contacts = await this.prisma.working.brandContact.findMany({
            where: { brandId: id },
            include: { contact: { select: { id: true, firstName: true, lastName: true } } },
        });
        return api_response_1.ApiResponse.success(contacts);
    }
};
exports.BrandsController = BrandsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create brand' }),
    (0, require_permissions_decorator_1.RequirePermissions)('brands:create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_brand_dto_1.CreateBrandDto]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List brands' }),
    (0, require_permissions_decorator_1.RequirePermissions)('brands:read'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get brand by ID' }),
    (0, require_permissions_decorator_1.RequirePermissions)('brands:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update brand' }),
    (0, require_permissions_decorator_1.RequirePermissions)('brands:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_brand_dto_1.UpdateBrandDto]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate brand' }),
    (0, require_permissions_decorator_1.RequirePermissions)('brands:delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':id/organizations'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Link brand to organization' }),
    (0, require_permissions_decorator_1.RequirePermissions)('brands:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, link_brand_dto_1.LinkBrandOrganizationDto]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "linkOrganization", null);
__decorate([
    (0, common_1.Delete)(':id/organizations/:orgId'),
    (0, swagger_1.ApiOperation)({ summary: 'Unlink brand from organization' }),
    (0, require_permissions_decorator_1.RequirePermissions)('brands:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('orgId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "unlinkOrganization", null);
__decorate([
    (0, common_1.Post)(':id/contacts'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Link brand to contact' }),
    (0, require_permissions_decorator_1.RequirePermissions)('brands:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, link_brand_dto_1.LinkBrandContactDto]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "linkContact", null);
__decorate([
    (0, common_1.Delete)(':id/contacts/:contactId'),
    (0, swagger_1.ApiOperation)({ summary: 'Unlink brand from contact' }),
    (0, require_permissions_decorator_1.RequirePermissions)('brands:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('contactId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "unlinkContact", null);
__decorate([
    (0, common_1.Get)(':id/organizations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get brand organizations' }),
    (0, require_permissions_decorator_1.RequirePermissions)('brands:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "getOrganizations", null);
__decorate([
    (0, common_1.Get)(':id/contacts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get brand contacts' }),
    (0, require_permissions_decorator_1.RequirePermissions)('brands:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "getContacts", null);
exports.BrandsController = BrandsController = __decorate([
    (0, swagger_1.ApiTags)('Brands'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('brands'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BrandsController);
//# sourceMappingURL=brands.controller.js.map