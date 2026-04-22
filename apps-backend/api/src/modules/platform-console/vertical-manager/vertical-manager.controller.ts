import { Controller, Get, Post, Patch, Param, Query, Body } from '@nestjs/common';
import { VerticalManagerService } from './vertical-manager.service';
import { RegisterVerticalDto } from './dto/register-vertical.dto';

@Controller('platform-console/verticals')
export class VerticalManagerController {
  constructor(private readonly verticalManagerService: VerticalManagerService) {}

  @Get('health/overview')
  getHealthOverview() {
    return this.verticalManagerService.getHealthOverview();
  }

  @Get()
  getVerticals() {
    return this.verticalManagerService.getVerticals();
  }

  @Post()
  registerVertical(@Body() dto: RegisterVerticalDto) {
    return this.verticalManagerService.registerVertical(dto);
  }

  @Get(':code')
  getVerticalDetail(@Param('code') code: string) {
    return this.verticalManagerService.getVerticalDetail(code);
  }

  @Patch(':code')
  updateVertical(
    @Param('code') code: string,
    @Body() data: { name?: string; nameHi?: string; schemasConfig?: Record<string, unknown> },
  ) {
    return this.verticalManagerService.updateVertical(code, data);
  }

  @Patch(':code/status')
  updateVerticalStatus(
    @Param('code') code: string,
    @Body() body: { status: string },
  ) {
    return this.verticalManagerService.updateVerticalStatus(code, body.status);
  }

  @Get(':code/health')
  getVerticalHealth(@Param('code') code: string) {
    return this.verticalManagerService.getVerticalHealth(code);
  }

  @Post(':code/audit')
  runVerticalAudit(@Param('code') code: string) {
    return this.verticalManagerService.runVerticalAudit(code);
  }

  @Get(':code/audits')
  getAudits(
    @Param('code') code: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.verticalManagerService.getAudits(code, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':code/audits/:id')
  getAuditDetail(@Param('code') code: string, @Param('id') id: string) {
    return this.verticalManagerService.getAuditDetail(code, id);
  }
}
