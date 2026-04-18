"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CICDService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CICDService = void 0;
const common_1 = require("@nestjs/common");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const cicd_errors_1 = require("./cicd.errors");
const ENVIRONMENTS = ['PRODUCTION', 'STAGING', 'DEVELOPMENT'];
let CICDService = CICDService_1 = class CICDService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(CICDService_1.name);
    }
    async logDeployment(dto) {
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
        }
        catch (error) {
            this.logger.error('Failed to log deployment', error?.stack || error);
            throw error;
        }
    }
    async completeDeployment(id, data) {
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
        }
        catch (error) {
            this.logger.error(`Failed to complete deployment ${id}`, error?.stack || error);
            throw error;
        }
    }
    async getDeployments(filters) {
        try {
            const page = filters.page || 1;
            const limit = filters.limit || 20;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters.environment)
                where.environment = filters.environment;
            if (filters.status)
                where.status = filters.status;
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
        }
        catch (error) {
            this.logger.error('Failed to get deployments', error?.stack || error);
            throw error;
        }
    }
    async getDeployment(id) {
        try {
            const deployment = await this.db.deploymentLog.findUnique({ where: { id } });
            if (!deployment) {
                const err = cicd_errors_1.CICD_ERRORS.DEPLOYMENT_NOT_FOUND;
                throw new common_1.HttpException(err.message, err.statusCode);
            }
            return deployment;
        }
        catch (error) {
            this.logger.error(`Failed to get deployment ${id}`, error?.stack || error);
            throw error;
        }
    }
    async getLatestDeployments() {
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
        }
        catch (error) {
            this.logger.error('Failed to get latest deployments', error?.stack || error);
            throw error;
        }
    }
    async logPipelineRun(dto) {
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
        }
        catch (error) {
            this.logger.error('Failed to log pipeline run', error?.stack || error);
            throw error;
        }
    }
    async completePipelineRun(id, data) {
        try {
            const updateData = {
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
        }
        catch (error) {
            this.logger.error(`Failed to complete pipeline run ${id}`, error?.stack || error);
            throw error;
        }
    }
    async getPipelines(params) {
        try {
            const page = params.page || 1;
            const limit = params.limit || 20;
            const skip = (page - 1) * limit;
            const where = {};
            if (params.status)
                where.status = params.status;
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
        }
        catch (error) {
            this.logger.error('Failed to get pipelines', error?.stack || error);
            throw error;
        }
    }
    async getPipeline(id) {
        try {
            const pipeline = await this.db.pipelineRun.findUnique({ where: { id } });
            if (!pipeline) {
                const err = cicd_errors_1.CICD_ERRORS.PIPELINE_NOT_FOUND;
                throw new common_1.HttpException(err.message, err.statusCode);
            }
            return pipeline;
        }
        catch (error) {
            this.logger.error(`Failed to get pipeline ${id}`, error?.stack || error);
            throw error;
        }
    }
    async getPipelineLogs(id) {
        try {
            return await this.db.buildLog.findMany({
                where: { pipelineRunId: id },
                orderBy: { createdAt: 'asc' },
            });
        }
        catch (error) {
            this.logger.error(`Failed to get pipeline logs for ${id}`, error?.stack || error);
            throw error;
        }
    }
    async addBuildLog(data) {
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
        }
        catch (error) {
            this.logger.error('Failed to add build log', error?.stack || error);
            throw error;
        }
    }
    async getStats() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const [totalDeployments, latestDeploy, deploysLast30Days, failedDeployments, totalPipelines, failedPipelines,] = await Promise.all([
                this.db.deploymentLog.count(),
                this.db.deploymentLog.findFirst({ orderBy: { startedAt: 'desc' } }),
                this.db.deploymentLog.count({ where: { startedAt: { gte: thirtyDaysAgo } } }),
                this.db.deploymentLog.count({ where: { status: 'FAILED' } }),
                this.db.pipelineRun.count(),
                this.db.pipelineRun.count({ where: { status: 'FAILED' } }),
            ]);
            const completedDeploys = await this.db.deploymentLog.findMany({
                where: { duration: { not: null } },
                select: { duration: true },
            });
            const avgDuration = completedDeploys.length > 0
                ? Math.round(completedDeploys.reduce((sum, d) => sum + (d.duration || 0), 0) /
                    completedDeploys.length)
                : 0;
            const deployFrequencyPerWeek = deploysLast30Days > 0 ? Math.round((deploysLast30Days / 4.3) * 10) / 10 : 0;
            const failureRate = totalDeployments > 0
                ? Math.round((failedDeployments / totalDeployments) * 100 * 10) / 10
                : 0;
            const pipelineSuccessRate = totalPipelines > 0
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
        }
        catch (error) {
            this.logger.error('Failed to get CI/CD stats', error?.stack || error);
            throw error;
        }
    }
};
exports.CICDService = CICDService;
exports.CICDService = CICDService = CICDService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService])
], CICDService);
//# sourceMappingURL=cicd.service.js.map