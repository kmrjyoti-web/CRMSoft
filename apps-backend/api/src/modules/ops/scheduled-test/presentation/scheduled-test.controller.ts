import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateScheduledTestCommand } from '../application/commands/create-scheduled-test/create-scheduled-test.command';
import { UpdateScheduledTestCommand } from '../application/commands/update-scheduled-test/update-scheduled-test.command';
import { DeleteScheduledTestCommand } from '../application/commands/delete-scheduled-test/delete-scheduled-test.command';
import { TriggerScheduledTestCommand } from '../application/commands/trigger-scheduled-test/trigger-scheduled-test.command';
import { ListScheduledTestsQuery } from '../application/queries/list-scheduled-tests/list-scheduled-tests.query';
import { GetScheduledTestQuery } from '../application/queries/get-scheduled-test/get-scheduled-test.query';
import { ListScheduledTestRunsQuery } from '../application/queries/list-scheduled-test-runs/list-scheduled-test-runs.query';

@Controller('ops/scheduled-test')
@UseGuards(JwtAuthGuard)
@RequirePermissions('ops:manage')
export class ScheduledTestController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /** POST /ops/scheduled-test — Create a new schedule */
  @Post()
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: {
      name: string;
      cronExpression: string;
      targetModules: string[];
      testTypes: string[];
      description?: string;
      dbSourceType?: string;
    },
  ) {
    const result = await this.commandBus.execute(
      new CreateScheduledTestCommand(
        tenantId, userId, body.name, body.cronExpression,
        body.targetModules, body.testTypes, body.description, body.dbSourceType,
      ),
    );
    return ApiResponse.success(result, 'Scheduled test created');
  }

  /** GET /ops/scheduled-test — List all schedules */
  @Get()
  async list(
    @CurrentUser('tenantId') tenantId: string,
    @Query('isActive') isActive?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const active = isActive !== undefined ? isActive === 'true' : undefined;
    const data = await this.queryBus.execute(new ListScheduledTestsQuery(tenantId, active, page, limit));
    return ApiResponse.success(data);
  }

  /** GET /ops/scheduled-test/:id — Get schedule with recent runs */
  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const data = await this.queryBus.execute(new GetScheduledTestQuery(id, tenantId));
    return ApiResponse.success(data);
  }

  /** PATCH /ops/scheduled-test/:id — Update schedule */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: {
      name?: string;
      description?: string;
      cronExpression?: string;
      targetModules?: string[];
      testTypes?: string[];
      dbSourceType?: string;
      isActive?: boolean;
    },
  ) {
    const result = await this.commandBus.execute(
      new UpdateScheduledTestCommand(
        id, tenantId, body.name, body.description, body.cronExpression,
        body.targetModules, body.testTypes, body.dbSourceType, body.isActive,
      ),
    );
    return ApiResponse.success(result, 'Scheduled test updated');
  }

  /** DELETE /ops/scheduled-test/:id — Soft delete */
  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.commandBus.execute(new DeleteScheduledTestCommand(id, tenantId));
    return ApiResponse.success(null, 'Scheduled test deleted');
  }

  /** POST /ops/scheduled-test/:id/trigger — Manual run now */
  @Post(':id/trigger')
  async trigger(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.commandBus.execute(new TriggerScheduledTestCommand(id, tenantId, userId));
    return ApiResponse.success(result, 'Scheduled test triggered');
  }

  /** GET /ops/scheduled-test/:id/runs — Run history */
  @Get(':id/runs')
  async getRuns(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const data = await this.queryBus.execute(new ListScheduledTestRunsQuery(id, tenantId, limit));
    return ApiResponse.success(data);
  }
}
