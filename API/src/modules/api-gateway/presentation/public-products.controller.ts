import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiScopeGuard } from '../guards/api-scope.guard';
import { ApiRateLimitGuard } from '../guards/api-rate-limit.guard';
import { ApiScopes } from '../decorators/api-scopes.decorator';
import { PaginationQueryDto } from './dto/public-api.dto';

@Controller('api/v1/products')
@UseGuards(ApiKeyGuard, ApiScopeGuard, ApiRateLimitGuard)
export class PublicProductsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiScopes('products:read')
  async list(@Req() req: any, @Query() query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = { tenantId: req.tenantId, isActive: true };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, code: true, slug: true, description: true,
          salePrice: true, mrp: true, gstRate: true, hsnCode: true,
          isActive: true, createdAt: true, updatedAt: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  @Get(':id')
  @ApiScopes('products:read')
  async getById(@Req() req: any, @Param('id') id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId: req.tenantId },
    });
    if (!product) throw new Error('Product not found');
    return product;
  }
}
