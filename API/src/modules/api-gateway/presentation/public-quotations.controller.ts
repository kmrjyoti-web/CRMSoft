import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiScopeGuard } from '../guards/api-scope.guard';
import { ApiRateLimitGuard } from '../guards/api-rate-limit.guard';
import { ApiScopes } from '../decorators/api-scopes.decorator';
import { PaginationQueryDto } from './dto/public-api.dto';

@Controller('public/quotations')
@UseGuards(ApiKeyGuard, ApiScopeGuard, ApiRateLimitGuard)
export class PublicQuotationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiScopes('quotations:read')
  async list(@Req() req: any, @Query() query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where: { tenantId: req.tenantId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, quotationNo: true, title: true, status: true,
          totalAmount: true, validUntil: true,
          createdAt: true, updatedAt: true,
        },
      }),
      this.prisma.quotation.count({ where: { tenantId: req.tenantId } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  @Get(':id')
  @ApiScopes('quotations:read')
  async getById(@Req() req: any, @Param('id') id: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, tenantId: req.tenantId },
      include: { lineItems: true },
    });
    if (!quotation) throw new Error('Quotation not found');
    return quotation;
  }
}
