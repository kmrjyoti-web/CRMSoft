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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateTestGroupDto, UpdateTestGroupDto } from './dto/create-test-group.dto';
import { CreateTestGroupCommand } from '../application/commands/create-test-group/create-test-group.command';
import { UpdateTestGroupCommand } from '../application/commands/update-test-group/update-test-group.command';
import { DeleteTestGroupCommand } from '../application/commands/delete-test-group/delete-test-group.command';
import { RunTestGroupCommand } from '../application/commands/run-test-group/run-test-group.command';
import { ListTestGroupsQuery } from '../application/queries/list-test-groups/list-test-groups.query';
import { GetTestGroupQuery } from '../application/queries/get-test-group/get-test-group.query';
import { ListGroupExecutionsQuery } from '../application/queries/list-group-executions/list-group-executions.query';
import { GetGroupExecutionQuery } from '../application/queries/get-group-execution/get-group-execution.query';

const ASSERTION_OPERATORS = [
  { code: 'eq', label: 'Equals', example: 'status eq 200' },
  { code: 'neq', label: 'Not equals', example: 'status neq 500' },
  { code: 'gt', label: 'Greater than', example: 'body.data.count gt 0' },
  { code: 'gte', label: 'Greater or equal', example: 'body.data.total gte 100' },
  { code: 'lt', label: 'Less than', example: 'duration lt 5000' },
  { code: 'lte', label: 'Less or equal', example: 'body.data.score lte 10' },
  { code: 'exists', label: 'Exists (not null)', example: 'body.data.id exists' },
  { code: 'not_exists', label: 'Does not exist', example: 'body.error not_exists' },
  { code: 'contains', label: 'Contains string', example: 'body.data.name contains "Test"' },
  { code: 'matches', label: 'Regex match', example: 'body.data.email matches "@example.com"' },
  { code: 'in', label: 'In array', example: 'status in [200, 201]' },
  { code: 'type', label: 'Type check', example: 'body.data type "object"' },
];

@Controller('ops/test-groups')
@UseGuards(JwtAuthGuard)
@RequirePermissions('ops:manage')
export class TestGroupsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /** POST /ops/test-groups */
  @Post()
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTestGroupDto,
  ) {
    const data = await this.commandBus.execute(new CreateTestGroupCommand(tenantId, userId, dto));
    return ApiResponse.success(data, 'Test group created');
  }

  /** GET /ops/test-groups */
  @Get()
  async list(
    @CurrentUser('tenantId') tenantId: string,
    @Query('status') status?: string,
    @Query('module') module?: string,
  ) {
    const data = await this.queryBus.execute(new ListTestGroupsQuery(tenantId, { status, module }));
    return ApiResponse.success(data);
  }

  /** GET /ops/test-groups/meta/operators */
  @Get('meta/operators')
  async getOperators() {
    return ApiResponse.success(ASSERTION_OPERATORS);
  }

  /** GET /ops/test-groups/execution/:executionId */
  @Get('execution/:executionId')
  async getExecution(@Param('executionId', ParseUUIDPipe) executionId: string) {
    const data = await this.queryBus.execute(new GetGroupExecutionQuery(executionId));
    return ApiResponse.success(data);
  }

  /** GET /ops/test-groups/:id */
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.queryBus.execute(new GetTestGroupQuery(id));
    return ApiResponse.success(data);
  }

  /** PATCH /ops/test-groups/:id */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTestGroupDto,
  ) {
    const data = await this.commandBus.execute(new UpdateTestGroupCommand(id, dto));
    return ApiResponse.success(data, 'Test group updated');
  }

  /** DELETE /ops/test-groups/:id */
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.commandBus.execute(new DeleteTestGroupCommand(id));
    return ApiResponse.success(data, 'Test group deleted');
  }

  /** POST /ops/test-groups/:id/run */
  @Post(':id/run')
  async run(
    @Param('id', ParseUUIDPipe) groupId: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { testEnvId?: string },
  ) {
    const data = await this.commandBus.execute(
      new RunTestGroupCommand(tenantId, userId, groupId, body.testEnvId),
    );
    return ApiResponse.success(data, 'Test group execution started');
  }

  /** GET /ops/test-groups/:id/executions */
  @Get(':id/executions')
  async listExecutions(@Param('id', ParseUUIDPipe) groupId: string) {
    const data = await this.queryBus.execute(new ListGroupExecutionsQuery(groupId));
    return ApiResponse.success(data);
  }
}
