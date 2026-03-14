import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { OllamaService } from './ollama.service';
import { VectorStoreService } from './vector-store.service';
import { CrmDataAgentService } from './crm-data-agent.service';

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ollama: OllamaService,
    private readonly vectorStore: VectorStoreService,
    private readonly crmDataAgent: CrmDataAgentService,
  ) {}

  // ── System Prompts ──

  async listSystemPrompts(tenantId: string, category?: string) {
    const where: any = {
      OR: [{ tenantId }, { isSystem: true, tenantId: '' }],
    };
    if (category) where.category = category;
    return this.prisma.aiSystemPrompt.findMany({
      where,
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  async createSystemPrompt(tenantId: string, data: {
    name: string;
    description?: string;
    prompt: string;
    category?: string;
    isDefault?: boolean;
    variables?: any;
    createdBy?: string;
  }) {
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

  async updateSystemPrompt(tenantId: string, id: string, data: {
    name?: string;
    description?: string;
    prompt?: string;
    category?: string;
    isDefault?: boolean;
    variables?: any;
  }) {
    const existing = await this.prisma.aiSystemPrompt.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('System prompt not found');
    if (existing.isSystem) throw new BadRequestException('Cannot modify system prompts');

    if (data.isDefault) {
      await this.prisma.aiSystemPrompt.updateMany({
        where: { tenantId, category: data.category ?? existing.category, isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.aiSystemPrompt.update({ where: { id }, data });
  }

  async deleteSystemPrompt(tenantId: string, id: string) {
    const existing = await this.prisma.aiSystemPrompt.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('System prompt not found');
    if (existing.isSystem) throw new BadRequestException('Cannot delete system prompts');
    return this.prisma.aiSystemPrompt.delete({ where: { id } });
  }

  // ── Chat Sessions ──

  async createSession(tenantId: string, data: {
    userId?: string;
    title?: string;
    modelId: string;
    datasetIds?: string[];
    systemPromptId?: string;
    config?: any;
  }) {
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

  async listSessions(tenantId: string, userId?: string) {
    const where: any = { tenantId, status: 'ACTIVE' };
    if (userId) where.userId = userId;
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

  async getSession(tenantId: string, sessionId: string) {
    const session = await this.prisma.aiChatSession.findFirst({
      where: { id: sessionId, tenantId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        systemPrompt: true,
      },
    });
    if (!session) throw new NotFoundException('Chat session not found');
    return session;
  }

  async deleteSession(tenantId: string, sessionId: string) {
    return this.prisma.aiChatSession.updateMany({
      where: { id: sessionId, tenantId },
      data: { status: 'DELETED' },
    });
  }

  // ── RAG Chat ──

  async sendMessage(tenantId: string, sessionId: string, userMessage: string): Promise<{
    reply: string;
    sources: any[];
    tokenCount: number;
    latencyMs: number;
  }> {
    const session = await this.prisma.aiChatSession.findFirst({
      where: { id: sessionId, tenantId },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 10 },
        systemPrompt: true,
      },
    });
    if (!session) throw new NotFoundException('Chat session not found');

    // 1. Save user message
    await this.prisma.aiChatMessage.create({
      data: {
        tenantId,
        sessionId,
        role: 'user',
        content: userMessage,
        tokenCount: Math.ceil(userMessage.split(/\s+/).length * 1.3),
      },
    });

    // 2. Live CRM data query
    let liveData = '';
    try {
      const liveResult = await this.crmDataAgent.queryLiveData(tenantId, userMessage);
      if (liveResult && liveResult.recordCount > 0) {
        liveData = liveResult.data;
      }
    } catch (e: any) {
      this.logger.warn('Live CRM data query failed', e.message);
    }

    // 3. RAG: retrieve relevant context from trained datasets
    //    Always fetch current READY datasets — session.datasetIds may be stale
    //    if the user deleted and re-created datasets after the session was created.
    let ragContext = '';
    let sources: any[] = [];
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
          const results = await this.vectorStore.search(
            tenantId,
            userMessage,
            embeddingModel.modelId,
            datasetIds,
            5,
          );

          if (results.length > 0) {
            sources = results.map((r) => ({
              content: r.content.substring(0, 200),
              score: Math.round(r.score * 100) / 100,
              documentId: r.documentId,
            }));
            ragContext = results.map((r) => r.content).join('\n\n---\n\n');
          }
        }
      } catch (e: any) {
        this.logger.warn('RAG search failed (embedding model may be unavailable)', e.message);
      }
    }

    // 4. Build messages for Ollama
    const basePrompt = session.systemPrompt?.prompt
      ?? 'You are a helpful CRM assistant.';

    const hasData = !!(liveData || ragContext);

    let systemContent = basePrompt + `

STRICT RULES — YOU MUST FOLLOW THESE:
1. You may ONLY answer using the CRM DATA provided between the ===== markers below.
2. Do NOT use your own knowledge, training data, or general information. NEVER make up or guess data.
3. If CRM DATA is provided, search it carefully and list all matching records.
4. If CRM DATA is empty or no records match the question, you MUST respond EXACTLY with:
   "This information is not available in the CRM data. Please add relevant data to the training dataset."
5. NEVER fabricate product names, company details, prices, or any other business data.
6. Reply in the same language as the user (Hindi, English, etc.).
7. Format tables neatly if the data contains tabular information.`;

    // Combine live data + RAG data
    const combinedData = [
      liveData ? `── LIVE CRM DATABASE ──\n${liveData}` : '',
      ragContext ? `── TRAINED DATASET ──\n${ragContext}` : '',
    ].filter(Boolean).join('\n\n');

    if (combinedData) {
      systemContent += `\n\n===== CRM DATA =====\n${combinedData}\n===== END DATA =====`;
    } else {
      systemContent += `\n\n===== CRM DATA =====\n(No data found for this query)\n===== END DATA =====`;
    }

    const ollamaMessages: { role: string; content: string }[] = [
      { role: 'system', content: systemContent },
    ];

    // Add conversation history (reversed back to chronological)
    const history = [...session.messages].reverse().slice(-8);
    for (const msg of history) {
      ollamaMessages.push({ role: msg.role, content: msg.content });
    }

    // Reinforce strict data-only usage in user message
    const enhancedUserMessage = hasData
      ? `${userMessage}\n\n(IMPORTANT: Answer ONLY from the CRM DATA above. If the data does not contain the answer, say so.)`
      : `${userMessage}\n\n(IMPORTANT: No CRM data was found for this query. You MUST say "This information is not available in the CRM data." Do NOT make up an answer.)`;
    ollamaMessages.push({ role: 'user', content: enhancedUserMessage });

    // 5. Generate response (with Ollama fallback)
    let replyContent: string;
    let tokenCount = 0;
    let latencyMs = 0;

    try {
      const result = await this.ollama.chat(session.modelId, ollamaMessages);
      replyContent = result.content;
      tokenCount = result.tokenCount;
      latencyMs = result.latencyMs;
    } catch (ollamaError: any) {
      this.logger.error('Ollama chat failed, returning raw data', ollamaError.message);
      // Fallback: return raw data directly if Ollama is down
      if (combinedData) {
        replyContent = `⚠️ AI model is not available. Here is the raw CRM data:\n\n${combinedData}`;
      } else {
        replyContent = `⚠️ AI model is not available (${ollamaError.message}). Please check that Ollama is running and a model is configured.`;
      }
    }

    // 6. Save assistant message
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

    // 7. Update session
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

  // ── Quick Chat (no session) ──

  async quickChat(tenantId: string, data: {
    modelId: string;
    message: string;
    systemPrompt?: string;
    datasetIds?: string[];
  }): Promise<{ reply: string; sources: any[] }> {
    // 1. Live CRM data query
    let liveData = '';
    try {
      const liveResult = await this.crmDataAgent.queryLiveData(tenantId, data.message);
      if (liveResult && liveResult.recordCount > 0) {
        liveData = liveResult.data;
      }
    } catch (e: any) {
      this.logger.warn('Live CRM data query failed in quickChat', e.message);
    }

    // 2. RAG context from datasets — always use current READY datasets
    let ragContext = '';
    let sources: any[] = [];
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
          const results = await this.vectorStore.search(
            tenantId,
            data.message,
            embeddingModel.modelId,
            currentDatasetIds,
            3,
          );
          sources = results.map((r) => ({
            content: r.content.substring(0, 200),
            score: Math.round(r.score * 100) / 100,
          }));
          ragContext = results.map((r) => r.content).join('\n\n');
        }
      } catch (e: any) {
        this.logger.warn('RAG search failed in quickChat', e.message);
      }
    }

    // 3. Build prompt
    const basePrompt = data.systemPrompt ?? 'You are a helpful CRM assistant.';
    const hasData = !!(liveData || ragContext);

    let systemContent = basePrompt + `

STRICT RULES — YOU MUST FOLLOW THESE:
1. You may ONLY answer using the CRM DATA provided between the ===== markers below.
2. Do NOT use your own knowledge, training data, or general information. NEVER make up or guess data.
3. If CRM DATA is provided, search it carefully and list all matching records.
4. If CRM DATA is empty or no records match the question, you MUST respond EXACTLY with:
   "This information is not available in the CRM data. Please add relevant data to the training dataset."
5. NEVER fabricate product names, company details, prices, or any other business data.
6. Reply in the same language as the user (Hindi, English, etc.).
7. Format tables neatly if the data contains tabular information.`;

    const combinedData = [
      liveData ? `── LIVE CRM DATABASE ──\n${liveData}` : '',
      ragContext ? `── TRAINED DATASET ──\n${ragContext}` : '',
    ].filter(Boolean).join('\n\n');

    if (combinedData) {
      systemContent += `\n\n===== CRM DATA =====\n${combinedData}\n===== END DATA =====`;
    } else {
      systemContent += `\n\n===== CRM DATA =====\n(No data found for this query)\n===== END DATA =====`;
    }

    const messages: { role: string; content: string }[] = [
      { role: 'system', content: systemContent },
    ];

    const enhancedMessage = hasData
      ? `${data.message}\n\n(IMPORTANT: Answer ONLY from the CRM DATA above. If the data does not contain the answer, say so.)`
      : `${data.message}\n\n(IMPORTANT: No CRM data was found for this query. You MUST say "This information is not available in the CRM data." Do NOT make up an answer.)`;
    messages.push({ role: 'user', content: enhancedMessage });

    try {
      const result = await this.ollama.chat(data.modelId, messages);
      return { reply: result.content, sources };
    } catch (ollamaError: any) {
      this.logger.error('Ollama quickChat failed, returning raw data', ollamaError.message);
      if (combinedData) {
        return { reply: `⚠️ AI model is not available. Here is the raw CRM data:\n\n${combinedData}`, sources };
      }
      return { reply: `⚠️ AI model is not available (${ollamaError.message}). Please check that Ollama is running and a model is configured.`, sources };
    }
  }

  // ── Widget Config ──

  async getWidgetConfig(tenantId: string) {
    const settings = await this.prisma.aiSettings.findUnique({
      where: { tenantId },
    });
    const widgetConfig = (settings?.taskOverrides as any)?.widgetConfig ?? {
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

  async updateWidgetConfig(tenantId: string, config: any) {
    const settings = await this.prisma.aiSettings.findUnique({
      where: { tenantId },
    });

    const taskOverrides = (settings?.taskOverrides as any) ?? {};
    taskOverrides.widgetConfig = config;

    if (settings) {
      await this.prisma.aiSettings.update({
        where: { tenantId },
        data: { taskOverrides },
      });
    } else {
      await this.prisma.aiSettings.create({
        data: { tenantId, taskOverrides },
      });
    }

    return config;
  }
}
