import {
  Controller, Get, Put, Post, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { MasterSchedulerService } from '../services/master-scheduler.service';
import { CronAnalyticsService } from '../services/cron-analytics.service';
import { CronParserService } from '../services/cron-parser.service';
import { JobRegistryService } from '../services/job-registry.service';
import { UpdateJobDto, UpdateJobParamsDto, ToggleJobDto } from './dto/update-job.dto';
import { JobQueryDto, RunHistoryQueryDto } from './dto/query.dto';

@ApiTags('Cron Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/cron')
export class CronAdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scheduler: MasterSchedulerService,
    private readonly analytics: CronAnalyticsService,
    private readonly parser: CronParserService,
    private readonly registry: JobRegistryService,
  ) {}

  /** List all cron jobs with filters. */
  @Get('jobs')
  async listJobs(@Query() query: JobQueryDto) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.moduleName) where.moduleName = query.moduleName;
    if (query.search) where.jobName = { contains: query.search, mode: 'insensitive' };

    const jobs = await this.prisma.working.cronJobConfig.findMany({
      where,
      orderBy: { jobCode: 'asc' },
    });
    return ApiResponse.success(jobs, `Found ${jobs.length} cron jobs`);
  }

  /** Get job detail with recent run logs. */
  @Get('jobs/:jobCode')
  async getJob(@Param('jobCode') jobCode: string) {
    const job = await this.prisma.working.cronJobConfig.findUnique({
      where: { jobCode },
      include: { runLogs: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    if (!job) return ApiResponse.error('Job not found');
    return ApiResponse.success(job);
  }

  /** Update job configuration (cron, timeout, retries, alerts). */
  @Put('jobs/:jobCode')
  async updateJob(
    @Param('jobCode') jobCode: string,
    @Body() dto: UpdateJobDto,
    @CurrentUser() user: any,
  ) {
    if (dto.cronExpression && !this.parser.isValid(dto.cronExpression)) {
      return ApiResponse.error('Invalid cron expression');
    }

    const data: any = { ...dto, updatedById: user.userId, updatedByName: user.userName };
    if (dto.cronExpression) {
      data.cronDescription = this.parser.describe(dto.cronExpression);
    }

    const job = await this.prisma.working.cronJobConfig.update({
      where: { jobCode },
      data,
    });
    await this.scheduler.registerJob(jobCode);
    return ApiResponse.success(job, 'Job updated');
  }

  /** Toggle job status (ACTIVE ↔ PAUSED ↔ DISABLED). */
  @Post('jobs/:jobCode/toggle')
  async toggleJob(
    @Param('jobCode') jobCode: string,
    @Body() dto: ToggleJobDto,
    @CurrentUser() user: any,
  ) {
    const job = await this.prisma.working.cronJobConfig.update({
      where: { jobCode },
      data: {
        status: dto.status as any,
        updatedById: user.userId,
        updatedByName: user.userName,
      },
    });

    if (dto.status === 'ACTIVE') {
      await this.scheduler.registerJob(jobCode);
    } else {
      this.scheduler.cancelJob(jobCode);
    }
    return ApiResponse.success(job, `Job ${dto.status.toLowerCase()}`);
  }

  /** Force run a job immediately. */
  @Post('jobs/:jobCode/run')
  async forceRun(
    @Param('jobCode') jobCode: string,
    @CurrentUser() user: any,
  ) {
    const runLog = await this.scheduler.forceRun(jobCode, `MANUAL:${user.userName}`);
    return ApiResponse.success(runLog, 'Job triggered');
  }

  /** Reload all job schedules from DB. */
  @Post('jobs/reload')
  async reloadAll() {
    await this.scheduler.reloadAll();
    return ApiResponse.success(null, 'All job schedules reloaded');
  }

  /** Update job-specific parameters. */
  @Put('jobs/:jobCode/params')
  async updateParams(
    @Param('jobCode') jobCode: string,
    @Body() dto: UpdateJobParamsDto,
    @CurrentUser() user: any,
  ) {
    const job = await this.prisma.working.cronJobConfig.update({
      where: { jobCode },
      data: {
        jobParams: dto.jobParams as any,
        updatedById: user.userId,
        updatedByName: user.userName,
      },
    });
    return ApiResponse.success(job, 'Job params updated');
  }

  /** Run history for a specific job. */
  @Get('jobs/:jobCode/history')
  async getHistory(
    @Param('jobCode') jobCode: string,
    @Query() query: RunHistoryQueryDto,
  ) {
    const where: any = { jobCode };
    if (query.status) where.status = query.status;
    if (query.triggeredBy) where.triggeredBy = { contains: query.triggeredBy };

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [data, total] = await Promise.all([
      this.prisma.working.cronJobRunLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.working.cronJobRunLog.count({ where }),
    ]);
    return ApiResponse.paginated(data, total, page, limit);
  }

  /** All recent runs across all jobs. */
  @Get('runs')
  async getAllRuns(@Query() query: RunHistoryQueryDto) {
    const where: any = {};
    if (query.status) where.status = query.status;

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [data, total] = await Promise.all([
      this.prisma.working.cronJobRunLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.working.cronJobRunLog.count({ where }),
    ]);
    return ApiResponse.paginated(data, total, page, limit);
  }

  /** Single run detail. */
  @Get('runs/:runId')
  async getRunDetail(@Param('runId') runId: string) {
    const run = await this.prisma.working.cronJobRunLog.findUnique({ where: { id: runId } });
    if (!run) return ApiResponse.error('Run not found');
    return ApiResponse.success(run);
  }

  /** Dashboard overview. */
  @Get('dashboard')
  async getDashboard() {
    const data = await this.analytics.getDashboard();
    return ApiResponse.success(data);
  }

  /** Today's execution timeline. */
  @Get('dashboard/timeline')
  async getTimeline() {
    const data = await this.analytics.getTimeline();
    return ApiResponse.success(data);
  }

  /** Health score per job. */
  @Get('dashboard/health')
  async getHealth() {
    const data = await this.analytics.getHealth();
    return ApiResponse.success(data);
  }

  /** List all registered handler codes. */
  @Get('registered')
  async getRegistered() {
    const codes = this.registry.listRegistered();
    return ApiResponse.success(codes, `${codes.length} handlers registered`);
  }
}
