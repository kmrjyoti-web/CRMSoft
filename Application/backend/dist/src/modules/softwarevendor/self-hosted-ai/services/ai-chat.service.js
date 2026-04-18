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
var AiChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const ollama_service_1 = require("./ollama.service");
const vector_store_service_1 = require("./vector-store.service");
const crm_data_agent_service_1 = require("./crm-data-agent.service");
let AiChatService = AiChatService_1 = class AiChatService {
    constructor(prisma, ollama, vectorStore, crmDataAgent) {
        this.prisma = prisma;
        this.ollama = ollama;
        this.vectorStore = vectorStore;
        this.crmDataAgent = crmDataAgent;
        this.logger = new common_1.Logger(AiChatService_1.name);
    }
    async listSystemPrompts(tenantId, category) {
        const where = {
            OR: [{ tenantId }, { isSystem: true, tenantId: '' }],
        };
        if (category)
            where.category = category;
        return this.prisma.aiSystemPrompt.findMany({
            where,
            orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
        });
    }
    async createSystemPrompt(tenantId, data) {
        if (data.isDefault) {
            await this.prisma.aiSystemPrompt.updateMany({
                where: { tenantId, category: data.category ?? 'general', isDefault: true },
                data: { isDefault: false },
            });
        }
        return this.prisma.aiSystemPrompt.create({
            data: { tenantId, ...data },
        });
    }
    async updateSystemPrompt(tenantId, id, data) {
        const existing = await this.prisma.aiSystemPrompt.findFirst({
            where: { id, tenantId },
        });
        if (!existing)
            throw new common_1.NotFoundException('System prompt not found');
        if (existing.isSystem)
            throw new common_1.BadRequestException('Cannot modify system prompts');
        if (data.isDefault) {
            await this.prisma.aiSystemPrompt.updateMany({
                where: { tenantId, category: data.category ?? existing.category, isDefault: true },
                data: { isDefault: false },
            });
        }
        return this.prisma.aiSystemPrompt.update({ where: { id }, data });
    }
    async deleteSystemPrompt(tenantId, id) {
        const existing = await this.prisma.aiSystemPrompt.findFirst({
            where: { id, tenantId },
        });
        if (!existing)
            throw new common_1.NotFoundException('System prompt not found');
        if (existing.isSystem)
            throw new common_1.BadRequestException('Cannot delete system prompts');
        return this.prisma.aiSystemPrompt.delete({ where: { id } });
    }
    async createSession(tenantId, data) {
        return this.prisma.aiChatSession.create({
            data: {
                tenantId,
                userId: data.userId,
                title: data.title ?? 'New Chat',
                modelId: data.modelId,
                datasetIds: data.datasetIds ?? [],
                systemPromptId: data.systemPromptId,
                configJson: data.config,
            },
        });
    }
    async listSessions(tenantId, userId) {
        const where = { tenantId, status: 'ACTIVE' };
        if (userId)
            where.userId = userId;
        return this.prisma.aiChatSession.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            take: 50,
            select: {
                id: true,
                title: true,
                modelId: true,
                messageCount: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async getSession(tenantId, sessionId) {
        const session = await this.prisma.aiChatSession.findFirst({
            where: { id: sessionId, tenantId },
            include: {
                messages: { orderBy: { createdAt: 'asc' } },
                systemPrompt: true,
            },
        });
        if (!session)
            throw new common_1.NotFoundException('Chat session not found');
        return session;
    }
    async deleteSession(tenantId, sessionId) {
        return this.prisma.aiChatSession.updateMany({
            where: { id: sessionId, tenantId },
            data: { status: 'DELETED' },
        });
    }
    async sendMessage(tenantId, sessionId, userMessage) {
        const session = await this.prisma.aiChatSession.findFirst({
            where: { id: sessionId, tenantId },
            include: {
                messages: { orderBy: { createdAt: 'desc' }, take: 10 },
                systemPrompt: true,
            },
        });
        if (!session)
            throw new common_1.NotFoundException('Chat session not found');
        await this.prisma.aiChatMessage.create({
            data: {
                tenantId,
                sessionId,
                role: 'user',
                content: userMessage,
                tokenCount: Math.ceil(userMessage.split(/\s+/).length * 1.3),
            },
        });
        let liveData = '';
        try {
            const liveResult = await this.crmDataAgent.queryLiveData(tenantId, userMessage);
            if (liveResult && liveResult.recordCount > 0) {
                liveData = liveResult.data;
            }
        }
        catch (e) {
            this.logger.warn('Live CRM data query failed', (e instanceof Error ? e.message : String(e)));
        }
        let ragContext = '';
        let sources = [];
        const readyDatasets = await this.prisma.aiDataset.findMany({
            where: { tenantId, status: 'READY' },
            select: { id: true },
        });
        const datasetIds = readyDatasets.map((d) => d.id);
        if (datasetIds.length > 0) {
            try {
                const embeddingModel = await this.prisma.aiModel.findFirst({
                    where: { tenantId, isEmbedding: true, status: 'AVAILABLE' },
                    orderBy: { isDefault: 'desc' },
                });
                if (embeddingModel) {
                    const results = await this.vectorStore.search(tenantId, userMessage, embeddingModel.modelId, datasetIds, 5);
                    if (results.length > 0) {
                        sources = results.map((r) => ({
                            content: r.content.substring(0, 200),
                            score: Math.round(r.score * 100) / 100,
                            documentId: r.documentId,
                        }));
                        ragContext = results.map((r) => r.content).join('\n\n---\n\n');
                    }
                }
            }
            catch (e) {
                this.logger.warn('RAG search failed (embedding model may be unavailable)', (e instanceof Error ? e.message : String(e)));
            }
        }
        const basePrompt = session.systemPrompt?.prompt
            ?? 'You are a helpful CRM assistant.';
        const hasData = !!(liveData || ragContext);
        let systemContent = basePrompt + `

STRICT RULES � YOU MUST FOLLOW THESE:
1. You may ONLY answer using the CRM DATA provided between the ===== markers below.
2. Do NOT use your own knowledge, training data, or general information. NEVER make up or guess data.
3. If CRM DATA is provided, search it carefully and list all matching records.
4. If CRM DATA is empty or no records match the question, you MUST respond EXACTLY with:
   "This information is not available in the CRM data. Please add relevant data to the training dataset."
5. NEVER fabricate product names, company details, prices, or any other business data.
6. Reply in the same language as the user (Hindi, English, etc.).
7. Format tables neatly if the data contains tabular information.`;
        const combinedData = [
            liveData ? `-- LIVE CRM DATABASE --\n${liveData}` : '',
            ragContext ? `-- TRAINED DATASET --\n${ragContext}` : '',
        ].filter(Boolean).join('\n\n');
        if (combinedData) {
            systemContent += `\n\n===== CRM DATA =====\n${combinedData}\n===== END DATA =====`;
        }
        else {
            systemContent += `\n\n===== CRM DATA =====\n(No data found for this query)\n===== END DATA =====`;
        }
        const ollamaMessages = [
            { role: 'system', content: systemContent },
        ];
        const history = [...session.messages].reverse().slice(-8);
        for (const msg of history) {
            ollamaMessages.push({ role: msg.role, content: msg.content });
        }
        const enhancedUserMessage = hasData
            ? `${userMessage}\n\n(IMPORTANT: Answer ONLY from the CRM DATA above. If the data does not contain the answer, say so.)`
            : `${userMessage}\n\n(IMPORTANT: No CRM data was found for this query. You MUST say "This information is not available in the CRM data." Do NOT make up an answer.)`;
        ollamaMessages.push({ role: 'user', content: enhancedUserMessage });
        let replyContent;
        let tokenCount = 0;
        let latencyMs = 0;
        try {
            const result = await this.ollama.chat(session.modelId, ollamaMessages);
            replyContent = result.content;
            tokenCount = result.tokenCount;
            latencyMs = result.latencyMs;
        }
        catch (ollamaError) {
            this.logger.error('Ollama chat failed, returning raw data', ollamaError.message);
            if (combinedData) {
                replyContent = `?? AI model is not available. Here is the raw CRM data:\n\n${combinedData}`;
            }
            else {
                replyContent = `?? AI model is not available (${ollamaError.message}). Please check that Ollama is running and a model is configured.`;
            }
        }
        await this.prisma.aiChatMessage.create({
            data: {
                tenantId,
                sessionId,
                role: 'assistant',
                content: replyContent,
                sources: sources.length > 0 ? sources : undefined,
                tokenCount,
                latencyMs,
            },
        });
        await this.prisma.aiChatSession.update({
            where: { id: sessionId },
            data: {
                messageCount: { increment: 2 },
                title: session.messageCount === 0
                    ? userMessage.substring(0, 100)
                    : undefined,
            },
        });
        return {
            reply: replyContent,
            sources,
            tokenCount,
            latencyMs,
        };
    }
    async quickChat(tenantId, data) {
        let liveData = '';
        try {
            const liveResult = await this.crmDataAgent.queryLiveData(tenantId, data.message);
            if (liveResult && liveResult.recordCount > 0) {
                liveData = liveResult.data;
            }
        }
        catch (e) {
            this.logger.warn('Live CRM data query failed in quickChat', (e instanceof Error ? e.message : String(e)));
        }
        let ragContext = '';
        let sources = [];
        const readyDatasets = await this.prisma.aiDataset.findMany({
            where: { tenantId, status: 'READY' },
            select: { id: true },
        });
        const currentDatasetIds = readyDatasets.map((d) => d.id);
        if (currentDatasetIds.length > 0) {
            try {
                const embeddingModel = await this.prisma.aiModel.findFirst({
                    where: { tenantId, isEmbedding: true, status: 'AVAILABLE' },
                    orderBy: { isDefault: 'desc' },
                });
                if (embeddingModel) {
                    const results = await this.vectorStore.search(tenantId, data.message, embeddingModel.modelId, currentDatasetIds, 3);
                    sources = results.map((r) => ({
                        content: r.content.substring(0, 200),
                        score: Math.round(r.score * 100) / 100,
                    }));
                    ragContext = results.map((r) => r.content).join('\n\n');
                }
            }
            catch (e) {
                this.logger.warn('RAG search failed in quickChat', (e instanceof Error ? e.message : String(e)));
            }
        }
        const basePrompt = data.systemPrompt ?? 'You are a helpful CRM assistant.';
        const hasData = !!(liveData || ragContext);
        let systemContent = basePrompt + `

STRICT RULES � YOU MUST FOLLOW THESE:
1. You may ONLY answer using the CRM DATA provided between the ===== markers below.
2. Do NOT use your own knowledge, training data, or general information. NEVER make up or guess data.
3. If CRM DATA is provided, search it carefully and list all matching records.
4. If CRM DATA is empty or no records match the question, you MUST respond EXACTLY with:
   "This information is not available in the CRM data. Please add relevant data to the training dataset."
5. NEVER fabricate product names, company details, prices, or any other business data.
6. Reply in the same language as the user (Hindi, English, etc.).
7. Format tables neatly if the data contains tabular information.`;
        const combinedData = [
            liveData ? `-- LIVE CRM DATABASE --\n${liveData}` : '',
            ragContext ? `-- TRAINED DATASET --\n${ragContext}` : '',
        ].filter(Boolean).join('\n\n');
        if (combinedData) {
            systemContent += `\n\n===== CRM DATA =====\n${combinedData}\n===== END DATA =====`;
        }
        else {
            systemContent += `\n\n===== CRM DATA =====\n(No data found for this query)\n===== END DATA =====`;
        }
        const messages = [
            { role: 'system', content: systemContent },
        ];
        const enhancedMessage = hasData
            ? `${data.message}\n\n(IMPORTANT: Answer ONLY from the CRM DATA above. If the data does not contain the answer, say so.)`
            : `${data.message}\n\n(IMPORTANT: No CRM data was found for this query. You MUST say "This information is not available in the CRM data." Do NOT make up an answer.)`;
        messages.push({ role: 'user', content: enhancedMessage });
        try {
            const result = await this.ollama.chat(data.modelId, messages);
            return { reply: result.content, sources };
        }
        catch (ollamaError) {
            this.logger.error('Ollama quickChat failed, returning raw data', ollamaError.message);
            if (combinedData) {
                return { reply: `?? AI model is not available. Here is the raw CRM data:\n\n${combinedData}`, sources };
            }
            return { reply: `?? AI model is not available (${ollamaError.message}). Please check that Ollama is running and a model is configured.`, sources };
        }
    }
    async getWidgetConfig(tenantId) {
        const settings = await this.prisma.aiSettings.findUnique({
            where: { tenantId },
        });
        const widgetConfig = settings?.taskOverrides?.widgetConfig ?? {
            enabled: false,
            title: 'AI Assistant',
            subtitle: 'Ask me anything about your CRM data',
            primaryColor: '#2563EB',
            position: 'bottom-right',
            modelId: '',
            datasetIds: [],
            systemPromptId: '',
        };
        return widgetConfig;
    }
    async updateWidgetConfig(tenantId, config) {
        const settings = await this.prisma.aiSettings.findUnique({
            where: { tenantId },
        });
        const taskOverrides = settings?.taskOverrides ?? {};
        taskOverrides.widgetConfig = config;
        if (settings) {
            await this.prisma.aiSettings.update({
                where: { tenantId },
                data: { taskOverrides },
            });
        }
        else {
            await this.prisma.aiSettings.create({
                data: { tenantId, taskOverrides },
            });
        }
        return config;
    }
};
exports.AiChatService = AiChatService;
exports.AiChatService = AiChatService = AiChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ollama_service_1.OllamaService,
        vector_store_service_1.VectorStoreService,
        crm_data_agent_service_1.CrmDataAgentService])
], AiChatService);
//# sourceMappingURL=ai-chat.service.js.map