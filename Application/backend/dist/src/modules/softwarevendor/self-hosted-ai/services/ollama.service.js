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
var OllamaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const ollama_1 = require("ollama");
let OllamaService = OllamaService_1 = class OllamaService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.logger = new common_1.Logger(OllamaService_1.name);
        this.activePulls = new Map();
        this.cancelledPulls = new Set();
        this.ollamaHost = this.config.get('OLLAMA_HOST', 'http://localhost:11434');
        this.client = new ollama_1.Ollama({ host: this.ollamaHost });
    }
    async checkHealth() {
        try {
            const models = await this.client.list();
            return { connected: true, version: 'running' };
        }
        catch (e) {
            return { connected: false, error: (e instanceof Error ? e.message : String(e)) };
        }
    }
    async listLocalModels() {
        try {
            const response = await this.client.list();
            return (response.models || []).map((m) => ({
                name: m.name,
                size: m.size ?? 0,
                digest: m.digest ?? '',
                modifiedAt: m.modified_at ?? '',
                parameterSize: m.details?.parameter_size ?? '',
            }));
        }
        catch (e) {
            this.logger.error('Failed to list Ollama models', (e instanceof Error ? e.message : String(e)));
            return [];
        }
    }
    async pullModel(modelName, tenantId) {
        const existing = await this.prisma.aiModel.findUnique({
            where: { tenantId_modelId: { tenantId, modelId: modelName } },
        });
        if (!existing) {
            await this.prisma.aiModel.create({
                data: {
                    tenantId,
                    name: modelName.split(':')[0],
                    modelId: modelName,
                    source: 'OLLAMA',
                    status: 'DOWNLOADING',
                    downloadProgress: 0,
                },
            });
        }
        else {
            await this.prisma.aiModel.update({
                where: { id: existing.id },
                data: { status: 'DOWNLOADING', downloadProgress: 0 },
            });
        }
        const pullClient = new ollama_1.Ollama({ host: this.ollamaHost });
        this.activePulls.set(modelName, pullClient);
        this.cancelledPulls.delete(modelName);
        this.pullModelAsync(modelName, tenantId, pullClient)
            .catch((e) => {
            if (!this.cancelledPulls.has(modelName)) {
                this.logger.error(`Model pull failed: ${modelName}`, e.message);
            }
        })
            .finally(() => {
            this.activePulls.delete(modelName);
            this.cancelledPulls.delete(modelName);
        });
        return { success: true, message: `Pulling ${modelName}...` };
    }
    async cancelPull(modelName, tenantId) {
        this.logger.log(`Cancelling pull for ${modelName}`);
        this.cancelledPulls.add(modelName);
        const pullClient = this.activePulls.get(modelName);
        if (pullClient) {
            pullClient.abort();
            this.activePulls.delete(modelName);
        }
        await this.prisma.aiModel.updateMany({
            where: { tenantId, modelId: modelName },
            data: { status: 'NOT_INSTALLED', downloadProgress: 0 },
        });
        try {
            await this.client.delete({ model: modelName });
        }
        catch { }
        this.logger.log(`Pull cancelled for ${modelName}`);
    }
    async pullModelAsync(modelName, tenantId, pullClient) {
        try {
            const stream = await pullClient.pull({ model: modelName, stream: true });
            for await (const progress of stream) {
                if (this.cancelledPulls.has(modelName)) {
                    return;
                }
                if (progress.total && progress.completed) {
                    const pct = (progress.completed / progress.total) * 100;
                    await this.prisma.aiModel.updateMany({
                        where: { tenantId, modelId: modelName },
                        data: { downloadProgress: Math.round(pct) },
                    });
                }
            }
            if (this.cancelledPulls.has(modelName))
                return;
            const info = await this.client.show({ model: modelName });
            const localModels = await this.client.list();
            const pulled = localModels.models?.find((m) => m.name === modelName || m.name.startsWith(modelName));
            await this.prisma.aiModel.updateMany({
                where: { tenantId, modelId: modelName },
                data: {
                    status: 'AVAILABLE',
                    downloadProgress: 100,
                    sizeBytes: pulled?.size ?? 0,
                    parameterCount: info?.details?.parameter_size ?? null,
                    contextLength: info?.model_info?.context_length ?? 4096,
                },
            });
            this.logger.log(`Model ${modelName} pulled successfully`);
        }
        catch (e) {
            if (this.cancelledPulls.has(modelName))
                return;
            await this.prisma.aiModel.updateMany({
                where: { tenantId, modelId: modelName },
                data: { status: 'ERROR', downloadProgress: 0 },
            });
            throw e;
        }
    }
    async deleteModel(modelName, tenantId) {
        try {
            await this.client.delete({ model: modelName });
        }
        catch {
        }
        await this.prisma.aiModel.deleteMany({
            where: { tenantId, modelId: modelName },
        });
    }
    async getModelStatus(tenantId) {
        const models = await this.prisma.aiModel.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
        return models.map((m) => ({ ...m, sizeBytes: Number(m.sizeBytes) }));
    }
    async setDefaultModel(tenantId, modelId, isEmbedding) {
        await this.prisma.aiModel.updateMany({
            where: { tenantId, isEmbedding, isDefault: true },
            data: { isDefault: false },
        });
        await this.prisma.aiModel.updateMany({
            where: { tenantId, modelId, isEmbedding },
            data: { isDefault: true },
        });
    }
    async generate(modelName, prompt, systemPrompt) {
        const start = Date.now();
        try {
            const response = await this.client.generate({
                model: modelName,
                prompt,
                system: systemPrompt,
                stream: false,
            });
            return {
                content: response.response,
                tokenCount: (response.eval_count ?? 0) + (response.prompt_eval_count ?? 0),
                latencyMs: Date.now() - start,
            };
        }
        catch (e) {
            throw new common_1.BadRequestException(`Ollama generation failed: ${(e instanceof Error ? e.message : String(e))}`);
        }
    }
    async chat(modelName, messages) {
        const start = Date.now();
        try {
            const response = await this.client.chat({
                model: modelName,
                messages: messages,
                stream: false,
            });
            return {
                content: response.message?.content ?? '',
                tokenCount: (response.eval_count ?? 0) + (response.prompt_eval_count ?? 0),
                latencyMs: Date.now() - start,
            };
        }
        catch (e) {
            throw new common_1.BadRequestException(`Ollama chat failed: ${(e instanceof Error ? e.message : String(e))}`);
        }
    }
    async embed(modelName, text) {
        try {
            const response = await this.client.embed({ model: modelName, input: text });
            return response.embeddings?.[0] ?? response.embedding ?? [];
        }
        catch (e) {
            throw new common_1.BadRequestException(`Embedding generation failed: ${(e instanceof Error ? e.message : String(e))}`);
        }
    }
    async embedBatch(modelName, texts) {
        const results = [];
        for (const text of texts) {
            results.push(await this.embed(modelName, text));
        }
        return results;
    }
};
exports.OllamaService = OllamaService;
exports.OllamaService = OllamaService = OllamaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], OllamaService);
//# sourceMappingURL=ollama.service.js.map