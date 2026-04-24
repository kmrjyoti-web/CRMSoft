import { Controller, Get, Param, Post } from '@nestjs/common';
import { HealthMonitorService } from './health-monitor.service';
import { Public } from '../../../common/decorators/roles.decorator';

@Public()
@Controller('platform-console/health')
export class HealthMonitorController {
  constructor(private readonly healthMonitorService: HealthMonitorService) {}

  @Get()
  getAllHealth() {
    return this.healthMonitorService.getAllHealth();
  }

  @Get(':service')
  getServiceHealth(@Param('service') service: string) {
    return this.healthMonitorService.getServiceHealth(service);
  }

  @Post('check')
  triggerHealthCheck() {
    return this.healthMonitorService.triggerHealthCheck();
  }
}
