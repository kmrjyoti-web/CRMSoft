import {
  Controller, Get, Put, Delete, Param, Body,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { TableConfigService } from '../services/table-config.service';
import { UpsertTableConfigDto } from './dto/upsert-table-config.dto';

@ApiTags('Table Config')
@ApiBearerAuth()
@Controller('table-config')
export class TableConfigController {
  constructor(private readonly service: TableConfigService) {}

  @Get(':tableKey')
  @ApiOperation({ summary: 'Get merged table config for current user' })
  async getConfig(
    @Param('tableKey') tableKey: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const config = await this.service.getConfig(tableKey, userId, tenantId);
    return ApiResponse.success(config);
  }

  @Put(':tableKey')
  @ApiOperation({ summary: 'Save table config for current user' })
  async upsertConfig(
    @Param('tableKey') tableKey: string,
    @Body() dto: UpsertTableConfigDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    if (dto.applyToAll) {
      const config = await this.service.upsertTenantDefault(tableKey, tenantId, dto.config);
      return ApiResponse.success(config, 'Tenant-wide default saved');
    }

    const config = await this.service.upsertUserConfig(tableKey, userId, tenantId, dto.config);
    return ApiResponse.success(config, 'Config saved');
  }

  @Put(':tableKey/default')
  @ApiOperation({ summary: 'Save tenant-wide default config (admin only)' })
  @RequirePermissions('table-config:manage')
  async upsertDefault(
    @Param('tableKey') tableKey: string,
    @Body() dto: UpsertTableConfigDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const config = await this.service.upsertTenantDefault(tableKey, tenantId, dto.config);
    return ApiResponse.success(config, 'Tenant-wide default saved');
  }

  @Delete(':tableKey')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset table config to default for current user' })
  async resetConfig(
    @Param('tableKey') tableKey: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.service.deleteUserConfig(tableKey, userId, tenantId);
    return ApiResponse.success(result, 'Config reset to default');
  }
}
