import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '../../../../common/utils/api-response';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { AnalyticsQueryDto } from './dto/quotation-query.dto';
import { GetQuotationAnalyticsQuery } from '../application/queries/get-quotation-analytics/get-quotation-analytics.query';
import { GetIndustryAnalyticsQuery } from '../application/queries/get-industry-analytics/get-industry-analytics.query';
import { GetProductAnalyticsQuery } from '../application/queries/get-product-analytics/get-product-analytics.query';
import { GetBestQuotationsQuery } from '../application/queries/get-best-quotations/get-best-quotations.query';
import { GetQuotationComparisonQuery } from '../application/queries/get-quotation-comparison/get-quotation-comparison.query';

@Controller('quotation-analytics')
@UseGuards(AuthGuard('jwt'))
export class QuotationAnalyticsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('overview')
  @RequirePermissions('quotations:read')
  async overview(@Query() query: AnalyticsQueryDto) {
    const result = await this.queryBus.execute(new GetQuotationAnalyticsQuery(
      'overview',
      query.dateFrom ? new Date(query.dateFrom) : undefined,
      query.dateTo ? new Date(query.dateTo) : undefined,
      query.userId,
    ));
    return ApiResponse.success(result);
  }

  @Get('conversion')
  @RequirePermissions('quotations:read')
  async conversion(@Query() query: AnalyticsQueryDto) {
    const result = await this.queryBus.execute(new GetQuotationAnalyticsQuery(
      'conversion',
      query.dateFrom ? new Date(query.dateFrom) : undefined,
      query.dateTo ? new Date(query.dateTo) : undefined,
    ));
    return ApiResponse.success(result);
  }

  @Get('industry')
  @RequirePermissions('quotations:read')
  async industry(@Query() query: AnalyticsQueryDto) {
    const result = await this.queryBus.execute(new GetIndustryAnalyticsQuery(
      query.dateFrom ? new Date(query.dateFrom) : undefined,
      query.dateTo ? new Date(query.dateTo) : undefined,
    ));
    return ApiResponse.success(result);
  }

  @Get('products')
  @RequirePermissions('quotations:read')
  async products(@Query() query: AnalyticsQueryDto) {
    const result = await this.queryBus.execute(new GetProductAnalyticsQuery(
      query.dateFrom ? new Date(query.dateFrom) : undefined,
      query.dateTo ? new Date(query.dateTo) : undefined,
    ));
    return ApiResponse.success(result);
  }

  @Get('best-quotations')
  @RequirePermissions('quotations:read')
  async bestQuotations(@Query('limit') limit?: string) {
    const result = await this.queryBus.execute(new GetBestQuotationsQuery(limit ? parseInt(limit) : undefined));
    return ApiResponse.success(result);
  }

  @Get('comparison')
  @RequirePermissions('quotations:read')
  async comparison(@Query('ids') ids: string) {
    const idList = ids?.split(',').filter(Boolean) || [];
    const result = await this.queryBus.execute(new GetQuotationComparisonQuery(idList));
    return ApiResponse.success(result);
  }
}
