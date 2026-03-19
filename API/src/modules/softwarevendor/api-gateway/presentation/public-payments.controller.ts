import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiScopeGuard } from '../guards/api-scope.guard';
import { ApiRateLimitGuard } from '../guards/api-rate-limit.guard';
import { ApiScopes } from '../decorators/api-scopes.decorator';
import { PaginationQueryDto } from './dto/public-api.dto';

@Controller('public/payments')
@UseGuards(ApiKeyGuard, ApiScopeGuard, ApiRateLimitGuard)
export class PublicPaymentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiScopes('payments:read')
  async list(@Req() req: any, @Query() query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.working.payment.findMany({
        where: { tenantId: req.tenantId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, method: true, gateway: true, amount: true,
          status: true, paidAt: true, transactionRef: true,
          createdAt: true,
          invoice: { select: { id: true, invoiceNo: true, billingName: true } },
        },
      }),
      this.prisma.working.payment.count({ where: { tenantId: req.tenantId } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  @Get(':id')
  @ApiScopes('payments:read')
  async getById(@Req() req: any, @Param('id') id: string) {
    const payment = await this.prisma.working.payment.findFirst({
      where: { id, tenantId: req.tenantId },
      include: {
        invoice: { select: { id: true, invoiceNo: true, billingName: true } },
        receipt: true,
      },
    });
    if (!payment) throw new Error('Payment not found');
    return payment;
  }
}
