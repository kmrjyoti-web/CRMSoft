import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

export interface LogUsageParams {
  tenantId: string;
  userId: string;
  provider: string;
  model: string;
  operation: string;
  promptTokens?: number;
  outputTokens?: number;
  latencyMs: number;
  success: boolean;
  errorMessage?: string;
  entityType?: string;
  entityId?: string;
}

@Injectable()
export class AiUsageService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: LogUsageParams) {
    const totalTokens = (params.promptTokens || 0) + (params.outputTokens || 0);

    return this.prisma.aiUsageLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        provider: params.provider,
        model: params.model,
        operation: params.operation,
        promptTokens: params.promptTokens || 0,
        outputTokens: params.outputTokens || 0,
        totalTokens,
        latencyMs: params.latencyMs,
        success: params.success,
        errorMessage: params.errorMessage,
        entityType: params.entityType,
        entityId: params.entityId,
      },
    });
  }

  async getUsageStats(tenantId: string) {
    const stats = await this.prisma.aiUsageLog.groupBy({
      by: ['provider', 'model'],
      where: { tenantId },
      _sum: { totalTokens: true, promptTokens: true, outputTokens: true },
      _count: { id: true },
    });

    const successCounts = await this.prisma.aiUsageLog.groupBy({
      by: ['provider'],
      where: { tenantId, success: true },
      _count: { id: true },
    });

    const failureCounts = await this.prisma.aiUsageLog.groupBy({
      by: ['provider'],
      where: { tenantId, success: false },
      _count: { id: true },
    });

    const successMap = Object.fromEntries(successCounts.map((s) => [s.provider, s._count.id]));
    const failureMap = Object.fromEntries(failureCounts.map((f) => [f.provider, f._count.id]));

    return stats.map((s) => ({
      provider: s.provider,
      model: s.model,
      totalTokens: s._sum.totalTokens || 0,
      promptTokens: s._sum.promptTokens || 0,
      outputTokens: s._sum.outputTokens || 0,
      requestCount: s._count.id,
      successCount: successMap[s.provider] || 0,
      failureCount: failureMap[s.provider] || 0,
    }));
  }
}
