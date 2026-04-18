"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../core/prisma/prisma.module");
const tenant_config_module_1 = require("../../softwarevendor/tenant-config/tenant-config.module");
const ai_controller_1 = require("./presentation/ai.controller");
const ai_unified_service_1 = require("./services/ai-unified.service");
const ai_settings_service_1 = require("./services/ai-settings.service");
const ai_usage_service_1 = require("./services/ai-usage.service");
const anthropic_provider_1 = require("./services/providers/anthropic.provider");
const openai_provider_1 = require("./services/providers/openai.provider");
const gemini_provider_1 = require("./services/providers/gemini.provider");
const groq_provider_1 = require("./services/providers/groq.provider");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, tenant_config_module_1.TenantConfigModule],
        controllers: [ai_controller_1.AiController],
        providers: [
            ai_unified_service_1.AiUnifiedService,
            ai_settings_service_1.AiSettingsService,
            ai_usage_service_1.AiUsageService,
            anthropic_provider_1.AnthropicProvider,
            openai_provider_1.OpenaiProvider,
            gemini_provider_1.GeminiProvider,
            groq_provider_1.GroqProvider,
        ],
        exports: [ai_unified_service_1.AiUnifiedService],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map