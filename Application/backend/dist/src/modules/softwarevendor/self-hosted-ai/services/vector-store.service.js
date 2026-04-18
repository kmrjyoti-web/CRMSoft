"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VectorStoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorStoreService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const ollama_service_1 = require("./ollama.service");
let VectorStoreService = VectorStoreService_1 = class VectorStoreService {
    constructor(prisma, ollama) {
        this.prisma = prisma;
        this.ollama = ollama;
        this.logger = new common_1.Logger(VectorStoreService_1.name);
        this.pgvectorEnabled = false;
        this.initPgVector().catch(() => {
            this.logger.warn('pgvector extension not available � using cosine fallback');
        });
    }
    async initPgVector() {
        try {
            await this.prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector');
            this.pgvectorEnabled = true;
            this.logger.log('pgvector extension enabled');
        }
        catch {
            this.pgvectorEnabled = false;
        }
    }
    chunkText(text, chunkSize = 500, overlap = 50) {
        const words = text.split(/\s+/);
        const chunks = [];
        for (let i = 0; i < words.length; i += chunkSize - overlap) {
            const chunk = words.slice(i, i + chunkSize).join(' ');
            if (chunk.trim())
                chunks.push(chunk.trim());
        }
        return chunks;
    }
    async storeEmbeddings(tenantId, datasetId, documentId, chunks, embeddingModel) {
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
            }
            catch (e) {
                this.logger.error(`Failed to embed chunk ${i} of doc ${documentId}: ${e.message}`);
            }
        }
        return stored;
    }
    async search(tenantId, query, embeddingModel, datasetIds, topK = 5) {
        const queryEmbedding = await this.ollama.embed(embeddingModel, query);
        const where = { tenantId };
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
            }
            catch {
                return null;
            }
        })
            .filter((x) => x !== null && x.score > 0.3)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
        return scored;
    }
    cosineSimilarity(a, b) {
        if (a.length !== b.length || a.length === 0)
            return 0;
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
    async deleteByDocument(documentId) {
        const result = await this.prisma.aiEmbedding.deleteMany({
            where: { documentId },
        });
        return result.count;
    }
    async deleteByDataset(datasetId) {
        const result = await this.prisma.aiEmbedding.deleteMany({
            where: { datasetId },
        });
        return result.count;
    }
    async getStats(tenantId) {
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
};
exports.VectorStoreService = VectorStoreService;
exports.VectorStoreService = VectorStoreService = VectorStoreService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ollama_service_1.OllamaService])
], VectorStoreService);
//# sourceMappingURL=vector-store.service.js.map