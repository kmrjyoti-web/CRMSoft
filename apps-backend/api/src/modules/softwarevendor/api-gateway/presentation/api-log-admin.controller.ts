import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { ApiLoggerService } from '../services/api-logger.service';
import { ApiLogQueryDto } from './dto/api-log.dto';

@Controller('api-gateway/admin/logs')
@UseGuards(JwtAuthGuard)
export class ApiLogAdminController {
  constructor(private readonly apiLogger: ApiLoggerService) {}

  @Get()
  async listLogs(@Req() req: any, @Query() query: ApiLogQueryDto) {
    return this.apiLogger.listLogs(req.user.tenantId, query);
  }
}
