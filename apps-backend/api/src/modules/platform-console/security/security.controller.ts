import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { SecurityService } from './security.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { Public } from '../../../common/decorators/roles.decorator';

@Public()
@Controller('platform-console/security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  // --- Snapshots (static routes first) ---

  @Get('snapshots/latest')
  getLatestSnapshots() {
    return this.securityService.getLatestSnapshots();
  }

  @Get('snapshots')
  getSnapshots(
    @Query('service') service?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.securityService.getSnapshots({
      service,
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @Post('snapshots/capture')
  captureHealthSnapshot() {
    return this.securityService.captureHealthSnapshot();
  }

  // --- Incidents ---

  @Get('incidents')
  getIncidents(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.securityService.getIncidents({
      status,
      severity,
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @Post('incidents')
  createIncident(@Body() dto: CreateIncidentDto) {
    return this.securityService.createIncident(dto);
  }

  @Get('incidents/:id')
  getIncident(@Param('id') id: string) {
    return this.securityService.getIncident(id);
  }

  @Patch('incidents/:id')
  updateIncident(
    @Param('id') id: string,
    @Body() body: { status?: string; rootCause?: string; resolution?: string },
  ) {
    return this.securityService.updateIncident(id, body);
  }

  @Post('incidents/:id/postmortem')
  addPostmortem(@Param('id') id: string, @Body() body: { postmortem: string }) {
    return this.securityService.addPostmortem(id, body.postmortem);
  }

  // --- DR Plans ---

  @Get('dr-plans')
  getDRPlans() {
    return this.securityService.getDRPlans();
  }

  @Get('dr-plans/:service')
  getDRPlan(@Param('service') service: string) {
    return this.securityService.getDRPlan(service);
  }

  @Patch('dr-plans/:service')
  updateDRPlan(
    @Param('service') service: string,
    @Body() body: { runbook?: string; rto?: number; rpo?: number },
  ) {
    return this.securityService.updateDRPlan(service, body);
  }

  @Post('dr-plans/:service/test')
  testDRPlan(@Param('service') service: string) {
    return this.securityService.testDRPlan(service);
  }

  // --- Notifications ---

  @Get('notifications/stats')
  getNotificationStats() {
    return this.securityService.getNotificationStats();
  }

  @Get('notifications')
  getNotifications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.securityService.getNotifications({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }
}
