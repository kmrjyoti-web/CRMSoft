import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../core/prisma/prisma.service';
export interface OllamaModelInfo {
    name: string;
    size: number;
    digest: string;
    modifiedAt: string;
    parameterSize?: string;
}
export declare class OllamaService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    private client;
    private ollamaHost;
    private activePulls;
    private cancelledPulls;
    constructor(prisma: PrismaService, config: ConfigService);
    checkHealth(): Promise<{
        connected: boolean;
        version?: string;
        error?: string;
    }>;
    listLocalModels(): Promise<OllamaModelInfo[]>;
    pullModel(modelName: string, tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    cancelPull(modelName: string, tenantId: string): Promise<void>;
    private pullModelAsync;
    deleteModel(modelName: string, tenantId: string): Promise<void>;
    getModelStatus(tenantId: string): Promise<any[]>;
    setDefaultModel(tenantId: string, modelId: string, isEmbedding: boolean): Promise<void>;
    generate(modelName: string, prompt: string, systemPrompt?: string): Promise<{
        content: string;
        tokenCount: number;
        latencyMs: number;
    }>;
    chat(modelName: string, messages: {
        role: string;
        content: string;
    }[]): Promise<{
        content: string;
        tokenCount: number;
        latencyMs: number;
    }>;
    embed(modelName: string, text: string): Promise<number[]>;
    embedBatch(modelName: string, texts: string[]): Promise<number[][]>;
}
