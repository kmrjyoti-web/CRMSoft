import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { Ollama } from 'ollama';

export interface OllamaModelInfo {
  name: string;
  size: number;
  digest: string;
  modifiedAt: string;
  parameterSize?: string;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private client: Ollama;
  private ollamaHost: string;
  /** Separate Ollama client per active pull — call .abort() to cancel */
  private activePulls = new Map<string, Ollama>();
  /** Flag set for cancelled pulls so the loop knows to stop */
  private cancelledPulls = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.ollamaHost = this.config.get<string>('OLLAMA_HOST', 'http://localhost:11434');
    this.client = new Ollama({ host: this.ollamaHost });
  }

  // -- Connection --

  async checkHealth(): Promise<{ connected: boolean; version?: string; error?: string }> {
    try {
      const models = await this.client.list();
      return { connected: true, version: 'running' };
    } catch (e: any) {
      return { connected: false, error: (e instanceof Error ? e.message : String(e)) };
    }
  }

  // -- Model Management --

  async listLocalModels(): Promise<OllamaModelInfo[]> {
    try {
      const response = await this.client.list();
      return (response.models || []).map((m: any) => ({
        name: m.name,
        size: m.size ?? 0,
        digest: m.digest ?? '',
        modifiedAt: m.modified_at ?? '',
        parameterSize: m.details?.parameter_size ?? '',
      }));
    } catch (e: any) {
      this.logger.error('Failed to list Ollama models', (e instanceof Error ? e.message : String(e)));
      return [];
    }
  }

  async pullModel(modelName: string, tenantId: string): Promise<{ success: boolean; message: string }> {
    // Upsert model record
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
    } else {
      await this.prisma.aiModel.update({
        where: { id: existing.id },
        data: { status: 'DOWNLOADING', downloadProgress: 0 },
      });
    }

    // Create a dedicated Ollama client for this pull (so we can abort it)
    const pullClient = new Ollama({ host: this.ollamaHost });
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

  async cancelPull(modelName: string, tenantId: string): Promise<void> {
    this.logger.log(`Cancelling pull for ${modelName}`);
    this.cancelledPulls.add(modelName);

    // Abort the dedicated pull client — kills the HTTP connection
    const pullClient = this.activePulls.get(modelName);
    if (pullClient) {
      pullClient.abort();
      this.activePulls.delete(modelName);
    }

    // Reset status back to NOT_INSTALLED
    await this.prisma.aiModel.updateMany({
      where: { tenantId, modelId: modelName },
      data: { status: 'NOT_INSTALLED', downloadProgress: 0 },
    });

    // Remove partial download from Ollama
    try { await this.client.delete({ model: modelName }); } catch { /* ignore */ }
    this.logger.log(`Pull cancelled for ${modelName}`);
  }

  private async pullModelAsync(modelName: string, tenantId: string, pullClient: Ollama): Promise<void> {
    try {
      const stream = await pullClient.pull({ model: modelName, stream: true });

      for await (const progress of stream) {
        // Check if cancelled between chunks
        if (this.cancelledPulls.has(modelName)) {
          return; // Exit silently — cancelPull already updated DB
        }
        if (progress.total && progress.completed) {
          const pct = (progress.completed / progress.total) * 100;
          await this.prisma.aiModel.updateMany({
            where: { tenantId, modelId: modelName },
            data: { downloadProgress: Math.round(pct) },
          });
        }
      }

      // Check once more after stream ends
      if (this.cancelledPulls.has(modelName)) return;

      // Get model info after pull
      const info = await this.client.show({ model: modelName });
      const localModels = await this.client.list();
      const pulled = localModels.models?.find((m: any) => m.name === modelName || m.name.startsWith(modelName));

      await this.prisma.aiModel.updateMany({
        where: { tenantId, modelId: modelName },
        data: {
          status: 'AVAILABLE',
          downloadProgress: 100,
          sizeBytes: pulled?.size ?? 0,
          parameterCount: (info as any)?.details?.parameter_size ?? null,
          contextLength: (info as any)?.model_info?.context_length ?? 4096,
        },
      });

      this.logger.log(`Model ${modelName} pulled successfully`);
    } catch (e: any) {
      // If cancelled, don't set ERROR status — cancelPull already set NOT_INSTALLED
      if (this.cancelledPulls.has(modelName)) return;

      await this.prisma.aiModel.updateMany({
        where: { tenantId, modelId: modelName },
        data: { status: 'ERROR', downloadProgress: 0 },
      });
      throw e;
    }
  }

  async deleteModel(modelName: string, tenantId: string): Promise<void> {
    try {
      await this.client.delete({ model: modelName });
    } catch {
      // Model may already be removed from Ollama
    }
    await this.prisma.aiModel.deleteMany({
      where: { tenantId, modelId: modelName },
    });
  }

  async getModelStatus(tenantId: string): Promise<any[]> {
    const models = await this.prisma.aiModel.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    // Convert BigInt sizeBytes to Number for JSON serialization
    return models.map((m) => ({ ...m, sizeBytes: Number(m.sizeBytes) }));
  }

  async setDefaultModel(tenantId: string, modelId: string, isEmbedding: boolean): Promise<void> {
    // Unset current default
    await this.prisma.aiModel.updateMany({
      where: { tenantId, isEmbedding, isDefault: true },
      data: { isDefault: false },
    });
    // Set new default
    await this.prisma.aiModel.updateMany({
      where: { tenantId, modelId, isEmbedding },
      data: { isDefault: true },
    });
  }

  // -- Generation --

  async generate(modelName: string, prompt: string, systemPrompt?: string): Promise<{
    content: string;
    tokenCount: number;
    latencyMs: number;
  }> {
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
    } catch (e: any) {
      throw new BadRequestException(`Ollama generation failed: ${(e instanceof Error ? e.message : String(e))}`);
    }
  }

  async chat(modelName: string, messages: { role: string; content: string }[]): Promise<{
    content: string;
    tokenCount: number;
    latencyMs: number;
  }> {
    const start = Date.now();
    try {
      const response = await this.client.chat({
        model: modelName,
        messages: messages as any,
        stream: false,
      });

      return {
        content: response.message?.content ?? '',
        tokenCount: (response.eval_count ?? 0) + (response.prompt_eval_count ?? 0),
        latencyMs: Date.now() - start,
      };
    } catch (e: any) {
      throw new BadRequestException(`Ollama chat failed: ${(e instanceof Error ? e.message : String(e))}`);
    }
  }

  // -- Embeddings --

  async embed(modelName: string, text: string): Promise<number[]> {
    try {
      const response = await this.client.embed({ model: modelName, input: text });
      return (response as any).embeddings?.[0] ?? (response as any).embedding ?? [];
    } catch (e: any) {
      throw new BadRequestException(`Embedding generation failed: ${(e instanceof Error ? e.message : String(e))}`);
    }
  }

  async embedBatch(modelName: string, texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      results.push(await this.embed(modelName, text));
    }
    return results;
  }
}
