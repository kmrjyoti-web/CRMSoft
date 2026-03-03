import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { LinkProductsDto } from './dto/link-products.dto';
import { CreateProductCommand } from '../application/commands/create-product/create-product.command';
import { UpdateProductCommand } from '../application/commands/update-product/update-product.command';
import { ManageProductImagesCommand } from '../application/commands/manage-product-images/manage-product-images.command';
import { LinkProductsCommand } from '../application/commands/link-products/link-products.command';
import { DeactivateProductCommand } from '../application/commands/deactivate-product/deactivate-product.command';
import { AssignProductFiltersCommand } from '../application/commands/assign-product-filters/assign-product-filters.command';
import { GetProductByIdQuery } from '../application/queries/get-product-by-id/get-product-by-id.query';
import { ListProductsQuery } from '../application/queries/list-products/list-products.query';
import { GetProductTreeQuery } from '../application/queries/get-product-tree/get-product-tree.query';
import { GetProductPricingQuery } from '../application/queries/get-product-pricing/get-product-pricing.query';
import { PrismaService } from '../../../core/prisma/prisma.service';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @RequirePermissions('products:create')
  @ApiOperation({ summary: 'Create a new product' })
  async create(@Body() dto: CreateProductDto, @CurrentUser('id') userId: string) {
    const product = await this.commandBus.execute(new CreateProductCommand(dto, userId));
    const full = await this.queryBus.execute(new GetProductByIdQuery(product.id));
    return ApiResponse.success(full, 'Product created');
  }

  @Get()
  @RequirePermissions('products:read')
  @ApiOperation({ summary: 'List products (paginated, filtered)' })
  async findAll(@Query() q: ProductQueryDto) {
    const result = await this.queryBus.execute(new ListProductsQuery(
      q.page ?? 1, q.limit ?? 20, q.sortBy ?? 'createdAt', q.sortDir ?? 'desc',
      q.search, q.status, q.parentId, q.isMaster, q.brandId, q.manufacturerId,
      q.minPrice, q.maxPrice, q.taxType, q.licenseRequired, q.tags,
    ));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('tree')
  @RequirePermissions('products:read')
  @ApiOperation({ summary: 'Get product tree (masters with children)' })
  async getTree() {
    const tree = await this.queryBus.execute(new GetProductTreeQuery());
    return ApiResponse.success(tree);
  }

  @Get('search')
  @RequirePermissions('products:read')
  @ApiOperation({ summary: 'Quick search products by name or code (limit 20)' })
  async quickSearch(@Query('q') q: string) {
    const data = await this.prisma.product.findMany({
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
    return ApiResponse.success(data);
  }

  @Get(':id')
  @RequirePermissions('products:read')
  @ApiOperation({ summary: 'Get product by ID' })
  async findById(@Param('id') id: string) {
    const product = await this.queryBus.execute(new GetProductByIdQuery(id));
    return ApiResponse.success(product);
  }

  @Put(':id')
  @RequirePermissions('products:update')
  @ApiOperation({ summary: 'Update product' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    await this.commandBus.execute(new UpdateProductCommand(id, dto));
    const product = await this.queryBus.execute(new GetProductByIdQuery(id));
    return ApiResponse.success(product, 'Product updated');
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('products:update')
  @ApiOperation({ summary: 'Deactivate product and its children' })
  async deactivate(@Param('id') id: string) {
    const result = await this.commandBus.execute(new DeactivateProductCommand(id));
    return ApiResponse.success(result, 'Product deactivated');
  }

  @Post(':id/images')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('products:update')
  @ApiOperation({ summary: 'Manage product images (JSON array)' })
  async manageImages(@Param('id') id: string, @Body('images') images: any[]) {
    const product = await this.commandBus.execute(new ManageProductImagesCommand(id, images));
    return ApiResponse.success(product, 'Product images updated');
  }

  @Post(':id/relations')
  @RequirePermissions('products:update')
  @ApiOperation({ summary: 'Link product to another product' })
  async linkProduct(@Param('id') id: string, @Body() dto: LinkProductsDto) {
    const relation = await this.commandBus.execute(
      new LinkProductsCommand(id, dto.toProductId, dto.relationType),
    );
    return ApiResponse.success(relation, 'Product relation created');
  }

  @Delete(':id/relations/:relationId')
  @RequirePermissions('products:update')
  @ApiOperation({ summary: 'Remove a product relation' })
  async unlinkProduct(@Param('relationId') relationId: string) {
    await this.prisma.productRelation.delete({ where: { id: relationId } });
    return ApiResponse.success(null, 'Product relation removed');
  }

  @Get(':id/relations')
  @RequirePermissions('products:read')
  @ApiOperation({ summary: 'Get all relations for a product' })
  async getRelations(@Param('id') id: string) {
    const relations = await this.prisma.productRelation.findMany({
      where: { OR: [{ fromProductId: id }, { toProductId: id }] },
      include: {
        fromProduct: { select: { id: true, name: true, code: true, image: true } },
        toProduct: { select: { id: true, name: true, code: true, image: true } },
      },
    });
    return ApiResponse.success(relations);
  }

  @Post(':id/filters')
  @RequirePermissions('products:update')
  @ApiOperation({ summary: 'Assign filter values to product' })
  async assignFilters(@Param('id') id: string, @Body('lookupValueIds') ids: string[]) {
    const filters = await this.commandBus.execute(new AssignProductFiltersCommand(id, ids));
    return ApiResponse.success(filters, 'Product filters assigned');
  }

  @Get(':id/filters')
  @RequirePermissions('products:read')
  @ApiOperation({ summary: 'Get product filters' })
  async getFilters(@Param('id') id: string) {
    const filters = await this.prisma.productFilter.findMany({
      where: { productId: id },
      include: {
        lookupValue: {
          select: { id: true, value: true, label: true, lookup: { select: { id: true, category: true, displayName: true } } },
        },
      },
    });
    return ApiResponse.success(filters);
  }

  @Post(':id/filters/replace')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('products:update')
  @ApiOperation({ summary: 'Replace all product filters' })
  async replaceFilters(@Param('id') id: string, @Body('lookupValueIds') ids: string[]) {
    const filters = await this.commandBus.execute(new AssignProductFiltersCommand(id, ids));
    return ApiResponse.success(filters, 'Product filters replaced');
  }

  @Get(':id/pricing')
  @RequirePermissions('products:read')
  @ApiOperation({ summary: 'Get product pricing grouped by price type' })
  async getPricing(@Param('id') id: string) {
    const pricing = await this.queryBus.execute(new GetProductPricingQuery(id));
    return ApiResponse.success(pricing);
  }
}
