import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MasterCodeService } from '../services/master-code.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';

@ApiTags('PC Config — Resolved Fields')
@ApiBearerAuth()
@Controller('pc-config')
export class PcResolvedFieldsController {
  constructor(private readonly masterCodeService: MasterCodeService) {}

  /**
   * GET /pc-config/resolved-fields/:resolvedCode
   * Returns merged common + extra registration fields for the given resolved code.
   */
  @Get('resolved-fields/:resolvedCode')
  @ApiOperation({ summary: 'Get merged registration fields for a resolved code' })
  @RequirePermissions('platform:admin')
  async getResolvedFields(@Param('resolvedCode') resolvedCode: string) {
    const result = await this.masterCodeService.getResolvedFields(resolvedCode);
    return ApiResponse.success(result);
  }

  /**
   * GET /pc-config/combined-code/:code
   * Backward-compatible endpoint — reads from new table by resolvedCode.
   * Kept for 30-day deprecation window.
   */
  @Get('combined-code/:code')
  @ApiOperation({ summary: '[DEPRECATED] Get combined code by code string — use resolved-fields instead' })
  @RequirePermissions('platform:admin')
  async getByResolvedCode(@Param('code') code: string) {
    const result = await this.masterCodeService.getByResolvedCode(code);
    return ApiResponse.success(result);
  }
}
