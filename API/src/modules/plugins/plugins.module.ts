import { Module } from '@nestjs/common';
import { TenantConfigModule } from '../tenant-config/tenant-config.module';

// Core services
import { PluginService } from './services/plugin.service';
import { PluginHookService } from './services/plugin-hook.service';
import { PluginHealthService } from './services/plugin-health.service';
import { PluginMenuService } from './services/plugin-menu.service';
import { PluginUsageService } from './services/plugin-usage.service';

// Handler registry + handlers
import { PluginHandlerRegistry } from './handlers/handler-registry';
import { WhatsAppPluginHandler } from './handlers/whatsapp.handler';
import { RazorpayPluginHandler } from './handlers/razorpay.handler';
import { StripePluginHandler } from './handlers/stripe.handler';
import { GmailPluginHandler } from './handlers/gmail.handler';
import { TallyPluginHandler } from './handlers/tally.handler';
import { GstPluginHandler } from './handlers/gst.handler';
import { Msg91PluginHandler } from './handlers/msg91.handler';
import { ExotelPluginHandler } from './handlers/exotel.handler';

// Controllers
import { PluginController } from './presentation/plugin.controller';
import { PluginHealthController } from './presentation/plugin-health.controller';
import { PluginWebhookController } from './presentation/plugin-webhook.controller';

const PLUGIN_HANDLERS = [
  WhatsAppPluginHandler,
  RazorpayPluginHandler,
  StripePluginHandler,
  GmailPluginHandler,
  TallyPluginHandler,
  GstPluginHandler,
  Msg91PluginHandler,
  ExotelPluginHandler,
];

@Module({
  imports: [TenantConfigModule],
  controllers: [
    PluginController,
    PluginHealthController,
    PluginWebhookController,
  ],
  providers: [
    PluginHandlerRegistry,
    PluginService,
    PluginHookService,
    PluginHealthService,
    PluginMenuService,
    PluginUsageService,
    ...PLUGIN_HANDLERS,
  ],
  exports: [
    PluginService,
    PluginHookService,
    PluginHealthService,
    PluginMenuService,
    PluginUsageService,
    PluginHandlerRegistry,
  ],
})
export class PluginsModule {}
