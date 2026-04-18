export interface AiModelInfo {
    id: string;
    label: string;
    context: number;
    costTier: 'low' | 'medium' | 'high';
}
export declare const AI_MODELS: Record<string, AiModelInfo[]>;
export declare const MODEL_SUGGESTIONS: Record<string, {
    provider: string;
    model: string;
    reason: string;
}>;
