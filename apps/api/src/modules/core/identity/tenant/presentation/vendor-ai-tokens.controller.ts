import {
  Controller, Get, Put, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { ApiResponse } from '../../../../../common/utils/api-response';

@ApiTags('Vendor AI Tokens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/ai-tokens')
export class VendorAiTokensController {
  @Get('usage')
  @ApiOperation({ summary: 'Get AI token usage summary (stub)' })
  async getUsage() {
    return ApiResponse.success({
      totalTokens: 0,
      usedTokens: 0,
      remainingTokens: 0,
    });
  }

  @Get('tenants')
  @ApiOperation({ summary: 'List AI token usage per tenant (stub)' })
  async listTenantUsage(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return ApiResponse.paginated([], 0, +page, +limit);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get AI token settings (stub)' })
  async getSettings() {
    return ApiResponse.success({
      enabled: false,
      maxTokensPerTenant: 10000,
      defaultModel: 'claude-sonnet-4-6',
    });
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update AI token settings (stub)' })
  async updateSettings(@Body() body: any) {
    return ApiResponse.success(body, 'AI token settings updated');
  }
}
