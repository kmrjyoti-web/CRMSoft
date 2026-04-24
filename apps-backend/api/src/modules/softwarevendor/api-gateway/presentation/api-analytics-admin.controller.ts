import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { ApiAnalyticsService } from '../services/api-analytics.service';

@Controller('api-gateway/admin/analytics')
@UseGuards(JwtAuthGuard)
export class ApiAnalyticsAdminController {
  constructor(private readonly analytics: ApiAnalyticsService) {}

  @Get('usage')
  async getUsageSummary(
    @Req() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analytics.getUsageSummary(req.user.tenantId, from, to);
  }

  @Get('webhooks')
  async getWebhookStats(@Req() req: any) {
    return this.analytics.getWebhookStats(req.user.tenantId);
  }
}
