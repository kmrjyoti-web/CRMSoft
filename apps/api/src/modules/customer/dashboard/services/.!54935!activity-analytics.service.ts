import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class ActivityAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getActivityHeatmap(params: {
    dateFrom: Date; dateTo: Date; userId?: string; activityType?: string;
  }) {
    const where: any = { createdAt: { gte: params.dateFrom, lte: params.dateTo } };
    if (params.userId) where.createdById = params.userId;
    if (params.activityType) where.type = params.activityType;

    const activities = await this.prisma.working.activity.findMany({
      where,
      select: { createdAt: true, type: true },
    });

