import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { OllamaService } from './ollama.service';

export interface ChunkResult {
  id: string;
  content: string;
  score: number;
  documentId: string;
  metadata?: any;
}

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);
  private pgvectorEnabled = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ollama: OllamaService,
  ) {
    this.initPgVector().catch(() => {
      this.logger.warn('pgvector extension not available — using cosine fallback');
    });
  }

  private async initPgVector(): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector');
      this.pgvectorEnabled = true;
      this.logger.log('pgvector extension enabled');
    } catch {
      this.pgvectorEnabled = false;
    }
  }

  // ── Text Chunking ──

  chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim()) chunks.push(chunk.trim());
    }
    return chunks;
  }

  // ── Embedding Storage ──

  async storeEmbeddings(
    tenantId: string,
    datasetId: string,
    documentId: string,
    chunks: string[],
    embeddingModel: string,
  ): Promise<number> {
    let stored = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const embedding = await this.ollama.embed(embeddingModel, chunk);
        const embeddingStr = JSON.stringify(embedding);

        await this.prisma.aiEmbedding.create({
          data: {
            tenantId,
            datasetId,
            documentId,
            chunkIndex: i,
            content: chunk,
            embedding: embeddingStr,
            tokenCount: Math.ceil(chunk.split(/\s+/).length * 1.3),
          },
        });
        stored++;
      } catch (e: any) {
        this.logger.error(`Failed to embed chunk ${i} of doc ${documentId}: ${e.message}`);
      }
    }

    return stored;
  }

  // ── Similarity Search ──

  async search(
    tenantId: string,
    query: string,
    embeddingModel: string,
    datasetIds?: string[],
    topK = 5,
  ): Promise<ChunkResult[]> {
    const queryEmbedding = await this.ollama.embed(embeddingModel, query);

    // Fetch candidate embeddings
    const where: any = { tenantId };
    if (datasetIds?.length) {
      where.datasetId = { in: datasetIds };
    }

    const candidates = await this.prisma.aiEmbedding.findMany({
      where,
      select: {
        id: true,
        content: true,
        embedding: true,
        documentId: true,
        metadata: true,
        chunkIndex: true,
      },
      take: 1000,
    });

    // Compute cosine similarity in-memory
    const scored = candidates
      .map((c) => {
        try {
          const stored = JSON.parse(c.embedding);
          const score = this.cosineSimilarity(queryEmbedding, stored);
          return {
            id: c.id,
            content: c.content,
            score,
            documentId: c.documentId,
            metadata: c.metadata,
          };
        } catch {
          return null;
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null && x.score > 0.3)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, topK) as ChunkResult[];

    return scored;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dotProduct / denom;
  }

  // ── Cleanup ──

  async deleteByDocument(documentId: string): Promise<number> {
    const result = await this.prisma.aiEmbedding.deleteMany({
      where: { documentId },
    });
    return result.count;
  }

  async deleteByDataset(datasetId: string): Promise<number> {
    const result = await this.prisma.aiEmbedding.deleteMany({
      where: { datasetId },
    });
    return result.count;
  }

  async getStats(tenantId: string): Promise<{
    totalEmbeddings: number;
    totalTokens: number;
    datasetBreakdown: { datasetId: string; count: number }[];
  }> {
    const [total, tokens, breakdown] = await Promise.all([
      this.prisma.aiEmbedding.count({ where: { tenantId } }),
      this.prisma.aiEmbedding.aggregate({
        where: { tenantId },
        _sum: { tokenCount: true },
      }),
      this.prisma.aiEmbedding.groupBy({
        by: ['datasetId'],
        where: { tenantId },
        _count: { id: true },
      }),
    ]);

    return {
      totalEmbeddings: total,
      totalTokens: tokens._sum.tokenCount ?? 0,
      datasetBreakdown: breakdown.map((b) => ({
        datasetId: b.datasetId,
        count: b._count.id,
      })),
    };
  }
}
