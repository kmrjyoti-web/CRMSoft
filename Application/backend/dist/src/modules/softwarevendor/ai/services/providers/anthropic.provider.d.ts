export interface AiProviderResult {
    content: string;
    usage: {
        promptTokens: number;
        outputTokens: number;
    };
}
export declare class AnthropicProvider {
    private readonly logger;
    generate(model: string, apiKey: string, systemPrompt: string, userPrompt: string): Promise<AiProviderResult>;
}
