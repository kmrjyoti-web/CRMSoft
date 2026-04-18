import { CredentialService } from '../../../softwarevendor/tenant-config/services/credential.service';
import { AiSettingsService } from './ai-settings.service';
import { AiUsageService } from './ai-usage.service';
import { AnthropicProvider } from './providers/anthropic.provider';
import { OpenaiProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';
interface AiRequestParams {
    tenantId: string;
    userId: string;
    provider?: string;
    model?: string;
    operation: string;
    systemPrompt: string;
    userPrompt: string;
    entityType?: string;
    entityId?: string;
}
export declare class AiUnifiedService {
    private readonly credentialService;
    private readonly settingsService;
    private readonly usageService;
    private readonly anthropic;
    private readonly openai;
    private readonly gemini;
    private readonly groq;
    private readonly logger;
    constructor(credentialService: CredentialService, settingsService: AiSettingsService, usageService: AiUsageService, anthropic: AnthropicProvider, openai: OpenaiProvider, gemini: GeminiProvider, groq: GroqProvider);
    execute(params: AiRequestParams): Promise<string>;
    generate(tenantId: string, userId: string, dto: {
        prompt: string;
        context?: string;
        provider?: string;
        model?: string;
        entityType?: string;
        entityId?: string;
    }): Promise<string>;
    improve(tenantId: string, userId: string, dto: {
        text: string;
        instruction: string;
        provider?: string;
        model?: string;
    }): Promise<string>;
    translate(tenantId: string, userId: string, dto: {
        text: string;
        targetLanguage: string;
        provider?: string;
        model?: string;
    }): Promise<string>;
    summarize(tenantId: string, userId: string, dto: {
        text: string;
        maxLength?: number;
        provider?: string;
        model?: string;
    }): Promise<string>;
    changeTone(tenantId: string, userId: string, dto: {
        text: string;
        tone: string;
        provider?: string;
        model?: string;
    }): Promise<string>;
    private routeToProvider;
}
export {};
