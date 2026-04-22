import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('platform-console/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('health')
  getHealth() {
    return this.dashboardService.getHealth();
  }

  @Get('errors')
  getErrors() {
    return this.dashboardService.getErrorsSummary();
  }

  @Get('tests')
  getTests() {
    return this.dashboardService.getTestsSummary();
  }
}
