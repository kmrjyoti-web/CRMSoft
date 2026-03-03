import {
  Controller, Get, Put, Post, Body, Param, Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AutoNumberService } from '../services/auto-number.service';
import { UpdateAutoNumberDto, ResetSequenceDto } from './dto/update-auto-number.dto';

@ApiTags('Settings - Auto Numbering')
@Controller('api/v1/settings/auto-numbering')
export class AutoNumberController {
  constructor(private readonly service: AutoNumberService) {}

  /** Get all sequences with current/preview. */
  @Get()
  getAll(@Req() req: any) {
    return this.service.getAll(req.user.tenantId);
  }

  /** Get single sequence detail. */
  @Get(':entity')
  getOne(@Req() req: any, @Param('entity') entity: string) {
    return this.service.getOne(req.user.tenantId, entity);
  }

  /** Update format/prefix/reset policy. */
  @Put(':entity')
  update(@Req() req: any, @Param('entity') entity: string, @Body() dto: UpdateAutoNumberDto) {
    return this.service.update(req.user.tenantId, entity, dto);
  }

  /** Preview next number (without incrementing). */
  @Get(':entity/preview')
  preview(@Req() req: any, @Param('entity') entity: string) {
    return this.service.preview(req.user.tenantId, entity).then((number) => ({ number }));
  }

  /** Manual reset sequence. */
  @Post(':entity/reset')
  reset(@Req() req: any, @Param('entity') entity: string, @Body() dto: ResetSequenceDto) {
    return this.service.resetSequence(req.user.tenantId, entity, dto.newStart);
  }
}
