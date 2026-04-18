import { PrismaService } from '../../../../core/prisma/prisma.service';
import { OllamaService } from './ollama.service';
export interface ChunkResult {
    id: string;
    content: string;
    score: number;
    documentId: string;
    metadata?: Record<string, unknown>;
}
export declare class VectorStoreService {
    private readonly prisma;
    private readonly ollama;
    private readonly logger;
    private pgvectorEnabled;
    constructor(prisma: PrismaService, ollama: OllamaService);
    private initPgVector;
    chunkText(text: string, chunkSize?: number, overlap?: number): string[];
    storeEmbeddings(tenantId: string, datasetId: string, documentId: string, chunks: string[], embeddingModel: string): Promise<number>;
    search(tenantId: string, query: string, embeddingModel: string, datasetIds?: string[], topK?: number): Promise<ChunkResult[]>;
    private cosineSimilarity;
    deleteByDocument(documentId: string): Promise<number>;
    deleteByDataset(datasetId: string): Promise<number>;
    getStats(tenantId: string): Promise<{
        totalEmbeddings: number;
        totalTokens: number;
        datasetBreakdown: {
            datasetId: string;
            count: number;
        }[];
    }>;
}
