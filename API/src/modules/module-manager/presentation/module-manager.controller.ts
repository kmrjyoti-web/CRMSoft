import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { ModuleManagerService } from '../services/module-manager.service';
import { UpdateCredentialsDto } from './dto/module-manager.dto';

@ApiTags('Module Manager')
@ApiBearerAuth()
@Controller('modules')
export class ModuleManagerController {
  constructor(private readonly service: ModuleManagerService) {}

  @Get()
  @ApiOperation({ summary: 'List all modules with tenant status' })
  async listModules(@CurrentUser('tenantId') tenantId: string) {
    const modules = await this.service.listTenantModules(tenantId);
    return ApiResponse.success(modules);
  }

  @Get(':code/status')
  @ApiOperation({ summary: 'Get single module status for current tenant' })
  async getStatus(
    @Param('code') code: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const status = await this.service.getModuleStatus(tenantId, code);
    return ApiResponse.success(status);
  }

  @Post(':code/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable a module (with auto-dependency resolution)' })
  async enableModule(
    @Param('code') code: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.service.enableModule(tenantId, code, userId);
    return ApiResponse.success(result, 'Module enabled successfully');
  }

  @Post(':code/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable a module (blocked if other modules depend on it)' })
  async disableModule(
    @Param('code') code: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.service.disableModule(tenantId, code);
    return ApiResponse.success(result, 'Module disabled successfully');
  }

  @Put(':code/credentials')
  @ApiOperation({ summary: 'Update module credentials' })
  async updateCredentials(
    @Param('code') code: string,
    @Body() dto: UpdateCredentialsDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.service.updateCredentials(
      tenantId,
      code,
      dto.credentials,
    );
    return ApiResponse.success(result, 'Credentials updated');
  }

  @Post(':code/validate-credentials')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate module credentials' })
  async validateCredentials(
    @Param('code') code: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.service.validateCredentials(tenantId, code);
    return ApiResponse.success(result, 'Credentials validated');
  }
}
