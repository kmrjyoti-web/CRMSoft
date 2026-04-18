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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const product_query_dto_1 = require("./dto/product-query.dto");
const link_products_dto_1 = require("./dto/link-products.dto");
const create_product_command_1 = require("../application/commands/create-product/create-product.command");
const update_product_command_1 = require("../application/commands/update-product/update-product.command");
const manage_product_images_command_1 = require("../application/commands/manage-product-images/manage-product-images.command");
const link_products_command_1 = require("../application/commands/link-products/link-products.command");
const deactivate_product_command_1 = require("../application/commands/deactivate-product/deactivate-product.command");
const assign_product_filters_command_1 = require("../application/commands/assign-product-filters/assign-product-filters.command");
const get_product_by_id_query_1 = require("../application/queries/get-product-by-id/get-product-by-id.query");
const list_products_query_1 = require("../application/queries/list-products/list-products.query");
const get_product_tree_query_1 = require("../application/queries/get-product-tree/get-product-tree.query");
const get_product_pricing_query_1 = require("../application/queries/get-product-pricing/get-product-pricing.query");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let ProductsController = class ProductsController {
    constructor(commandBus, queryBus, prisma) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.prisma = prisma;
    }
    async create(dto, userId) {
        const product = await this.commandBus.execute(new create_product_command_1.CreateProductCommand(dto, userId));
        const full = await this.queryBus.execute(new get_product_by_id_query_1.GetProductByIdQuery(product.id));
        return api_response_1.ApiResponse.success(full, 'Product created');
    }
    async findAll(q) {
        const result = await this.queryBus.execute(new list_products_query_1.ListProductsQuery(q.page ?? 1, q.limit ?? 20, q.sortBy ?? 'createdAt', q.sortDir ?? 'desc', q.search, q.status, q.parentId, q.isMaster, q.brandId, q.manufacturerId, q.minPrice, q.maxPrice, q.taxType, q.licenseRequired, q.tags));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getTree() {
        const tree = await this.queryBus.execute(new get_product_tree_query_1.GetProductTreeQuery());
        return api_response_1.ApiResponse.success(tree);
    }
    async quickSearch(q) {
        const data = await this.prisma.working.product.findMany({
            where: {
                isActive: true,
                OR: [
                    { name: { contains: q || '', mode: 'insensitive' } },
                    { code: { contains: q || '', mode: 'insensitive' } },
                ],
            },
            take: 20,
            select: { id: true, name: true, code: true, slug: true, salePrice: true, image: true, status: true },
            orderBy: { name: 'asc' },
        });
        return api_response_1.ApiResponse.success(data);
    }
    async findById(id) {
        const product = await this.queryBus.execute(new get_product_by_id_query_1.GetProductByIdQuery(id));
        return api_response_1.ApiResponse.success(product);
    }
    async update(id, dto) {
        await this.commandBus.execute(new update_product_command_1.UpdateProductCommand(id, dto));
        const product = await this.queryBus.execute(new get_product_by_id_query_1.GetProductByIdQuery(id));
        return api_response_1.ApiResponse.success(product, 'Product updated');
    }
    async deactivate(id) {
        const result = await this.commandBus.execute(new deactivate_product_command_1.DeactivateProductCommand(id));
        return api_response_1.ApiResponse.success(result, 'Product deactivated');
    }
    async manageImages(id, images) {
        const product = await this.commandBus.execute(new manage_product_images_command_1.ManageProductImagesCommand(id, images));
        return api_response_1.ApiResponse.success(product, 'Product images updated');
    }
    async linkProduct(id, dto) {
        const relation = await this.commandBus.execute(new link_products_command_1.LinkProductsCommand(id, dto.toProductId, dto.relationType));
        return api_response_1.ApiResponse.success(relation, 'Product relation created');
    }
    async unlinkProduct(relationId) {
        await this.prisma.working.productRelation.delete({ where: { id: relationId } });
        return api_response_1.ApiResponse.success(null, 'Product relation removed');
    }
    async getRelations(id) {
        const relations = await this.prisma.working.productRelation.findMany({
            where: { OR: [{ fromProductId: id }, { toProductId: id }] },
            include: {
                fromProduct: { select: { id: true, name: true, code: true, image: true } },
                toProduct: { select: { id: true, name: true, code: true, image: true } },
            },
        });
        return api_response_1.ApiResponse.success(relations);
    }
    async assignFilters(id, ids) {
        const filters = await this.commandBus.execute(new assign_product_filters_command_1.AssignProductFiltersCommand(id, ids));
        return api_response_1.ApiResponse.success(filters, 'Product filters assigned');
    }
    async getFilters(id) {
        const filters = await this.prisma.working.productFilter.findMany({
            where: { productId: id },
            include: {
                lookupValue: {
                    select: { id: true, value: true, label: true, lookup: { select: { id: true, category: true, displayName: true } } },
                },
            },
        });
        return api_response_1.ApiResponse.success(filters);
    }
    async replaceFilters(id, ids) {
        const filters = await this.commandBus.execute(new assign_product_filters_command_1.AssignProductFiltersCommand(id, ids));
        return api_response_1.ApiResponse.success(filters, 'Product filters replaced');
    }
    async getPricing(id) {
        const pricing = await this.queryBus.execute(new get_product_pricing_query_1.GetProductPricingQuery(id));
        return api_response_1.ApiResponse.success(pricing);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('products:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new product' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    (0, swagger_1.ApiOperation)({ summary: 'List products (paginated, filtered)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_query_dto_1.ProductQueryDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tree'),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product tree (masters with children)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getTree", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Quick search products by name or code (limit 20)' }),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "quickSearch", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('products:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('products:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate product and its children' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':id/images'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('products:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Manage product images (JSON array)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('images')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "manageImages", null);
__decorate([
    (0, common_1.Post)(':id/relations'),
    (0, require_permissions_decorator_1.RequirePermissions)('products:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Link product to another product' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, link_products_dto_1.LinkProductsDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "linkProduct", null);
__decorate([
    (0, common_1.Delete)(':id/relations/:relationId'),
    (0, require_permissions_decorator_1.RequirePermissions)('products:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a product relation' }),
    __param(0, (0, common_1.Param)('relationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "unlinkProduct", null);
__decorate([
    (0, common_1.Get)(':id/relations'),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all relations for a product' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getRelations", null);
__decorate([
    (0, common_1.Post)(':id/filters'),
    (0, require_permissions_decorator_1.RequirePermissions)('products:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign filter values to product' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('lookupValueIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "assignFilters", null);
__decorate([
    (0, common_1.Get)(':id/filters'),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product filters' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getFilters", null);
__decorate([
    (0, common_1.Post)(':id/filters/replace'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('products:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Replace all product filters' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('lookupValueIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "replaceFilters", null);
__decorate([
    (0, common_1.Get)(':id/pricing'),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product pricing grouped by price type' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getPricing", null);
exports.ProductsController = ProductsController = __decorate([
    (0, swagger_1.ApiTags)('Products'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        prisma_service_1.PrismaService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map