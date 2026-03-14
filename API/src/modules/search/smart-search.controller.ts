import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { SmartSearchService } from './smart-search.service';
import { SmartSearchDto } from './dto/smart-search.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/utils/api-response';

@Controller('api/v1/search/smart')
@UseGuards(JwtAuthGuard)
export class SmartSearchController {
  constructor(private readonly service: SmartSearchService) {}

  @Post()
  async search(@Body() dto: SmartSearchDto, @CurrentUser() user: any) {
    const tenantId = user?.tenantId;
    const result = await this.service.search(tenantId, dto);
    return ApiResponse.success(result);
  }

  @Get('parameters/:entityType')
  getParameters(@Param('entityType') entityType: string) {
    const result = this.service.getParameterConfig(entityType);
    return ApiResponse.success(result);
  }
}
