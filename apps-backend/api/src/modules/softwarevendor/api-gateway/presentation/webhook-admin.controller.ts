import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { WebhookService } from '../services/webhook.service';
import { WebhookDispatcherService } from '../services/webhook-dispatcher.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';

@Controller('api-gateway/admin/webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookAdminController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly dispatcher: WebhookDispatcherService,
  ) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateWebhookDto) {
    return this.webhookService.create(
      req.user.tenantId,
      dto,
      req.user.id,
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
    );
  }

  @Get()
  async list(@Req() req: any) {
    return this.webhookService.listByTenant(req.user.tenantId);
  }

  @Get('events')
  getAvailableEvents() {
    return this.webhookService.getAvailableEvents();
  }

  @Get(':id')
  async getById(@Req() req: any, @Param('id') id: string) {
    return this.webhookService.getById(req.user.tenantId, id);
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateWebhookDto) {
    return this.webhookService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    await this.webhookService.delete(req.user.tenantId, id);
    return { message: 'Webhook endpoint deleted' };
  }

  @Get(':id/deliveries')
  async getDeliveries(
    @Req() req: any,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dispatcher.getDeliveries(
      req.user.tenantId,
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Post(':id/test')
  async testWebhook(@Req() req: any, @Param('id') id: string) {
    await this.dispatcher.dispatch(req.user.tenantId, 'webhook.test', id, {
      message: 'This is a test webhook delivery',
      timestamp: new Date().toISOString(),
    });
    return { message: 'Test webhook dispatched' };
  }
}
