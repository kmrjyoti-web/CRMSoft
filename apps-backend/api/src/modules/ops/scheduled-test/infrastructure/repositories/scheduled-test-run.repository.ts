import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';

export const SCHEDULED_TEST_RUN_REPOSITORY = Symbol('SCHEDULED_TEST_RUN_REPOSITORY');

export interface IScheduledTestRunRepository {
  create(data: CreateScheduledTestRunData): Promise<any>;
  findById(id: string): Promise<any | null>;
  findByScheduledTestId(scheduledTestId: string, limit?: number): Promise<any[]>;
  update(id: string, data: UpdateScheduledTestRunData): Promise<any>;
}

export interface CreateScheduledTestRunData {
  scheduledTestId: string;
  status: string;
  testRunId?: string;
  backupRecordId?: string;
  testEnvId?: string;
}

export interface UpdateScheduledTestRunData {
  status?: string;
  testRunId?: string;
  backupRecordId?: string;
  testEnvId?: string;
  errorMessage?: string;
  completedAt?: Date;
}

@Injectable()
export class PrismaScheduledTestRunRepository implements IScheduledTestRunRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateScheduledTestRunData) {
    return this.prisma.platform.scheduledTestRun.create({ data: data as any });
  }

  async findById(id: string) {
    return this.prisma.platform.scheduledTestRun.findUnique({ where: { id } });
  }

  async findByScheduledTestId(scheduledTestId: string, limit = 20) {
    return this.prisma.platform.scheduledTestRun.findMany({
      where: { scheduledTestId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
  }

  async update(id: string, data: UpdateScheduledTestRunData) {
    return this.prisma.platform.scheduledTestRun.update({
      where: { id },
      data: data as any,
    });
  }
}
