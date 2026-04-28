import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/roles.decorator';
import { BrandConfigService } from './brand-config.service';

@ApiTags('Public')
@Public()
@Controller('public/brand-config')
export class PublicBrandConfigController {
  constructor(private readonly service: BrandConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch merged brand config for a domain (no auth required)' })
  @ApiQuery({ name: 'domain', required: true, example: 'crm.xtremesoftware.com' })
  async getBrandConfig(@Query('domain') domain: string) {
    if (!domain) {
      throw new HttpException('domain query param is required', HttpStatus.BAD_REQUEST);
    }
    return this.service.getPublicBrandConfig(domain);
  }
}
