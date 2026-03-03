import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiScopeGuard } from '../guards/api-scope.guard';
import { ApiRateLimitGuard } from '../guards/api-rate-limit.guard';
import { ApiScopes } from '../decorators/api-scopes.decorator';
import { PaginationQueryDto } from './dto/public-api.dto';

@Controller('api/v1/invoices')
@UseGuards(ApiKeyGuard, ApiScopeGuard, ApiRateLimitGuard)
export class PublicInvoicesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiScopes('invoices:read')
  async list(@Req() req: any, @Query() query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { tenantId: req.tenantId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, invoiceNo: true, billingName: true, status: true,
          totalAmount: true, paidAmount: true, balanceAmount: true,
          dueDate: true, createdAt: true, updatedAt: true,
        },
      }),
      this.prisma.invoice.count({ where: { tenantId: req.tenantId } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  @Get(':id')
  @ApiScopes('invoices:read')
  async getById(@Req() req: any, @Param('id') id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId: req.tenantId },
      include: { lineItems: true, payments: true },
    });
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  }
}
