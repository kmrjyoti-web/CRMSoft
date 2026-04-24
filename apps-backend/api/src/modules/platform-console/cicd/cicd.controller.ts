import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { CICDService } from './cicd.service';
import { LogDeploymentDto } from './dto/log-deployment.dto';
import { LogPipelineDto } from './dto/log-pipeline.dto';

@Controller('platform-console/cicd')
export class CICDController {
  constructor(private readonly cicdService: CICDService) {}

  // --- Stats (static route first) ---

  @Get('stats')
  getStats() {
    return this.cicdService.getStats();
  }

  // --- Deployments ---

  @Get('deployments/latest')
  getLatestDeployments() {
    return this.cicdService.getLatestDeployments();
  }

  @Get('deployments')
  getDeployments(
    @Query('environment') environment?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.cicdService.getDeployments({
      environment,
      status,
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @Post('deployments')
  logDeployment(@Body() dto: LogDeploymentDto) {
    return this.cicdService.logDeployment(dto);
  }

  @Get('deployments/:id')
  getDeployment(@Param('id') id: string) {
    return this.cicdService.getDeployment(id);
  }

  @Patch('deployments/:id')
  completeDeployment(
    @Param('id') id: string,
    @Body() body: { status: string; duration?: number; errorMessage?: string },
  ) {
    return this.cicdService.completeDeployment(id, body);
  }

  // --- Pipelines ---

  @Get('pipelines')
  getPipelines(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.cicdService.getPipelines({
      status,
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @Post('pipelines')
  logPipelineRun(@Body() dto: LogPipelineDto) {
    return this.cicdService.logPipelineRun(dto);
  }

  @Get('pipelines/:id')
  getPipeline(@Param('id') id: string) {
    return this.cicdService.getPipeline(id);
  }

  @Patch('pipelines/:id')
  completePipelineRun(
    @Param('id') id: string,
    @Body() body: { status: string; jobs?: any[] },
  ) {
    return this.cicdService.completePipelineRun(id, body);
  }

  @Get('pipelines/:id/logs')
  getPipelineLogs(@Param('id') id: string) {
    return this.cicdService.getPipelineLogs(id);
  }

  @Post('pipelines/:id/logs')
  addBuildLog(
    @Param('id') id: string,
    @Body() body: { jobName: string; output: string; exitCode?: number; duration?: number },
  ) {
    return this.cicdService.addBuildLog({
      pipelineRunId: id,
      jobName: body.jobName,
      output: body.output,
      exitCode: body.exitCode,
      duration: body.duration,
    });
  }
}
