import { Controller, Get, Param, Query } from '@nestjs/common';
import { ErrorCenterService } from './error-center.service';
import { Public } from '../../../common/decorators/roles.decorator';

@Public()
@Controller('platform-console/errors')
export class ErrorCenterController {
  constructor(private readonly errorCenterService: ErrorCenterService) {}

  @Get('stats')
  getStats() {
    return this.errorCenterService.getStats();
  }

  @Get('trends')
  getTrends(@Query('period') period: 'DAILY' | 'WEEKLY' | 'MONTHLY') {
    return this.errorCenterService.getTrends(period);
  }

  @Get()
  listErrors(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('severity') severity?: string,
    @Query('brandId') brandId?: string,
    @Query('verticalType') verticalType?: string,
    @Query('resolved') resolved?: string,
    @Query('tenantId') tenantId?: string,
    @Query('partnerCode') partnerCode?: string,
  ) {
    return this.errorCenterService.listErrors({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      severity,
      brandId,
      verticalType,
      resolved: resolved !== undefined ? resolved === 'true' : undefined,
      tenantId,
      partnerCode,
    });
  }

  @Get(':id')
  getError(@Param('id') id: string) {
    return this.errorCenterService.getError(id);
  }
}
