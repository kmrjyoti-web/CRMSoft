import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { DataMaskingService } from '../services/data-masking.service';
import { CreateMaskingPolicyDto, UpdateMaskingPolicyDto } from './dto/create-masking-policy.dto';
import { UnmaskRequestDto } from './dto/unmask-request.dto';

@ApiTags('Data Masking')
@ApiBearerAuth()
@Controller('data-masking')
export class DataMaskingController {
  constructor(private readonly service: DataMaskingService) {}

  @Get(':tableKey')
  @ApiOperation({ summary: 'Get masking rules for current user on a table' })
  async getRules(
    @Param('tableKey') tableKey: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roleId') roleId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const rules = await this.service.getMaskingRules(tableKey, userId, roleId, tenantId);
    return ApiResponse.success(rules);
  }

  @Get()
  @ApiOperation({ summary: 'List all masking policies (admin only)' })
  @RequirePermissions('data-masking:manage')
  async listPolicies(
    @CurrentUser('tenantId') tenantId: string,
    @Query('tableKey') tableKey?: string,
  ) {
    const policies = await this.service.listPolicies(tenantId, tableKey);
    return ApiResponse.success(policies);
  }

  @Post()
  @ApiOperation({ summary: 'Create masking policy (admin only)' })
  @RequirePermissions('data-masking:manage')
  async createPolicy(
    @Body() dto: CreateMaskingPolicyDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const policy = await this.service.createPolicy(tenantId, dto);
    return ApiResponse.success(policy, 'Masking policy created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update masking policy (admin only)' })
  @RequirePermissions('data-masking:manage')
  async updatePolicy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaskingPolicyDto,
  ) {
    const policy = await this.service.updatePolicy(id, dto);
    return ApiResponse.success(policy, 'Masking policy updated');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete masking policy (admin only)' })
  @RequirePermissions('data-masking:manage')
  async deletePolicy(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.service.deletePolicy(id);
    return ApiResponse.success(result, 'Masking policy deleted');
  }

  @Post('unmask')
  @ApiOperation({ summary: 'Unmask a specific field value (logs audit trail)' })
  async unmask(
    @Body() dto: UnmaskRequestDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const value = await this.service.getUnmaskedValue(
      dto.tableKey,
      dto.columnId,
      dto.recordId,
      userId,
      tenantId,
    );
    return ApiResponse.success({ value }, 'Value unmasked');
  }
}
