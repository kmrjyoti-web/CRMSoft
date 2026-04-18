"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfHostedAiModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("../../../core/prisma/prisma.module");
const self_hosted_ai_controller_1 = require("./presentation/self-hosted-ai.controller");
const ollama_service_1 = require("./services/ollama.service");
const vector_store_service_1 = require("./services/vector-store.service");
const ai_training_service_1 = require("./services/ai-training.service");
const ai_chat_service_1 = require("./services/ai-chat.service");
const document_import_service_1 = require("./services/document-import.service");
const crm_data_agent_service_1 = require("./services/crm-data-agent.service");
let SelfHostedAiModule = class SelfHostedAiModule {
};
exports.SelfHostedAiModule = SelfHostedAiModule;
exports.SelfHostedAiModule = SelfHostedAiModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, config_1.ConfigModule],
        controllers: [self_hosted_ai_controller_1.SelfHostedAiController],
        providers: [
            ollama_service_1.OllamaService,
            vector_store_service_1.VectorStoreService,
            ai_training_service_1.AiTrainingService,
            ai_chat_service_1.AiChatService,
            document_import_service_1.DocumentImportService,
            crm_data_agent_service_1.CrmDataAgentService,
        ],
        exports: [ollama_service_1.OllamaService, ai_chat_service_1.AiChatService],
    })
], SelfHostedAiModule);
//# sourceMappingURL=self-hosted-ai.module.js.map