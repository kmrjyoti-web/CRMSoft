import {
  Controller, Get, Put, Post, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigCategory } from '@prisma/client';
import { ApiResponse } from '../../../common/utils/api-response';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { TenantConfigService } from '../services/tenant-config.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { BulkUpdateConfigDto } from './dto/bulk-update-config.dto';

@ApiTags('Tenant Config')
@ApiBearerAuth()
@Controller('config')
@UseGuards(AuthGuard('jwt'))
export class ConfigController {
  constructor(private readonly configService: TenantConfigService) {}

  @Get()
  async getAll(@CurrentUser('tenantId') tenantId: string) {
    const configs = await this.configService.getAll(tenantId);
    return ApiResponse.success(configs, 'Configs retrieved');
  }

  @Get('category/:category')
  async getByCategory(
    @CurrentUser('tenantId') tenantId: string,
    @Param('category') category: ConfigCategory,
  ) {
    const configs = await this.configService.getByCategory(tenantId, category);
    return ApiResponse.success(configs, 'Category configs retrieved');
  }

  @Put('bulk')
  async bulkSet(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('name') userName: string,
    @Body() dto: BulkUpdateConfigDto,
  ) {
    const result = await this.configService.bulkSet(tenantId, dto.configs, userId, userName);
    return ApiResponse.success(result, `${result.updated} configs updated`);
  }

  @Get(':key')
  async get(
    @CurrentUser('tenantId') tenantId: string,
    @Param('key') key: string,
  ) {
    const value = await this.configService.get(tenantId, key);
    return ApiResponse.success({ key, value }, 'Config retrieved');
  }

  @Put(':key')
  async set(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('name') userName: string,
    @Param('key') key: string,
    @Body() dto: UpdateConfigDto,
  ) {
    await this.configService.set(tenantId, key, dto.value, userId, userName);
    return ApiResponse.success(null, `Config '${key}' updated`);
  }

  @Post('reset/:key')
  async resetToDefault(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('key') key: string,
  ) {
    await this.configService.resetToDefault(tenantId, key, userId);
    return ApiResponse.success(null, `Config '${key}' reset to default`);
  }
}
