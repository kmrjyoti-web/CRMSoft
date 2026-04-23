import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SlaAlertsService } from './sla-alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('sla-alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('sla-alerts')
export class SlaAlertsController {
  constructor(private slaAlertsService: SlaAlertsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.slaAlertsService.getDashboard();
  }

  @Get('history')
  getAlertHistory(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('alertType') alertType?: string,
  ) {
    return this.slaAlertsService.getAlertHistory({ page: +page, limit: +limit, alertType });
  }

  @Post('run/breaches')
  runBreachCheck() {
    return this.slaAlertsService.checkSlaBreaches().then(() => ({ triggered: true }));
  }

  @Post('run/overdue')
  runOverdueCheck() {
    return this.slaAlertsService.checkPaymentOverdue().then(() => ({ triggered: true }));
  }
}
