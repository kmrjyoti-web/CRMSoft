import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class AiSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(tenantId: string) {
    let settings = await this.prisma.aiSettings.findUnique({
      where: { tenantId },
    });

    if (!settings) {
      settings = await this.prisma.aiSettings.create({
        data: {
          tenantId,
          defaultProvider: 'ANTHROPIC_CLAUDE',
          defaultModel: 'claude-sonnet-4-20250514',
          isEnabled: true,
        },
      });
    }

    return settings;
  }

  async update(tenantId: string, data: {
    defaultProvider?: string;
    defaultModel?: string;
    taskOverrides?: Record<string, string>;
    isEnabled?: boolean;
    monthlyTokenBudget?: number;
  }) {
    return this.prisma.aiSettings.upsert({
      where: { tenantId },
      create: {
        tenantId,
        ...data,
      },
      update: data,
    });
  }
}
