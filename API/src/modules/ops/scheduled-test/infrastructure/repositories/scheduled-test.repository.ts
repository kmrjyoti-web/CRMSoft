import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';

export const SCHEDULED_TEST_REPOSITORY = Symbol('SCHEDULED_TEST_REPOSITORY');

export interface IScheduledTestRepository {
  create(data: CreateScheduledTestData): Promise<any>;
  findById(id: string): Promise<any | null>;
  findByTenantId(tenantId: string, filters?: ListFilters): Promise<{ data: any[]; total: number }>;
  findDue(): Promise<any[]>;
  update(id: string, data: UpdateScheduledTestData): Promise<any>;
  softDelete(id: string): Promise<void>;
}

export interface CreateScheduledTestData {
  tenantId: string;
  name: string;
  description?: string;
  cronExpression: string;
  targetModules: string[];
  testTypes: string[];
  dbSourceType?: string;
  createdById: string;
  nextRunAt?: Date;
}

export interface UpdateScheduledTestData {
  name?: string;
  description?: string;
  cronExpression?: string;
  targetModules?: string[];
  testTypes?: string[];
  dbSourceType?: string;
  isActive?: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
  lastRunStatus?: string;
}

export interface ListFilters {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class PrismaScheduledTestRepository implements IScheduledTestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateScheduledTestData) {
    return this.prisma.platform.scheduledTest.create({ data: data as any });
  }

  async findById(id: string) {
    return this.prisma.platform.scheduledTest.findFirst({
      where: { id, isDeleted: false },
      include: { runs: { orderBy: { startedAt: 'desc' }, take: 10 } },
    });
  }

  async findByTenantId(tenantId: string, filters: ListFilters = {}) {
    const { isActive, page = 1, limit = 20 } = filters;
    const where: any = { tenantId, isDeleted: false };
    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await Promise.all([
      this.prisma.platform.scheduledTest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { runs: { orderBy: { startedAt: 'desc' }, take: 1 } },
      }),
      this.prisma.platform.scheduledTest.count({ where }),
    ]);

    return { data, total };
  }

  /** Find all active schedules where nextRunAt <= now */
  async findDue(): Promise<any[]> {
    return this.prisma.platform.scheduledTest.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        nextRunAt: { lte: new Date() },
      },
    });
  }

  async update(id: string, data: UpdateScheduledTestData) {
    return this.prisma.platform.scheduledTest.update({
      where: { id },
      data: data as any,
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.platform.scheduledTest.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });
  }
}
