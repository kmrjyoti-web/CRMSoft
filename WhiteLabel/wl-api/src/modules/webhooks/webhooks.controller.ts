import { Controller, Post, Get, Headers, Req, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

interface RawRequest { rawBody?: Buffer }

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('razorpay')
  async handleRazorpay(
    @Req() req: RawRequest,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody = req.rawBody ?? Buffer.from('{}');
    await this.webhooksService.handleRazorpayEvent(rawBody, signature ?? '');
    return { received: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('events')
  getEvents(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('source') source?: string,
  ) {
    return this.webhooksService.getEvents({ page: +page, limit: +limit, status, source });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('dashboard')
  getDashboard() {
    return this.webhooksService.getDashboard();
  }
}
