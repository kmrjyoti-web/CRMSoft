import {
  Controller, Get, Post, Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { InitializeWorkflowDto } from './dto/initialize-workflow.dto';
import { ExecuteTransitionDto } from './dto/execute-transition.dto';
import { InitializeWorkflowCommand } from '../application/commands/initialize-workflow/initialize-workflow.command';
import { ExecuteTransitionCommand } from '../application/commands/execute-transition/execute-transition.command';
import { RollbackTransitionCommand } from '../application/commands/rollback-transition/rollback-transition.command';
import { GetInstanceQuery } from '../application/queries/get-instance/get-instance.query';
import { GetEntityStatusQuery } from '../application/queries/get-entity-status/get-entity-status.query';
import { GetInstanceTransitionsQuery } from '../application/queries/get-instance-transitions/get-instance-transitions.query';
import { GetInstanceHistoryQuery } from '../application/queries/get-instance-history/get-instance-history.query';
import { GetWorkflowStatsQuery } from '../application/queries/get-workflow-stats/get-workflow-stats.query';

@ApiTags('Workflow Execution')
@ApiBearerAuth()
@Controller('workflow-execution')
export class WorkflowExecutionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('initialize')
  @RequirePermissions('workflows:create')
  @ApiOperation({ summary: 'Initialize a workflow for an entity' })
  async initialize(@Body() dto: InitializeWorkflowDto, @CurrentUser('id') userId: string) {
    const instance = await this.commandBus.execute(
      new InitializeWorkflowCommand(dto.entityType, dto.entityId, userId, dto.workflowId),
    );
    return ApiResponse.success(instance, 'Workflow initialized');
  }

  @Post('transition')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('workflows:update')
  @ApiOperation({ summary: 'Execute a workflow transition' })
  async transition(@Body() dto: ExecuteTransitionDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new ExecuteTransitionCommand(dto.instanceId, dto.transitionCode, userId, dto.comment, dto.data),
    );
    return ApiResponse.success(result, 'Transition executed');
  }

  @Get('instance/:instanceId')
  @RequirePermissions('workflows:read')
  @ApiOperation({ summary: 'Get workflow instance details' })
  async getInstance(@Param('instanceId') instanceId: string) {
    const instance = await this.queryBus.execute(new GetInstanceQuery(instanceId));
    return ApiResponse.success(instance);
  }

  @Get('entity/:entityType/:entityId')
  @RequirePermissions('workflows:read')
  @ApiOperation({ summary: 'Get workflow status for an entity' })
  async getEntityStatus(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
    const status = await this.queryBus.execute(new GetEntityStatusQuery(entityType, entityId));
    return ApiResponse.success(status);
  }

  @Get('instance/:instanceId/transitions')
  @RequirePermissions('workflows:read')
  @ApiOperation({ summary: 'Get available transitions for an instance' })
  async getTransitions(@Param('instanceId') instanceId: string, @CurrentUser('id') userId: string) {
    const transitions = await this.queryBus.execute(new GetInstanceTransitionsQuery(instanceId, userId));
    return ApiResponse.success(transitions);
  }

  @Get('instance/:instanceId/history')
  @RequirePermissions('workflows:read')
  @ApiOperation({ summary: 'Get transition history for an instance' })
  async getHistory(@Param('instanceId') instanceId: string) {
    const history = await this.queryBus.execute(new GetInstanceHistoryQuery(instanceId));
    return ApiResponse.success(history);
  }

  @Post('instance/:instanceId/rollback')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('workflows:update')
  @ApiOperation({ summary: 'Rollback to previous state' })
  async rollback(@Param('instanceId') instanceId: string, @CurrentUser('id') userId: string, @Body('comment') comment?: string) {
    const result = await this.commandBus.execute(new RollbackTransitionCommand(instanceId, userId, comment));
    return ApiResponse.success(result, 'Rolled back to previous state');
  }

  @Get('stats')
  @RequirePermissions('workflows:read')
  @ApiOperation({ summary: 'Get workflow statistics' })
  async getStats(@Query('entityType') entityType?: string) {
    const stats = await this.queryBus.execute(new GetWorkflowStatsQuery(entityType));
    return ApiResponse.success(stats);
  }
}
