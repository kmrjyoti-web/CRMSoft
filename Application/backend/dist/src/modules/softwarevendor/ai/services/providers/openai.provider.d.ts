import type { AiProviderResult } from './anthropic.provider';
export declare class OpenaiProvider {
    private readonly logger;
    generate(model: string, apiKey: string, systemPrompt: string, userPrompt: string, organizationId?: string): Promise<AiProviderResult>;
}
