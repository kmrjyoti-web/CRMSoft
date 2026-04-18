export declare class PullModelDto {
    modelName: string;
}
export declare class SetDefaultModelDto {
    modelId: string;
    isEmbedding?: boolean;
}
export declare class CreateDatasetDto {
    name: string;
    description?: string;
    sourceType?: string;
    entityType?: string;
}
export declare class UpdateDatasetDto {
    name?: string;
    description?: string;
}
export declare class AddDocumentDto {
    title: string;
    content: string;
    contentType?: string;
    sourceUrl?: string;
}
export declare class UpdateDocumentDto {
    title?: string;
    content?: string;
}
export declare class StartTrainingDto {
    datasetId: string;
    modelId: string;
    config?: Record<string, unknown>;
}
export declare class ImportCrmDataDto {
    entityType: string;
}
export declare class ImportUrlDto {
    url: string;
    title?: string;
}
export declare class CreateSessionDto {
    modelId: string;
    title?: string;
    datasetIds?: string[];
    systemPromptId?: string;
}
export declare class SendMessageDto {
    message: string;
}
export declare class QuickChatDto {
    modelId: string;
    message: string;
    systemPrompt?: string;
    datasetIds?: string[];
}
export declare class CreateSystemPromptDto {
    name: string;
    description?: string;
    prompt: string;
    category?: string;
    isDefault?: boolean;
    variables?: Record<string, unknown>;
}
export declare class UpdateSystemPromptDto {
    name?: string;
    description?: string;
    prompt?: string;
    category?: string;
    isDefault?: boolean;
    variables?: Record<string, unknown>;
}
export declare class UpdateWidgetConfigDto {
    enabled?: boolean;
    title?: string;
    subtitle?: string;
    primaryColor?: string;
    position?: string;
    modelId?: string;
    datasetIds?: string[];
    systemPromptId?: string;
}
