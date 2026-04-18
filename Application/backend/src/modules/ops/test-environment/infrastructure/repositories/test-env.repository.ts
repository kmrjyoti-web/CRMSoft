import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import type { TestEnvStatus, TestEnvSourceType, Prisma } from '@prisma/platform-client';

export const TEST_ENV_REPOSITORY = Symbol('TEST_ENV_REPOSITORY');

export interface ITestEnvRepository {
  create(data: CreateTestEnvData): Promise<any>;
  findById(id: string): Promise<any | null>;
  findByTenantId(tenantId: string, filters?: ListFilters): Promise<any[]>;
  countActive(tenantId: string): Promise<number>;
  update(id: string, data: UpdateTestEnvData): Promise<any>;
  findExpired(): Promise<any[]>;
}

export interface CreateTestEnvData {
  tenantId: string;
  name: string;
  displayName: string;
  sourceType: TestEnvSourceType;
  sourceDbUrl?: string;
  backupId?: string;
  testDbName: string;
  ttlHours?: number;
  createdById: string;
}

export interface UpdateTestEnvData {
  status?: TestEnvStatus;
  statusMessage?: string;
  progressPercent?: number;
  testDbUrl?: string;
  dbSizeBytes?: bigint;
  tablesCreated?: number;
  seedRecords?: number;
  expiresAt?: Date;
  completedAt?: Date;
  cleanedAt?: Date;
  errorMessage?: string;
  errorStack?: string;
}

export interface ListFilters {
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class PrismaTestEnvRepository implements ITestEnvRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTestEnvData) {
    return this.prisma.platform.testEnvironment.create({ data: data as any });
  }

  async findById(id: string) {
    return this.prisma.platform.testEnvironment.findUnique({ where: { id } });
  }

  async findByTenantId(tenantId: string, filters: ListFilters = {}) {
    const { status, page = 1, limit = 20 } = filters;
    return this.prisma.platform.testEnvironment.findMany({
      where: {
        tenantId,
        ...(status ? { status: status as TestEnvStatus } : {}),
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async countActive(tenantId: string): Promise<number> {
    return this.prisma.platform.testEnvironment.count({
      where: {
        tenantId,
        status: { in: ['QUEUED', 'CREATING', 'SEEDING', 'READY', 'TESTING'] },
      },
    });
  }

  async update(id: string, data: UpdateTestEnvData) {
    return this.prisma.platform.testEnvironment.update({
      where: { id },
      data: data as any,
    });
  }

  async findExpired() {
    return this.prisma.platform.testEnvironment.findMany({
      where: {
        expiresAt: { lt: new Date() },
        status: { in: ['READY', 'COMPLETED', 'TESTING'] },
      },
    });
  }
}
