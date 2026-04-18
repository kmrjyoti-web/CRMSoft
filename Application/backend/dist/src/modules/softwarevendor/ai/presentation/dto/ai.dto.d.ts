export declare class GenerateContentDto {
    prompt: string;
    context?: string;
    provider?: string;
    model?: string;
    entityType?: string;
    entityId?: string;
}
export declare class ImproveTextDto {
    text: string;
    instruction: string;
    provider?: string;
    model?: string;
}
export declare class TranslateTextDto {
    text: string;
    targetLanguage: string;
    provider?: string;
    model?: string;
}
export declare class SummarizeTextDto {
    text: string;
    maxLength?: number;
    provider?: string;
    model?: string;
}
export declare class ChangeToneDto {
    text: string;
    tone: 'formal' | 'casual' | 'professional' | 'friendly';
    provider?: string;
    model?: string;
}
export declare class UpdateAiSettingsDto {
    defaultProvider?: string;
    defaultModel?: string;
    taskOverrides?: Record<string, string>;
    isEnabled?: boolean;
    monthlyTokenBudget?: number;
}
