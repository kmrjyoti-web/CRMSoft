import type { AiProviderResult } from './anthropic.provider';
export declare class GeminiProvider {
    private readonly logger;
    generate(model: string, apiKey: string, systemPrompt: string, userPrompt: string): Promise<AiProviderResult>;
}
