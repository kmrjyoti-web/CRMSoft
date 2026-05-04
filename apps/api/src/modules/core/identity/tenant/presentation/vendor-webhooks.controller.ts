import {
  Controller, Get, Post, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { ApiResponse } from '../../../../../common/utils/api-response';

@ApiTags('Vendor Webhooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/webhooks')
export class VendorWebhooksController {
  @Get()
  @ApiOperation({ summary: 'List webhooks (stub)' })
  async list(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return ApiResponse.paginated([], 0, +page, +limit);
  }

  @Get(':webhookId/deliveries')
  @ApiOperation({ summary: 'List deliveries for a webhook (stub)' })
  async listDeliveries(@Param('webhookId') webhookId: string) {
    return ApiResponse.success([]);
  }

  @Post(':webhookId/test')
  @ApiOperation({ summary: 'Send a test webhook delivery (stub)' })
  async testWebhook(@Param('webhookId') webhookId: string) {
    return ApiResponse.success({ delivered: true });
  }

  @Post('deliveries/:deliveryId/retry')
  @ApiOperation({ summary: 'Retry a failed webhook delivery (stub)' })
  async retryDelivery(@Param('deliveryId') deliveryId: string) {
    return ApiResponse.success({ retried: true });
  }
}
