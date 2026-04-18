"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginsModule = void 0;
const common_1 = require("@nestjs/common");
const tenant_config_module_1 = require("../softwarevendor/tenant-config/tenant-config.module");
const plugin_service_1 = require("./services/plugin.service");
const plugin_hook_service_1 = require("./services/plugin-hook.service");
const plugin_health_service_1 = require("./services/plugin-health.service");
const plugin_menu_service_1 = require("./services/plugin-menu.service");
const plugin_usage_service_1 = require("./services/plugin-usage.service");
const handler_registry_1 = require("./handlers/handler-registry");
const whatsapp_handler_1 = require("./handlers/whatsapp.handler");
const razorpay_handler_1 = require("./handlers/razorpay.handler");
const stripe_handler_1 = require("./handlers/stripe.handler");
const gmail_handler_1 = require("./handlers/gmail.handler");
const tally_handler_1 = require("./handlers/tally.handler");
const gst_handler_1 = require("./handlers/gst.handler");
const msg91_handler_1 = require("./handlers/msg91.handler");
const exotel_handler_1 = require("./handlers/exotel.handler");
const plugin_controller_1 = require("./presentation/plugin.controller");
const plugin_health_controller_1 = require("./presentation/plugin-health.controller");
const plugin_webhook_controller_1 = require("./presentation/plugin-webhook.controller");
const PLUGIN_HANDLERS = [
    whatsapp_handler_1.WhatsAppPluginHandler,
    razorpay_handler_1.RazorpayPluginHandler,
    stripe_handler_1.StripePluginHandler,
    gmail_handler_1.GmailPluginHandler,
    tally_handler_1.TallyPluginHandler,
    gst_handler_1.GstPluginHandler,
    msg91_handler_1.Msg91PluginHandler,
    exotel_handler_1.ExotelPluginHandler,
];
let PluginsModule = class PluginsModule {
};
exports.PluginsModule = PluginsModule;
exports.PluginsModule = PluginsModule = __decorate([
    (0, common_1.Module)({
        imports: [tenant_config_module_1.TenantConfigModule],
        controllers: [
            plugin_controller_1.PluginController,
            plugin_health_controller_1.PluginHealthController,
            plugin_webhook_controller_1.PluginWebhookController,
        ],
        providers: [
            handler_registry_1.PluginHandlerRegistry,
            plugin_service_1.PluginService,
            plugin_hook_service_1.PluginHookService,
            plugin_health_service_1.PluginHealthService,
            plugin_menu_service_1.PluginMenuService,
            plugin_usage_service_1.PluginUsageService,
            ...PLUGIN_HANDLERS,
        ],
        exports: [
            plugin_service_1.PluginService,
            plugin_hook_service_1.PluginHookService,
            plugin_health_service_1.PluginHealthService,
            plugin_menu_service_1.PluginMenuService,
            plugin_usage_service_1.PluginUsageService,
            handler_registry_1.PluginHandlerRegistry,
        ],
    })
], PluginsModule);
//# sourceMappingURL=plugins.module.js.map