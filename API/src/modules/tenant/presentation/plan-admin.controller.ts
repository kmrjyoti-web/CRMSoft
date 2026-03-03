import {
  Controller, Get, Post, Put, Param, Body, Query,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuperAdminGuard } from '../infrastructure/super-admin.guard';
import { SuperAdminRoute } from '../infrastructure/decorators/super-admin-route.decorator';
import { CreatePlanCommand } from '../application/commands/create-plan/create-plan.command';
import { UpdatePlanCommand } from '../application/commands/update-plan/update-plan.command';
import { DeactivatePlanCommand } from '../application/commands/deactivate-plan/deactivate-plan.command';
import { ListPlansQuery } from '../application/queries/list-plans/query';
import { GetPlanByIdQuery } from '../application/queries/get-plan-by-id/query';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanQueryDto } from './dto/plan-query.dto';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Plan Admin')
@ApiBearerAuth()
@SuperAdminRoute()
@UseGuards(SuperAdminGuard)
@Controller('admin/plans')
export class PlanAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription plan' })
  async create(@Body() dto: CreatePlanDto) {
    const planId = await this.commandBus.execute(
      new CreatePlanCommand(
        dto.name,
        dto.code,
        dto.interval,
        dto.price,
        dto.maxUsers,
        dto.maxContacts,
        dto.maxLeads,
        dto.maxProducts,
        dto.maxStorage,
        dto.features ?? [],
        dto.description,
        dto.currency,
        dto.isActive,
        dto.sortOrder,
      ),
    );
    const plan = await this.queryBus.execute(new GetPlanByIdQuery(planId));
    return ApiResponse.success(plan, 'Plan created');
  }

  @Get()
  @ApiOperation({ summary: 'List all subscription plans' })
  async findAll(@Query() query: PlanQueryDto) {
    const result = await this.queryBus.execute(new ListPlansQuery(query.isActive));
    return ApiResponse.success(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  async findById(@Param('id') id: string) {
    const plan = await this.queryBus.execute(new GetPlanByIdQuery(id));
    return ApiResponse.success(plan);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update plan details' })
  async update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    await this.commandBus.execute(
      new UpdatePlanCommand(
        id,
        dto.name,
        dto.description,
        dto.price,
        dto.maxUsers,
        dto.maxContacts,
        dto.maxLeads,
        dto.maxProducts,
        dto.maxStorage,
        dto.features,
        dto.isActive,
        dto.sortOrder,
      ),
    );
    const plan = await this.queryBus.execute(new GetPlanByIdQuery(id));
    return ApiResponse.success(plan, 'Plan updated');
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a plan' })
  async deactivate(@Param('id') id: string) {
    await this.commandBus.execute(new DeactivatePlanCommand(id));
    const plan = await this.queryBus.execute(new GetPlanByIdQuery(id));
    return ApiResponse.success(plan, 'Plan deactivated');
  }
}
