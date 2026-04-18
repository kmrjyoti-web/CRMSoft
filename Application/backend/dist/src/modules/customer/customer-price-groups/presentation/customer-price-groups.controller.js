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
exports.CustomerPriceGroupsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const api_response_1 = require("../../../../common/utils/api-response");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const customer_price_group_dto_1 = require("./dto/customer-price-group.dto");
let CustomerPriceGroupsController = class CustomerPriceGroupsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const group = await this.prisma.working.customerPriceGroup.create({
            data: {
                name: dto.name,
                code: dto.code.toUpperCase(),
                description: dto.description,
                discount: dto.discount,
                priority: dto.priority ?? 0,
            },
        });
        return api_response_1.ApiResponse.success(group, 'Price group created');
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
            this.prisma.working.customerPriceGroup.findMany({
                where, skip: (p - 1) * l, take: l,
                orderBy: { priority: 'desc' },
            }),
            this.prisma.working.customerPriceGroup.count({ where }),
        ]);
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
    async findOne(id) {
        const group = await this.prisma.working.customerPriceGroup.findUniqueOrThrow({
            where: { id },
            include: {
                _count: { select: { customers: true, prices: true } },
            },
        });
        return api_response_1.ApiResponse.success(group);
    }
    async update(id, dto) {
        const data = { ...dto };
        if (dto.code)
            data.code = dto.code.toUpperCase();
        const group = await this.prisma.working.customerPriceGroup.update({
            where: { id }, data,
        });
        return api_response_1.ApiResponse.success(group, 'Price group updated');
    }
    async deactivate(id) {
        const group = await this.prisma.working.customerPriceGroup.update({
            where: { id }, data: { isActive: false },
        });
        return api_response_1.ApiResponse.success(group, 'Price group deactivated');
    }
    async addMember(id, dto) {
        const uniqueWhere = dto.contactId
            ? { priceGroupId_contactId: { priceGroupId: id, contactId: dto.contactId } }
            : { priceGroupId_organizationId: { priceGroupId: id, organizationId: dto.organizationId } };
        const mapping = await this.prisma.working.customerGroupMapping.upsert({
            where: uniqueWhere,
            create: {
                priceGroupId: id,
                contactId: dto.contactId,
                organizationId: dto.organizationId,
                isActive: true,
            },
            update: { isActive: true },
        });
        return api_response_1.ApiResponse.success(mapping, 'Member added to price group');
    }
    async removeMember(_id, mappingId) {
        await this.prisma.working.customerGroupMapping.delete({
            where: { id: mappingId },
        });
        return api_response_1.ApiResponse.success(null, 'Member removed from price group');
    }
    async listMembers(id, page = '1', limit = '20') {
        const p = Math.max(1, +page);
        const l = Math.min(100, Math.max(1, +limit));
        const where = { priceGroupId: id };
        const [data, total] = await Promise.all([
            this.prisma.working.customerGroupMapping.findMany({
                where, skip: (p - 1) * l, take: l,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.working.customerGroupMapping.count({ where }),
        ]);
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
};
exports.CustomerPriceGroupsController = CustomerPriceGroupsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create price group' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_price_group_dto_1.CreatePriceGroupDto]),
    __metadata("design:returntype", Promise)
], CustomerPriceGroupsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List price groups' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], CustomerPriceGroupsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get price group with counts' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerPriceGroupsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update price group' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_price_group_dto_1.UpdatePriceGroupDto]),
    __metadata("design:returntype", Promise)
], CustomerPriceGroupsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate price group' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerPriceGroupsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Add customer/org to price group' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_price_group_dto_1.AddMemberDto]),
    __metadata("design:returntype", Promise)
], CustomerPriceGroupsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)(':id/members/:mappingId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove member from price group' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('mappingId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomerPriceGroupsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Get)(':id/members'),
    (0, swagger_1.ApiOperation)({ summary: 'List members of price group' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerPriceGroupsController.prototype, "listMembers", null);
exports.CustomerPriceGroupsController = CustomerPriceGroupsController = __decorate([
    (0, swagger_1.ApiTags)('Customer Price Groups'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('price-groups'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomerPriceGroupsController);
//# sourceMappingURL=customer-price-groups.controller.js.map