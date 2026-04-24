import { Controller, Get, Post, Put, Patch, Param, Body, Query } from '@nestjs/common';
import { PartnerManagerService } from './partner-manager.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';

@Controller('platform-console/partners')
export class PartnerManagerController {
  constructor(private readonly service: PartnerManagerService) {}

  @Get()
  list(
    @Query('active') active?: string,
    @Query('brandCode') brandCode?: string,
  ) {
    const filters: any = {};
    if (active === 'true') filters.isActive = true;
    if (active === 'false') filters.isActive = false;
    if (brandCode) filters.brandCode = brandCode;
    return this.service.list(filters);
  }

  @Get(':partnerCode')
  getByCode(@Param('partnerCode') partnerCode: string) {
    return this.service.getByCode(partnerCode);
  }

  @Post()
  create(@Body() dto: CreatePartnerDto) {
    return this.service.create(dto);
  }

  @Put(':partnerCode')
  update(@Param('partnerCode') partnerCode: string, @Body() dto: UpdatePartnerDto) {
    return this.service.update(partnerCode, dto);
  }

  @Patch(':partnerCode/toggle')
  toggle(@Param('partnerCode') partnerCode: string) {
    return this.service.toggleActive(partnerCode);
  }

  @Patch(':partnerCode/api-key/regenerate')
  regenerateApiKey(@Param('partnerCode') partnerCode: string) {
    return this.service.regenerateApiKey(partnerCode);
  }

  @Get(':partnerCode/verticals')
  getVerticals(@Param('partnerCode') partnerCode: string) {
    return this.service.getVerticals(partnerCode);
  }

  @Post(':partnerCode/verticals/:verticalCode/enable')
  enableVertical(
    @Param('partnerCode') partnerCode: string,
    @Param('verticalCode') verticalCode: string,
    @Body() body: { config?: any },
  ) {
    return this.service.enableVertical(partnerCode, verticalCode, body?.config);
  }

  @Post(':partnerCode/verticals/:verticalCode/disable')
  disableVertical(
    @Param('partnerCode') partnerCode: string,
    @Param('verticalCode') verticalCode: string,
  ) {
    return this.service.disableVertical(partnerCode, verticalCode);
  }
}
