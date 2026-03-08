import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { BusinessTypeService } from '../services/business-type.service';
import { TerminologyService } from '../services/terminology.service';
import {
  AssignBusinessTypeDto,
  UpdateTradeProfileDto,
  TerminologyItemDto,
  BulkTerminologyDto,
} from './dto/business-type.dto';

@ApiTags('Business Types')
@ApiBearerAuth()
@Controller('business-types')
export class BusinessTypeController {
  constructor(
    private readonly btService: BusinessTypeService,
    private readonly termService: TerminologyService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all business types' })
  async listAll(@Query('activeOnly') activeOnly?: string) {
    const data = await this.btService.listAll(activeOnly !== 'false');
    return ApiResponse.success(data);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get resolved profile for current tenant' })
  async getProfile(@CurrentUser('tenantId') tenantId: string) {
    const profile = await this.btService.resolveProfile(tenantId);
    return ApiResponse.success(profile);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get business type by code' })
  async getByCode(@Param('code') code: string) {
    const bt = await this.btService.getByCode(code);
    return ApiResponse.success(bt);
  }

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seed default business types' })
  async seed() {
    const result = await this.btService.seed();
    return ApiResponse.success({ seeded: result.length });
  }

  @Put('assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign business type to tenant' })
  async assign(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: AssignBusinessTypeDto,
  ) {
    const result = await this.btService.assignToTenant(tenantId, dto.typeCode);
    return ApiResponse.success(result);
  }

  @Put('trade-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tenant trade profile' })
  async updateTradeProfile(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateTradeProfileDto,
  ) {
    const result = await this.btService.updateTradeProfile(tenantId, dto.profile);
    return ApiResponse.success(result);
  }

  // ─── Terminology ───

  @Get('terminology/resolved')
  @ApiOperation({ summary: 'Get resolved terminology map for tenant' })
  async getTerminology(@CurrentUser('tenantId') tenantId: string) {
    const map = await this.termService.getResolved(tenantId);
    return ApiResponse.success(map);
  }

  @Get('terminology/overrides')
  @ApiOperation({ summary: 'List raw terminology overrides for tenant' })
  async listOverrides(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.termService.list(tenantId);
    return ApiResponse.success(data);
  }

  @Put('terminology/overrides')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upsert a single terminology override' })
  async upsertOverride(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: TerminologyItemDto,
  ) {
    const result = await this.termService.upsert(tenantId, dto);
    return ApiResponse.success(result);
  }

  @Put('terminology/overrides/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk upsert terminology overrides' })
  async bulkUpsert(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: BulkTerminologyDto,
  ) {
    const result = await this.termService.bulkUpsert(tenantId, dto.items);
    return ApiResponse.success(result);
  }

  @Delete('terminology/overrides/:termKey')
  @ApiOperation({ summary: 'Delete a terminology override' })
  async removeOverride(
    @CurrentUser('tenantId') tenantId: string,
    @Param('termKey') termKey: string,
    @Query('scope') scope?: string,
  ) {
    await this.termService.remove(tenantId, termKey, scope);
    return ApiResponse.success(null, 'Override removed');
  }
}
