import { Injectable, Logger, HttpException } from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { LogDeploymentDto } from './dto/log-deployment.dto';
import { LogPipelineDto } from './dto/log-pipeline.dto';
import { CICD_ERRORS } from './cicd.errors';

const ENVIRONMENTS = ['PRODUCTION', 'STAGING', 'DEVELOPMENT'];

@Injectable()
export class CICDService {
  private readonly logger = new Logger(CICDService.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  async logDeployment(dto: LogDeploymentDto): Promise<any> {
    try {
      const deployment = await this.db.deploymentLog.create({
        data: {
          environment: dto.environment,
          version: dto.version,
          gitBranch: dto.gitBranch,
          gitCommitHash: dto.gitCommitHash,
          deployedBy: dto.deployedBy,
          status: 'DEPLOYING',
          startedAt: new Date(),
        },
      });

      this.logger.log(`Deployment logged: ${deployment.id} — ${dto.environment} v${dto.version}`);
      return deployment;
    } catch (error) {
      this.logger.error('Failed to log deployment', (error as any)?.stack || error);
      throw error;
    }
  }

  async completeDeployment(
    id: string,
    data: { status: string; duration?: number; errorMessage?: string },
  ): Promise<any> {
    try {
      const deployment = await this.db.deploymentLog.update({
        where: { id },
        data: {
          status: data.status,
          duration: data.duration,
          errorMessage: data.errorMessage,
          completedAt: new Date(),
        },
      });

      this.logger.log(`Deployment ${id} completed with status: ${data.status}`);
      return deployment;
    } catch (error) {
      this.logger.error(`Failed to complete deployment ${id}`, (error as any)?.stack || error);
      throw error;
    }
  }

  async getDeployments(filters: {
    environment?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; total: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;
      const where: any = {};

      if (filters.environment) where.environment = filters.environment;
      if (filters.status) where.status = filters.status;

      const [data, total] = await Promise.all([
        this.db.deploymentLog.findMany({
          where,
          orderBy: { startedAt: 'desc' },
          skip,
          take: limit,
        }),
        this.db.deploymentLog.count({ where }),
      ]);

      return { data, total };
    } catch (error) {
      this.logger.error('Failed to get deployments', (error as any)?.stack || error);
      throw error;
    }
  }

  async getDeployment(id: string): Promise<any> {
    try {
      const deployment = await this.db.deploymentLog.findUnique({ where: { id } });
      if (!deployment) {
        const err = CICD_ERRORS.DEPLOYMENT_NOT_FOUND;
        throw new HttpException(err.message, err.statusCode);
      }
      return deployment;
    } catch (error) {
      this.logger.error(`Failed to get deployment ${id}`, (error as any)?.stack || error);
      throw error;
    }
  }

  async getLatestDeployments(): Promise<any[]> {
    try {
      const deployments = [];

      for (const env of ENVIRONMENTS) {
        const deployment = await this.db.deploymentLog.findFirst({
          where: { environment: env },
          orderBy: { startedAt: 'desc' },
        });
        if (deployment) {
          deployments.push(deployment);
        }
      }

      return deployments;
    } catch (error) {
      this.logger.error('Failed to get latest deployments', (error as any)?.stack || error);
      throw error;
    }
  }

  async logPipelineRun(dto: LogPipelineDto): Promise<any> {
    try {
      const pipeline = await this.db.pipelineRun.create({
        data: {
          pipelineName: dto.pipelineName,
          triggerType: dto.triggerType,
          branch: dto.branch,
          status: 'RUNNING',
          jobs: dto.jobs || [],
          startedAt: new Date(),
        },
      });

      this.logger.log(`Pipeline run logged: ${pipeline.id} — ${dto.pipelineName}`);
      return pipeline;
    } catch (error) {
      this.logger.error('Failed to log pipeline run', (error as any)?.stack || error);
      throw error;
    }
  }

  async completePipelineRun(
    id: string,
    data: { status: string; jobs?: any[] },
  ): Promise<any> {
    try {
      const updateData: any = {
        status: data.status,
        completedAt: new Date(),
      };
      if (data.jobs) {
        updateData.jobs = data.jobs;
      }

      const pipeline = await this.db.pipelineRun.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(`Pipeline run ${id} completed with status: ${data.status}`);
      return pipeline;
    } catch (error) {
      this.logger.error(`Failed to complete pipeline run ${id}`, (error as any)?.stack || error);
      throw error;
    }
  }

  async getPipelines(params: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; total: number }> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 20;
      const skip = (page - 1) * limit;
      const where: any = {};

      if (params.status) where.status = params.status;

      const [data, total] = await Promise.all([
        this.db.pipelineRun.findMany({
          where,
          orderBy: { startedAt: 'desc' },
          skip,
          take: limit,
        }),
        this.db.pipelineRun.count({ where }),
      ]);

      return { data, total };
    } catch (error) {
      this.logger.error('Failed to get pipelines', (error as any)?.stack || error);
      throw error;
    }
  }

  async getPipeline(id: string): Promise<any> {
    try {
      const pipeline = await this.db.pipelineRun.findUnique({ where: { id } });
      if (!pipeline) {
        const err = CICD_ERRORS.PIPELINE_NOT_FOUND;
        throw new HttpException(err.message, err.statusCode);
      }
      return pipeline;
    } catch (error) {
      this.logger.error(`Failed to get pipeline ${id}`, (error as any)?.stack || error);
      throw error;
    }
  }

  async getPipelineLogs(id: string): Promise<any[]> {
    try {
      return await this.db.buildLog.findMany({
        where: { pipelineRunId: id },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      this.logger.error(`Failed to get pipeline logs for ${id}`, (error as any)?.stack || error);
      throw error;
    }
  }

  async addBuildLog(data: {
    pipelineRunId: string;
    jobName: string;
    output: string;
    exitCode?: number;
    duration?: number;
  }): Promise<any> {
    try {
      const log = await this.db.buildLog.create({
        data: {
          pipelineRunId: data.pipelineRunId,
          jobName: data.jobName,
          output: data.output,
          exitCode: data.exitCode,
          duration: data.duration,
        },
      });

      this.logger.log(`Build log added: ${log.id} — job ${data.jobName}`);
      return log;
    } catch (error) {
      this.logger.error('Failed to add build log', (error as any)?.stack || error);
      throw error;
    }
  }

  async getStats(): Promise<object> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        totalDeployments,
        latestDeploy,
        deploysLast30Days,
        failedDeployments,
        totalPipelines,
        failedPipelines,
      ] = await Promise.all([
        this.db.deploymentLog.count(),
        this.db.deploymentLog.findFirst({ orderBy: { startedAt: 'desc' } }),
        this.db.deploymentLog.count({ where: { startedAt: { gte: thirtyDaysAgo } } }),
        this.db.deploymentLog.count({ where: { status: 'FAILED' } }),
        this.db.pipelineRun.count(),
        this.db.pipelineRun.count({ where: { status: 'FAILED' } }),
      ]);

      // Calculate average duration from completed deployments
      const completedDeploys = await this.db.deploymentLog.findMany({
        where: { duration: { not: null } },
        select: { duration: true },
      });

      const avgDuration =
        completedDeploys.length > 0
          ? Math.round(
              completedDeploys.reduce((sum, d) => sum + (d.duration || 0), 0) /
                completedDeploys.length,
            )
          : 0;

      const deployFrequencyPerWeek =
        deploysLast30Days > 0 ? Math.round((deploysLast30Days / 4.3) * 10) / 10 : 0;

      const failureRate =
        totalDeployments > 0
          ? Math.round((failedDeployments / totalDeployments) * 100 * 10) / 10
          : 0;

      const pipelineSuccessRate =
        totalPipelines > 0
          ? Math.round(((totalPipelines - failedPipelines) / totalPipelines) * 100 * 10) / 10
          : 0;

      return {
        totalDeployments,
        latestDeploy,
        deployFrequencyPerWeek,
        avgDurationSeconds: avgDuration,
        failureRate,
        totalPipelines,
        pipelineSuccessRate,
      };
    } catch (error) {
      this.logger.error('Failed to get CI/CD stats', (error as any)?.stack || error);
      throw error;
    }
  }
}
