import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Logger } from '@nestjs/common';
import { TestCenterService } from './test-center.service';
import { TestRunnerService } from './test-runner.service';
import { TestCoverageService } from './test-coverage.service';
import { CreateTestPlanDto } from './dto/create-test-plan.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { RunTestsDto } from './dto/run-tests.dto';

@Controller('platform-console/tests')
export class TestCenterController {
  private readonly logger = new Logger(TestCenterController.name);

  constructor(
    private readonly testCenterService: TestCenterService,
    private readonly testRunnerService: TestRunnerService,
    private readonly testCoverageService: TestCoverageService,
  ) {}

  // ─── Stats ───────────────────────────────────────────────────────────

  @Get('stats')
  async getStats() {
    return this.testCenterService.getStats();
  }

  // ─── Plans ───────────────────────────────────────────────────────────

  @Get('plans')
  async getPlans(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.testCenterService.getTestPlans({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('plans')
  async createPlan(@Body() dto: CreateTestPlanDto) {
    return this.testCenterService.createTestPlan(dto);
  }

  @Get('plans/:id')
  async getPlan(@Param('id') id: string) {
    return this.testCenterService.getTestPlan(id);
  }

  @Patch('plans/:id')
  async updatePlan(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; scenarios?: any[]; isActive?: boolean },
  ) {
    return this.testCenterService.updateTestPlan(id, body);
  }

  @Delete('plans/:id')
  async deletePlan(@Param('id') id: string) {
    return this.testCenterService.deleteTestPlan(id);
  }

  // ─── Execution ───────────────────────────────────────────────────────

  @Post('run')
  async runTests(@Body() dto: RunTestsDto) {
    return this.testRunnerService.runTests(dto);
  }

  @Post('run/module/:module')
  async runForModule(@Param('module') module: string) {
    return this.testRunnerService.runForModule(module);
  }

  @Post('run/vertical/:code')
  async runForVertical(@Param('code') code: string) {
    return this.testRunnerService.runForVertical(code);
  }

  @Get('executions/latest')
  async getLatestExecution() {
    return this.testCenterService.getLatestExecution();
  }

  @Get('executions')
  async getExecutions(
    @Query('status') status?: string,
    @Query('moduleScope') moduleScope?: string,
    @Query('triggerType') triggerType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.testCenterService.getExecutions({
      status,
      moduleScope,
      triggerType,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('executions/:id')
  async getExecution(@Param('id') id: string) {
    return this.testCenterService.getExecution(id);
  }

  // ─── Schedules ───────────────────────────────────────────────────────

  @Get('schedules')
  async getSchedules() {
    return this.testCenterService.getSchedules();
  }

  @Post('schedules')
  async createSchedule(@Body() dto: CreateScheduleDto) {
    return this.testCenterService.createSchedule(dto);
  }

  @Patch('schedules/:id')
  async updateSchedule(
    @Param('id') id: string,
    @Body() body: { cronExpression?: string; isActive?: boolean; moduleScope?: string },
  ) {
    return this.testCenterService.updateSchedule(id, body);
  }

  @Delete('schedules/:id')
  async deleteSchedule(@Param('id') id: string) {
    return this.testCenterService.deleteSchedule(id);
  }

  // ─── Coverage ────────────────────────────────────────────────────────

  @Get('coverage')
  async getCoverageOverview() {
    return this.testCoverageService.getCoverageOverview();
  }

  @Post('coverage/refresh')
  async refreshCoverage() {
    return this.testCoverageService.refreshCoverage();
  }

  @Get('coverage/:module')
  async getModuleCoverage(@Param('module') module: string) {
    return this.testCoverageService.getModuleCoverage(module);
  }
}
