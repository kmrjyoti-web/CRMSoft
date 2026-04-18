import { Injectable, Logger, HttpException } from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { CreateTestPlanDto } from './dto/create-test-plan.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { TEST_CENTER_ERRORS } from './test-center.errors';

@Injectable()
export class TestCenterService {
  private readonly logger = new Logger(TestCenterService.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  async createTestPlan(dto: CreateTestPlanDto): Promise<any> {
    try {
      const plan = await this.db.pcTestPlan.create({
        data: {
          name: dto.name,
          description: dto.description,
          moduleScope: dto.moduleScope,
          verticalScope: dto.verticalScope,
          scenarios: dto.scenarios as any,
          createdBy: dto.createdBy,
        },
      });
      this.logger.log(`Test plan created: ${plan.id}`);
      return plan;
    } catch (error) {
      this.logger.error('Failed to create test plan', (error as Error).stack);
      throw error;
    }
  }

  async getTestPlans(params: { page?: number; limit?: number }): Promise<{ data: any[]; total: number }> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 20;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.db.pcTestPlan.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { executions: true } } },
        }),
        this.db.pcTestPlan.count(),
      ]);

      return { data, total };
    } catch (error) {
      this.logger.error('Failed to get test plans', (error as Error).stack);
      throw error;
    }
  }

  async getTestPlan(id: string): Promise<any> {
    try {
      const plan = await this.db.pcTestPlan.findUnique({
        where: { id },
        include: {
          executions: {
            orderBy: { startedAt: 'desc' },
            take: 5,
          },
        },
      });

      if (!plan) {
        const err = TEST_CENTER_ERRORS.PLAN_NOT_FOUND;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      return plan;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get test plan ${id}`, (error as Error).stack);
      throw error;
    }
  }

  async updateTestPlan(id: string, data: { name?: string; description?: string; scenarios?: any[]; isActive?: boolean }): Promise<any> {
    try {
      const plan = await this.db.pcTestPlan.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.scenarios !== undefined && { scenarios: data.scenarios as any }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });
      this.logger.log(`Test plan updated: ${plan.id}`);
      return plan;
    } catch (error) {
      this.logger.error(`Failed to update test plan ${id}`, (error as Error).stack);
      throw error;
    }
  }

  async deleteTestPlan(id: string): Promise<any> {
    try {
      const plan = await this.db.pcTestPlan.update({
        where: { id },
        data: { isActive: false },
      });
      this.logger.log(`Test plan soft-deleted: ${plan.id}`);
      return plan;
    } catch (error) {
      this.logger.error(`Failed to delete test plan ${id}`, (error as Error).stack);
      throw error;
    }
  }

  async getExecutions(filters: {
    status?: string;
    moduleScope?: string;
    triggerType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; total: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (filters.status) where.status = filters.status;
      if (filters.moduleScope) where.moduleScope = filters.moduleScope;
      if (filters.triggerType) where.triggerType = filters.triggerType;

      const [data, total] = await Promise.all([
        this.db.pcTestExecution.findMany({
          where,
          skip,
          take: limit,
          orderBy: { startedAt: 'desc' },
        }),
        this.db.pcTestExecution.count({ where }),
      ]);

      return { data, total };
    } catch (error) {
      this.logger.error('Failed to get executions', (error as Error).stack);
      throw error;
    }
  }

  async getExecution(id: string): Promise<any> {
    try {
      const execution = await this.db.pcTestExecution.findUnique({ where: { id } });

      if (!execution) {
        const err = TEST_CENTER_ERRORS.EXECUTION_NOT_FOUND;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      return execution;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get execution ${id}`, (error as Error).stack);
      throw error;
    }
  }

  async getLatestExecution(): Promise<any> {
    try {
      return await this.db.pcTestExecution.findFirst({
        orderBy: { startedAt: 'desc' },
      });
    } catch (error) {
      this.logger.error('Failed to get latest execution', (error as Error).stack);
      throw error;
    }
  }

  async getSchedules(): Promise<any[]> {
    try {
      return await this.db.pcTestSchedule.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error('Failed to get schedules', (error as Error).stack);
      throw error;
    }
  }

  async createSchedule(dto: CreateScheduleDto): Promise<any> {
    try {
      const schedule = await this.db.pcTestSchedule.create({
        data: {
          planId: dto.planId,
          scheduleType: dto.scheduleType,
          cronExpression: dto.cronExpression,
          moduleScope: dto.moduleScope,
          verticalScope: dto.verticalScope,
          brandScope: dto.brandScope,
          nextRun: null,
        },
      });
      this.logger.log(`Test schedule created: ${schedule.id}`);
      return schedule;
    } catch (error) {
      this.logger.error('Failed to create schedule', (error as Error).stack);
      throw error;
    }
  }

  async updateSchedule(id: string, data: { cronExpression?: string; isActive?: boolean; moduleScope?: string }): Promise<any> {
    try {
      const schedule = await this.db.pcTestSchedule.update({
        where: { id },
        data: {
          ...(data.cronExpression !== undefined && { cronExpression: data.cronExpression }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.moduleScope !== undefined && { moduleScope: data.moduleScope }),
        },
      });
      this.logger.log(`Test schedule updated: ${schedule.id}`);
      return schedule;
    } catch (error) {
      this.logger.error(`Failed to update schedule ${id}`, (error as Error).stack);
      throw error;
    }
  }

  async deleteSchedule(id: string): Promise<any> {
    try {
      const schedule = await this.db.pcTestSchedule.delete({ where: { id } });
      this.logger.log(`Test schedule deleted: ${id}`);
      return schedule;
    } catch (error) {
      this.logger.error(`Failed to delete schedule ${id}`, (error as Error).stack);
      throw error;
    }
  }

  async getStats(): Promise<object> {
    try {
      const [totalPlans, totalExecutions, lastRun, schedulesActive, coverageRecords, recentExecutions] = await Promise.all([
        this.db.pcTestPlan.count(),
        this.db.pcTestExecution.count(),
        this.db.pcTestExecution.findFirst({ orderBy: { startedAt: 'desc' } }),
        this.db.pcTestSchedule.count({ where: { isActive: true } }),
        this.db.pcTestCoverage.findMany(),
        this.db.pcTestExecution.findMany({ orderBy: { startedAt: 'desc' }, take: 5 }),
      ]);

      const coverageAvg =
        coverageRecords.length > 0
          ? coverageRecords.reduce((sum, r) => sum + (r.lineCoverage || 0), 0) / coverageRecords.length
          : 0;

      return {
        totalPlans,
        totalExecutions,
        lastRun,
        schedulesActive,
        coverageAvg: Math.round(coverageAvg * 100) / 100,
        recentExecutions,
      };
    } catch (error) {
      this.logger.error('Failed to get stats', (error as Error).stack);
      throw error;
    }
  }
}
