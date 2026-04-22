import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CredentialService } from '../../../softwarevendor/tenant-config/services/credential.service';
import { AiSettingsService } from './ai-settings.service';
import { AiUsageService } from './ai-usage.service';
import { AnthropicProvider } from './providers/anthropic.provider';
import { OpenaiProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';
import type { AiProviderResult } from './providers/anthropic.provider';

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

@Injectable()
export class AiUnifiedService {
  private readonly logger = new Logger(AiUnifiedService.name);

  constructor(
    private readonly credentialService: CredentialService,
    private readonly settingsService: AiSettingsService,
    private readonly usageService: AiUsageService,
    private readonly anthropic: AnthropicProvider,
    private readonly openai: OpenaiProvider,
    private readonly gemini: GeminiProvider,
    private readonly groq: GroqProvider,
  ) {}

  async execute(params: AiRequestParams): Promise<string> {
    const settings = await this.settingsService.get(params.tenantId);

    if (!settings.isEnabled) {
      throw new BadRequestException('AI features are disabled for this tenant');
    }

    // Resolve provider and model
    const taskOverrides = (settings.taskOverrides as Record<string, string>) || {};
    let provider = params.provider ?? settings.defaultProvider;
    let model = params.model ?? settings.defaultModel;

    // Check task-specific override (format: "PROVIDER:model-id")
    if (!params.provider && taskOverrides[params.operation]) {
      const [overrideProvider, overrideModel] = taskOverrides[params.operation].split(':');
      provider = overrideProvider;
      model = overrideModel;
    }

    // Get credentials
    const creds = await this.credentialService.get(params.tenantId, provider as any);
    if (!creds?.apiKey) {
      throw new BadRequestException(
        `No API key configured for ${provider}. Add credentials in Settings > API Credentials.`,
      );
    }

    const start = Date.now();
    let result: AiProviderResult;
    let error = '';

    try {
      result = await this.routeToProvider(provider, model, creds, params.systemPrompt, params.userPrompt);
    } catch (e: any) {
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
      throw new BadRequestException(`AI generation failed: ${error}`);
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

  // -- Public Operation Methods -----------------------------

  async generate(tenantId: string, userId: string, dto: {
    prompt: string; context?: string; provider?: string; model?: string; entityType?: string; entityId?: string;
  }) {
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

  async improve(tenantId: string, userId: string, dto: {
    text: string; instruction: string; provider?: string; model?: string;
  }) {
    const systemPrompt = 'You are a professional editor. Improve the given text according to the instruction. Return only the improved text in HTML format, no explanations.';
    const userPrompt = `Instruction: ${dto.instruction}\n\nText to improve:\n${dto.text}`;

    return this.execute({
      tenantId, userId, provider: dto.provider, model: dto.model,
      operation: 'improve', systemPrompt, userPrompt,
    });
  }

  async translate(tenantId: string, userId: string, dto: {
    text: string; targetLanguage: string; provider?: string; model?: string;
  }) {
    const systemPrompt = `You are a professional translator. Translate the given text to ${dto.targetLanguage}. Preserve formatting and HTML tags. Return only the translated text.`;
    return this.execute({
      tenantId, userId, provider: dto.provider, model: dto.model,
      operation: 'translate', systemPrompt, userPrompt: dto.text,
    });
  }

  async summarize(tenantId: string, userId: string, dto: {
    text: string; maxLength?: number; provider?: string; model?: string;
  }) {
    const maxLen = dto.maxLength || 200;
    const systemPrompt = `You are a professional summarizer. Summarize the given text concisely in about ${maxLen} words. Return the summary in HTML format.`;
    return this.execute({
      tenantId, userId, provider: dto.provider, model: dto.model,
      operation: 'summarize', systemPrompt, userPrompt: dto.text,
    });
  }

  async changeTone(tenantId: string, userId: string, dto: {
    text: string; tone: string; provider?: string; model?: string;
  }) {
    const systemPrompt = `You are a professional writer. Rewrite the given text in a ${dto.tone} tone. Keep the same meaning but adjust the style. Return only the rewritten text in HTML format.`;
    return this.execute({
      tenantId, userId, provider: dto.provider, model: dto.model,
      operation: 'tone', systemPrompt, userPrompt: dto.text,
    });
  }

  // -- Private ----------------------------------------------

  private async routeToProvider(
    provider: string,
    model: string,
    creds: any,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<AiProviderResult> {
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
        throw new BadRequestException(`Unsupported AI provider: ${provider}`);
    }
  }
}
