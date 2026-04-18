"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiUnifiedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiUnifiedService = void 0;
const common_1 = require("@nestjs/common");
const credential_service_1 = require("../../../softwarevendor/tenant-config/services/credential.service");
const ai_settings_service_1 = require("./ai-settings.service");
const ai_usage_service_1 = require("./ai-usage.service");
const anthropic_provider_1 = require("./providers/anthropic.provider");
const openai_provider_1 = require("./providers/openai.provider");
const gemini_provider_1 = require("./providers/gemini.provider");
const groq_provider_1 = require("./providers/groq.provider");
let AiUnifiedService = AiUnifiedService_1 = class AiUnifiedService {
    constructor(credentialService, settingsService, usageService, anthropic, openai, gemini, groq) {
        this.credentialService = credentialService;
        this.settingsService = settingsService;
        this.usageService = usageService;
        this.anthropic = anthropic;
        this.openai = openai;
        this.gemini = gemini;
        this.groq = groq;
        this.logger = new common_1.Logger(AiUnifiedService_1.name);
    }
    async execute(params) {
        const settings = await this.settingsService.get(params.tenantId);
        if (!settings.isEnabled) {
            throw new common_1.BadRequestException('AI features are disabled for this tenant');
        }
        const taskOverrides = settings.taskOverrides || {};
        let provider = params.provider ?? settings.defaultProvider;
        let model = params.model ?? settings.defaultModel;
        if (!params.provider && taskOverrides[params.operation]) {
            const [overrideProvider, overrideModel] = taskOverrides[params.operation].split(':');
            provider = overrideProvider;
            model = overrideModel;
        }
        const creds = await this.credentialService.get(params.tenantId, provider);
        if (!creds?.apiKey) {
            throw new common_1.BadRequestException(`No API key configured for ${provider}. Add credentials in Settings > API Credentials.`);
        }
        const start = Date.now();
        let result;
        let error = '';
        try {
            result = await this.routeToProvider(provider, model, creds, params.systemPrompt, params.userPrompt);
        }
        catch (e) {
            error = (e instanceof Error ? e.message : String(e));
            await this.usageService.log({
                tenantId: params.tenantId,
                userId: params.userId,
                provider,
                model,
                operation: params.operation,
                latencyMs: Date.now() - start,
                success: false,
                errorMessage: error,
                entityType: params.entityType,
                entityId: params.entityId,
            });
            throw new common_1.BadRequestException(`AI generation failed: ${error}`);
        }
        await this.usageService.log({
            tenantId: params.tenantId,
            userId: params.userId,
            provider,
            model,
            operation: params.operation,
            promptTokens: result.usage.promptTokens,
            outputTokens: result.usage.outputTokens,
            latencyMs: Date.now() - start,
            success: true,
            entityType: params.entityType,
            entityId: params.entityId,
        });
        return result.content;
    }
    async generate(tenantId, userId, dto) {
        const systemPrompt = 'You are a professional business document writer for a CRM system. Generate well-structured, professional content based on the user\'s request. Use HTML formatting for rich text output.';
        const userPrompt = dto.context
            ? `Context:\n${dto.context}\n\nRequest:\n${dto.prompt}`
            : dto.prompt;
        return this.execute({
            tenantId, userId, provider: dto.provider, model: dto.model,
            operation: 'generate', systemPrompt, userPrompt,
            entityType: dto.entityType, entityId: dto.entityId,
        });
    }
    async improve(tenantId, userId, dto) {
        const systemPrompt = 'You are a professional editor. Improve the given text according to the instruction. Return only the improved text in HTML format, no explanations.';
        const userPrompt = `Instruction: ${dto.instruction}\n\nText to improve:\n${dto.text}`;
        return this.execute({
            tenantId, userId, provider: dto.provider, model: dto.model,
            operation: 'improve', systemPrompt, userPrompt,
        });
    }
    async translate(tenantId, userId, dto) {
        const systemPrompt = `You are a professional translator. Translate the given text to ${dto.targetLanguage}. Preserve formatting and HTML tags. Return only the translated text.`;
        return this.execute({
            tenantId, userId, provider: dto.provider, model: dto.model,
            operation: 'translate', systemPrompt, userPrompt: dto.text,
        });
    }
    async summarize(tenantId, userId, dto) {
        const maxLen = dto.maxLength || 200;
        const systemPrompt = `You are a professional summarizer. Summarize the given text concisely in about ${maxLen} words. Return the summary in HTML format.`;
        return this.execute({
            tenantId, userId, provider: dto.provider, model: dto.model,
            operation: 'summarize', systemPrompt, userPrompt: dto.text,
        });
    }
    async changeTone(tenantId, userId, dto) {
        const systemPrompt = `You are a professional writer. Rewrite the given text in a ${dto.tone} tone. Keep the same meaning but adjust the style. Return only the rewritten text in HTML format.`;
        return this.execute({
            tenantId, userId, provider: dto.provider, model: dto.model,
            operation: 'tone', systemPrompt, userPrompt: dto.text,
        });
    }
    async routeToProvider(provider, model, creds, systemPrompt, userPrompt) {
        switch (provider) {
            case 'ANTHROPIC_CLAUDE':
                return this.anthropic.generate(model, creds.apiKey, systemPrompt, userPrompt);
            case 'OPENAI_GPT':
                return this.openai.generate(model, creds.apiKey, systemPrompt, userPrompt, creds.organizationId);
            case 'GOOGLE_GEMINI':
                return this.gemini.generate(model, creds.apiKey, systemPrompt, userPrompt);
            case 'GROQ':
                return this.groq.generate(model, creds.apiKey, systemPrompt, userPrompt);
            default:
                throw new common_1.BadRequestException(`Unsupported AI provider: ${provider}`);
        }
    }
};
exports.AiUnifiedService = AiUnifiedService;
exports.AiUnifiedService = AiUnifiedService = AiUnifiedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [credential_service_1.CredentialService,
        ai_settings_service_1.AiSettingsService,
        ai_usage_service_1.AiUsageService,
        anthropic_provider_1.AnthropicProvider,
        openai_provider_1.OpenaiProvider,
        gemini_provider_1.GeminiProvider,
        groq_provider_1.GroqProvider])
], AiUnifiedService);
//# sourceMappingURL=ai-unified.service.js.map