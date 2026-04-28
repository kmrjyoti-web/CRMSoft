import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MasterCodeService } from '../services/master-code.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import {
  CreateMasterCodeDto,
  UpdateMasterCodeDto,
  MasterCodeFiltersDto,
  CreateMasterCodeConfigDto,
  UpdateMasterCodeConfigDto,
} from './dto/master-code.dto';

@ApiTags('PC Config — Master Codes')
@ApiBearerAuth()
@Controller('pc-config/master-codes')
export class PcMasterCodeController {
  constructor(private readonly masterCodeService: MasterCodeService) {}

  // ── Master Code endpoints ────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all master codes with child config count' })
  @RequirePermissions('platform:admin')
  async listMasterCodes(@Query() filters: MasterCodeFiltersDto) {
    const result = await this.masterCodeService.listMasterCodes(filters);
    return ApiResponse.success(result.data, 'Master codes retrieved', { total: result.total });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get master code detail including all children' })
  @RequirePermissions('platform:admin')
  async getMasterCode(@Param('id', ParseUUIDPipe) id: string) {
    const master = await this.masterCodeService.getMasterCode(id);
    return ApiResponse.success(master);
  }

  @Post()
  @ApiOperation({ summary: 'Create master code' })
  @RequirePermissions('platform:admin')
  async createMasterCode(@Body() dto: CreateMasterCodeDto) {
    const master = await this.masterCodeService.createMasterCode(dto);
    return ApiResponse.success(master, 'Master code created');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update master code' })
  @RequirePermissions('platform:admin')
  async updateMasterCode(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMasterCodeDto,
  ) {
    const master = await this.masterCodeService.updateMasterCode(id, dto);
    return ApiResponse.success(master, 'Master code updated');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete master code (isActive=false)' })
  @RequirePermissions('platform:admin')
  async deleteMasterCode(@Param('id', ParseUUIDPipe) id: string) {
    const master = await this.masterCodeService.deleteMasterCode(id);
    return ApiResponse.success(master, 'Master code deactivated');
  }

  // ── Config (child) endpoints ─────────────────────────────────────────────

  @Get(':id/configs')
  @ApiOperation({ summary: 'List user-type configs under a master code' })
  @RequirePermissions('platform:admin')
  async listConfigs(@Param('id', ParseUUIDPipe) id: string) {
    const configs = await this.masterCodeService.listConfigs(id);
    return ApiResponse.success(configs);
  }

  @Post(':id/configs')
  @ApiOperation({ summary: 'Add a user-type config to a master code' })
  @RequirePermissions('platform:admin')
  async createConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMasterCodeConfigDto,
  ) {
    const config = await this.masterCodeService.createConfig(id, dto);
    return ApiResponse.success(config, 'Config created');
  }

  @Patch(':id/configs/:configId')
  @ApiOperation({ summary: 'Update a user-type config' })
  @RequirePermissions('platform:admin')
  async updateConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('configId', ParseUUIDPipe) configId: string,
    @Body() dto: UpdateMasterCodeConfigDto,
  ) {
    const config = await this.masterCodeService.updateConfig(id, configId, dto);
    return ApiResponse.success(config, 'Config updated');
  }

  @Delete(':id/configs/:configId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a user-type config' })
  @RequirePermissions('platform:admin')
  async deleteConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('configId', ParseUUIDPipe) configId: string,
  ) {
    const config = await this.masterCodeService.deleteConfig(id, configId);
    return ApiResponse.success(config, 'Config deactivated');
  }
}
