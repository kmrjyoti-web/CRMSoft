import { Controller, Get, Post, Query, Body, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../common/decorators/roles.decorator';
import { WaWebhookService } from '../services/wa-webhook.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@ApiTags('WhatsApp Webhook')
@Controller('whatsapp/webhook')
export class WhatsAppWebhookController {
  constructor(
    private readonly webhookService: WaWebhookService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Public()
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    // Look up WABA by verify token
    const waba = await this.prisma.working.whatsAppBusinessAccount.findFirst({
      where: { webhookVerifyToken: token },
    });
    if (!waba) return 'Invalid token';

    const result = this.webhookService.verifyWebhook(mode, token, challenge, waba.webhookVerifyToken);
    return result || 'Verification failed';
  }

  @Post()
  @Public()
  @HttpCode(200)
  async receiveWebhook(@Body() body: any) {
    await this.webhookService.processWebhook(body);
    return 'EVENT_RECEIVED';
  }
}
