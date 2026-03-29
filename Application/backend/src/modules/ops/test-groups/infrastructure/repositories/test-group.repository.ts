import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import type { TestGroupStatus } from '@prisma/platform-client';

export const TEST_GROUP_REPOSITORY = Symbol('TEST_GROUP_REPOSITORY');

export interface ITestGroupRepository {
  create(data: CreateTestGroupData): Promise<any>;
  findById(id: string): Promise<any | null>;
  findByTenantId(tenantId: string, filters?: ListFilters): Promise<any[]>;
  update(id: string, data: Partial<CreateTestGroupData & { lastRunAt: Date; lastRunStatus: string; runCount: { increment: number } }>): Promise<any>;
  softDelete(id: string): Promise<any>;
  findExecution(executionId: string): Promise<any | null>;
  listExecutions(testGroupId: string): Promise<any[]>;
}

export interface CreateTestGroupData {
  tenantId: string;
  name: string;
  nameHi?: string;
  description?: string;
  icon?: string;
  color?: string;
  modules: string[];
  steps: any[];
  status?: TestGroupStatus;
  isSystem?: boolean;
  estimatedDuration?: number;
  createdById: string;
}

export interface ListFilters {
  status?: string;
  module?: string;
}

@Injectable()
export class PrismaTestGroupRepository implements ITestGroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTestGroupData) {
    return this.prisma.platform.testGroup.create({ data: data as any });
  }

  async findById(id: string) {
    return this.prisma.platform.testGroup.findFirst({ where: { id, isDeleted: false } });
  }

  async findByTenantId(tenantId: string, filters: ListFilters = {}) {
    const { status, module } = filters;
    return this.prisma.platform.testGroup.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...(status ? { status: status as TestGroupStatus } : {}),
        ...(module ? { modules: { has: module } } : {}),
      },
      orderBy: [{ isSystem: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async update(id: string, data: any) {
    return this.prisma.platform.testGroup.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.prisma.platform.testGroup.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async findExecution(executionId: string) {
    return this.prisma.platform.testGroupExecution.findUnique({ where: { id: executionId } });
  }

  async listExecutions(testGroupId: string) {
    return this.prisma.platform.testGroupExecution.findMany({
      where: { testGroupId },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }
}
