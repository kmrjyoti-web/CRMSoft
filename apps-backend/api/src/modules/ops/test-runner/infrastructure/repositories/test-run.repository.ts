import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import type { TestRunStatus, Prisma } from '@prisma/platform-client';

export const TEST_RUN_REPOSITORY = Symbol('TEST_RUN_REPOSITORY');

export interface ITestRunRepository {
  create(data: CreateTestRunData): Promise<any>;
  findById(id: string): Promise<any | null>;
  findByTenantId(tenantId: string, filters?: ListFilters): Promise<any[]>;
  update(id: string, data: UpdateTestRunData): Promise<any>;
  countRunning(tenantId: string): Promise<number>;
  findWithResults(id: string): Promise<any | null>;
}

export interface CreateTestRunData {
  tenantId: string;
  testEnvId?: string;
  runType: string;
  testTypes: string[];
  targetModules: string[];
  createdById: string;
}

export interface UpdateTestRunData {
  status?: TestRunStatus;
  progressPercent?: number;
  currentPhase?: string;
  totalTests?: number;
  passed?: number;
  failed?: number;
  skipped?: number;
  errors?: number;
  duration?: number;
  summary?: Record<string, any>;
  coveragePercent?: number;
  coverageReport?: Record<string, any>;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ListFilters {
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class PrismaTestRunRepository implements ITestRunRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTestRunData) {
    return this.prisma.platform.testRun.create({ data: data as any });
  }

  async findById(id: string) {
    return this.prisma.platform.testRun.findUnique({ where: { id } });
  }

  async findByTenantId(tenantId: string, filters: ListFilters = {}) {
    const { status, page = 1, limit = 20 } = filters;
    return this.prisma.platform.testRun.findMany({
      where: {
        tenantId,
        ...(status ? { status: status as TestRunStatus } : {}),
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async update(id: string, data: UpdateTestRunData) {
    return this.prisma.platform.testRun.update({
      where: { id },
      data: data as any,
    });
  }

  async countRunning(tenantId: string): Promise<number> {
    return this.prisma.platform.testRun.count({
      where: {
        tenantId,
        status: { in: ['QUEUED', 'RUNNING'] },
      },
    });
  }

  async findWithResults(id: string) {
    return this.prisma.platform.testRun.findUnique({
      where: { id },
      include: { results: { orderBy: { createdAt: 'asc' } } },
    });
  }
}
