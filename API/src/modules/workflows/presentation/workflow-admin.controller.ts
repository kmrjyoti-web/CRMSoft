import {
  Controller, Get, Post, Put, Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowQueryDto } from './dto/workflow-query.dto';
import { CreateWorkflowCommand } from '../application/commands/create-workflow/create-workflow.command';
import { UpdateWorkflowCommand } from '../application/commands/update-workflow/update-workflow.command';
import { PublishWorkflowCommand } from '../application/commands/publish-workflow/publish-workflow.command';
import { CloneWorkflowCommand } from '../application/commands/clone-workflow/clone-workflow.command';
import { ValidateWorkflowCommand } from '../application/commands/validate-workflow/validate-workflow.command';
import { GetWorkflowListQuery } from '../application/queries/get-workflow-list/get-workflow-list.query';
import { GetWorkflowByIdQuery } from '../application/queries/get-workflow-by-id/get-workflow-by-id.query';
import { GetWorkflowVisualQuery } from '../application/queries/get-workflow-visual/get-workflow-visual.query';

@ApiTags('Workflows - Admin')
@ApiBearerAuth()
@Controller('workflows')
export class WorkflowAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions('workflows:create')
  @ApiOperation({ summary: 'Create a new workflow definition' })
  async create(@Body() dto: CreateWorkflowDto, @CurrentUser('id') userId: string) {
    const workflow = await this.commandBus.execute(
      new CreateWorkflowCommand(dto.name, dto.code, dto.entityType, userId, dto.description, dto.isDefault, dto.configJson),
    );
    return ApiResponse.success(workflow, 'Workflow created');
  }

  @Get()
  @RequirePermissions('workflows:read')
  @ApiOperation({ summary: 'List workflows (paginated)' })
  async findAll(@Query() q: WorkflowQueryDto) {
    const result = await this.queryBus.execute(
      new GetWorkflowListQuery(q.page ?? 1, q.limit ?? 20, q.sortOrder ?? 'desc', q.search, q.entityType),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('workflows:read')
  @ApiOperation({ summary: 'Get workflow details with states and transitions' })
  async findById(@Param('id') id: string) {
    const workflow = await this.queryBus.execute(new GetWorkflowByIdQuery(id));
    return ApiResponse.success(workflow);
  }

  @Put(':id')
  @RequirePermissions('workflows:update')
  @ApiOperation({ summary: 'Update workflow definition' })
  async update(@Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    await this.commandBus.execute(new UpdateWorkflowCommand(id, dto));
    const workflow = await this.queryBus.execute(new GetWorkflowByIdQuery(id));
    return ApiResponse.success(workflow, 'Workflow updated');
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('workflows:update')
  @ApiOperation({ summary: 'Publish workflow (increment version, validate)' })
  async publish(@Param('id') id: string) {
    const result = await this.commandBus.execute(new PublishWorkflowCommand(id));
    return ApiResponse.success(result, 'Workflow published');
  }

  @Post(':id/clone')
  @RequirePermissions('workflows:create')
  @ApiOperation({ summary: 'Clone workflow with all states and transitions' })
  async clone(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const clone = await this.commandBus.execute(new CloneWorkflowCommand(id, userId));
    return ApiResponse.success(clone, 'Workflow cloned');
  }

  @Get(':id/visual')
  @RequirePermissions('workflows:read')
  @ApiOperation({ summary: 'Get workflow diagram data (nodes + edges)' })
  async getVisual(@Param('id') id: string) {
    const visual = await this.queryBus.execute(new GetWorkflowVisualQuery(id));
    return ApiResponse.success(visual);
  }

  @Post(':id/validate')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('workflows:read')
  @ApiOperation({ summary: 'Validate workflow structure' })
  async validate(@Param('id') id: string) {
    const result = await this.commandBus.execute(new ValidateWorkflowCommand(id));
    return ApiResponse.success(result);
  }
}
