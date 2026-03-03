import { Controller, Get, Put, Post, Body, Param, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataRetentionService } from '../services/data-retention.service';
import { UpdateDataRetentionDto } from './dto/update-data-retention.dto';

@ApiTags('Settings - Data Retention')
@Controller('api/v1/settings/retention')
export class DataRetentionController {
  constructor(private readonly service: DataRetentionService) {}

  /** Get all retention policies. */
  @Get()
  getAll(@Req() req: any) {
    return this.service.getAll(req.user.tenantId);
  }

  /** Update retention policy for an entity. */
  @Put(':entityName')
  update(@Req() req: any, @Param('entityName') entityName: string, @Body() dto: UpdateDataRetentionDto) {
    return this.service.update(req.user.tenantId, entityName, dto);
  }

  /** Preview what would be affected (dry run). */
  @Post(':entityName/preview')
  preview(@Req() req: any, @Param('entityName') entityName: string) {
    return this.service.preview(req.user.tenantId, entityName);
  }

  /** Execute retention for an entity. */
  @Post(':entityName/execute')
  execute(@Req() req: any) {
    return this.service.execute(req.user.tenantId);
  }
}
