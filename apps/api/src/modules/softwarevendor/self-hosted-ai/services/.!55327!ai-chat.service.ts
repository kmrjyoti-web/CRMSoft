import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
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

  // -- System Prompts --

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

  // -- Chat Sessions --

  async createSession(tenantId: string, data: {
    userId?: string;
    title?: string;
    modelId: string;
    datasetIds?: string[];
    systemPromptId?: string;
    config?: Record<string, unknown>;
  }) {
    return this.prisma.aiChatSession.create({
      data: {
        tenantId,
        userId: data.userId,
        title: data.title ?? 'New Chat',
        modelId: data.modelId,
        datasetIds: data.datasetIds ?? [],
        systemPromptId: data.systemPromptId,
        configJson: data.config as any,
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

  // -- RAG Chat --

  async sendMessage(tenantId: string, sessionId: string, userMessage: string): Promise<{
    reply: string;
    sources: Record<string, unknown>[];
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
      this.logger.warn('Live CRM data query failed', (e instanceof Error ? e.message : String(e)));
    }

    // 3. RAG: retrieve relevant context from trained datasets
