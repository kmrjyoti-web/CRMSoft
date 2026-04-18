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
exports.ManufacturersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const api_response_1 = require("../../../../common/utils/api-response");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const create_manufacturer_dto_1 = require("./dto/create-manufacturer.dto");
const update_manufacturer_dto_1 = require("./dto/update-manufacturer.dto");
const link_manufacturer_dto_1 = require("./dto/link-manufacturer.dto");
let ManufacturersController = class ManufacturersController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const mfg = await this.prisma.working.manufacturer.create({
            data: { ...dto, code: dto.code.toUpperCase() },
        });
        return api_response_1.ApiResponse.success(mfg, 'Manufacturer created');
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
            this.prisma.working.manufacturer.findMany({
                where, skip: (p - 1) * l, take: l, orderBy: { name: 'asc' },
            }),
            this.prisma.working.manufacturer.count({ where }),
        ]);
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
    async findOne(id) {
        const mfg = await this.prisma.working.manufacturer.findUniqueOrThrow({
            where: { id },
            include: {
                manufacturerOrganizations: {
                    include: { organization: { select: { id: true, name: true } } },
                },
                manufacturerContacts: {
                    include: { contact: { select: { id: true, firstName: true, lastName: true } } },
                },
            },
        });
        return api_response_1.ApiResponse.success(mfg);
    }
    async update(id, dto) {
        const data = { ...dto };
        if (dto.code)
            data.code = dto.code.toUpperCase();
        const mfg = await this.prisma.working.manufacturer.update({ where: { id }, data });
        return api_response_1.ApiResponse.success(mfg, 'Manufacturer updated');
    }
    async deactivate(id) {
        const mfg = await this.prisma.working.manufacturer.update({
            where: { id }, data: { isActive: false },
        });
        return api_response_1.ApiResponse.success(mfg, 'Manufacturer deactivated');
    }
    async linkOrg(id, dto) {
        const existing = await this.prisma.working.manufacturerOrganization.findFirst({
            where: { manufacturerId: id, organizationId: dto.organizationId },
        });
        let link;
        if (existing) {
            link = await this.prisma.working.manufacturerOrganization.update({
                where: { id: existing.id },
                data: { isPrimary: dto.isPrimary, notes: dto.notes },
            });
        }
        else {
            link = await this.prisma.working.manufacturerOrganization.create({
                data: { manufacturerId: id, ...dto },
            });
        }
        return api_response_1.ApiResponse.success(link, 'Organization linked');
    }
    async unlinkOrg(id, orgId) {
        await this.prisma.working.manufacturerOrganization.deleteMany({
            where: { manufacturerId: id, organizationId: orgId },
        });
        return api_response_1.ApiResponse.success(null, 'Organization unlinked');
    }
    async linkContact(id, dto) {
        const existing = await this.prisma.working.manufacturerContact.findFirst({
            where: { manufacturerId: id, contactId: dto.contactId },
        });
        let link;
        if (existing) {
            link = await this.prisma.working.manufacturerContact.update({
                where: { id: existing.id },
                data: { role: dto.role, isPrimary: dto.isPrimary },
            });
        }
        else {
            link = await this.prisma.working.manufacturerContact.create({
                data: { manufacturerId: id, ...dto },
            });
        }
        return api_response_1.ApiResponse.success(link, 'Contact linked');
    }
    async unlinkContact(id, contactId) {
        await this.prisma.working.manufacturerContact.deleteMany({
            where: { manufacturerId: id, contactId },
        });
        return api_response_1.ApiResponse.success(null, 'Contact unlinked');
    }
    async getOrganizations(id) {
        const orgs = await this.prisma.working.manufacturerOrganization.findMany({
            where: { manufacturerId: id },
            include: { organization: { select: { id: true, name: true, city: true } } },
        });
        return api_response_1.ApiResponse.success(orgs);
    }
    async getContacts(id) {
        const contacts = await this.prisma.working.manufacturerContact.findMany({
            where: { manufacturerId: id },
            include: { contact: { select: { id: true, firstName: true, lastName: true } } },
        });
        return api_response_1.ApiResponse.success(contacts);
    }
};
exports.ManufacturersController = ManufacturersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create manufacturer' }),
    (0, require_permissions_decorator_1.RequirePermissions)('manufacturers:create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_manufacturer_dto_1.CreateManufacturerDto]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List manufacturers' }),
    (0, require_permissions_decorator_1.RequirePermissions)('manufacturers:read'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get manufacturer by ID' }),
    (0, require_permissions_decorator_1.RequirePermissions)('manufacturers:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update manufacturer' }),
    (0, require_permissions_decorator_1.RequirePermissions)('manufacturers:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_manufacturer_dto_1.UpdateManufacturerDto]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate manufacturer' }),
    (0, require_permissions_decorator_1.RequirePermissions)('manufacturers:delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':id/organizations'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Link manufacturer to organization' }),
    (0, require_permissions_decorator_1.RequirePermissions)('manufacturers:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, link_manufacturer_dto_1.LinkManufacturerOrganizationDto]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "linkOrg", null);
__decorate([
    (0, common_1.Delete)(':id/organizations/:orgId'),
    (0, swagger_1.ApiOperation)({ summary: 'Unlink manufacturer from organization' }),
    (0, require_permissions_decorator_1.RequirePermissions)('manufacturers:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('orgId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "unlinkOrg", null);
__decorate([
    (0, common_1.Post)(':id/contacts'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Link manufacturer to contact' }),
    (0, require_permissions_decorator_1.RequirePermissions)('manufacturers:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, link_manufacturer_dto_1.LinkManufacturerContactDto]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "linkContact", null);
__decorate([
    (0, common_1.Delete)(':id/contacts/:contactId'),
    (0, swagger_1.ApiOperation)({ summary: 'Unlink manufacturer from contact' }),
    (0, require_permissions_decorator_1.RequirePermissions)('manufacturers:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('contactId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "unlinkContact", null);
__decorate([
    (0, common_1.Get)(':id/organizations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get manufacturer organizations' }),
    (0, require_permissions_decorator_1.RequirePermissions)('manufacturers:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "getOrganizations", null);
__decorate([
    (0, common_1.Get)(':id/contacts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get manufacturer contacts' }),
    (0, require_permissions_decorator_1.RequirePermissions)('manufacturers:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ManufacturersController.prototype, "getContacts", null);
exports.ManufacturersController = ManufacturersController = __decorate([
    (0, swagger_1.ApiTags)('Manufacturers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('manufacturers'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ManufacturersController);
//# sourceMappingURL=manufacturers.controller.js.map