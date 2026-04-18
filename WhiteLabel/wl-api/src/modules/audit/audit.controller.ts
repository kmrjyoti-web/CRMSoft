import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @UseGuards(AdminGuard)
  @Get()
  getAllLogs(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.auditService.getAllLogs(+page, +limit);
  }

  @Get(':partnerId')
  getPartnerLogs(@Param('partnerId') partnerId: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.auditService.getPartnerLogs(partnerId, +page, +limit);
  }
}
