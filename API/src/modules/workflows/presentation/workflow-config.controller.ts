import {
  Controller, Post, Put, Delete, Param, Body,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { CreateTransitionDto } from './dto/create-transition.dto';
import { UpdateTransitionDto } from './dto/update-transition.dto';
import { AddStateCommand } from '../application/commands/add-state/add-state.command';
import { UpdateStateCommand } from '../application/commands/update-state/update-state.command';
import { RemoveStateCommand } from '../application/commands/remove-state/remove-state.command';
import { AddTransitionCommand } from '../application/commands/add-transition/add-transition.command';
import { UpdateTransitionCommand } from '../application/commands/update-transition/update-transition.command';
import { RemoveTransitionCommand } from '../application/commands/remove-transition/remove-transition.command';

@ApiTags('Workflows - Config')
@ApiBearerAuth()
@Controller('workflows')
export class WorkflowConfigController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post(':id/states')
  @RequirePermissions('workflows:update')
  @ApiOperation({ summary: 'Add a state to workflow' })
  async addState(@Param('id') workflowId: string, @Body() dto: CreateStateDto) {
    const state = await this.commandBus.execute(
      new AddStateCommand(workflowId, dto.name, dto.code, dto.stateType, dto.category, dto.color, dto.icon, dto.sortOrder, dto.metadata),
    );
    return ApiResponse.success(state, 'State added');
  }

  @Put('states/:stateId')
  @RequirePermissions('workflows:update')
  @ApiOperation({ summary: 'Update a workflow state' })
  async updateState(@Param('stateId') stateId: string, @Body() dto: UpdateStateDto) {
    const state = await this.commandBus.execute(new UpdateStateCommand(stateId, dto));
    return ApiResponse.success(state, 'State updated');
  }

  @Delete('states/:stateId')
  @RequirePermissions('workflows:delete')
  @ApiOperation({ summary: 'Remove a workflow state' })
  async removeState(@Param('stateId') stateId: string) {
    const result = await this.commandBus.execute(new RemoveStateCommand(stateId));
    return ApiResponse.success(result, 'State removed');
  }

  @Post(':id/transitions')
  @RequirePermissions('workflows:update')
  @ApiOperation({ summary: 'Add a transition to workflow' })
  async addTransition(@Param('id') workflowId: string, @Body() dto: CreateTransitionDto) {
    const transition = await this.commandBus.execute(
      new AddTransitionCommand(
        workflowId, dto.fromStateId, dto.toStateId, dto.name, dto.code,
        dto.triggerType, dto.conditions, dto.actions, dto.requiredPermission, dto.requiredRole, dto.sortOrder,
      ),
    );
    return ApiResponse.success(transition, 'Transition added');
  }

  @Put('transitions/:transitionId')
  @RequirePermissions('workflows:update')
  @ApiOperation({ summary: 'Update a workflow transition' })
  async updateTransition(@Param('transitionId') transitionId: string, @Body() dto: UpdateTransitionDto) {
    const transition = await this.commandBus.execute(new UpdateTransitionCommand(transitionId, dto));
    return ApiResponse.success(transition, 'Transition updated');
  }

  @Delete('transitions/:transitionId')
  @RequirePermissions('workflows:delete')
  @ApiOperation({ summary: 'Remove a workflow transition' })
  async removeTransition(@Param('transitionId') transitionId: string) {
    const result = await this.commandBus.execute(new RemoveTransitionCommand(transitionId));
    return ApiResponse.success(result, 'Transition removed');
  }
}
