import { Controller, Get, Param } from '@nestjs/common';
import { CfgVerticalService } from './cfg-vertical.service';

@Controller('platform/verticals')
export class CfgVerticalController {
  constructor(private readonly service: CfgVerticalService) {}

  @Get()
  listAll() {
    return this.service.listAll();
  }

  @Get('active')
  findActive() {
    return this.service.findActive();
  }

  @Get('built')
  findBuilt() {
    return this.service.findBuilt();
  }

  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.service.findByCode(code);
  }
}
