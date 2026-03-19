import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CreateAssignmentRuleCommand } from '../application/commands/create-assignment-rule/create-assignment-rule.command';
import { UpdateAssignmentRuleCommand } from '../application/commands/update-assignment-rule/update-assignment-rule.command';
import { DeleteAssignmentRuleCommand } from '../application/commands/delete-assignment-rule/delete-assignment-rule.command';
import { AutoAssignCommand } from '../application/commands/auto-assign/auto-assign.command';
import { GetAssignmentRulesQuery } from '../application/queries/get-assignment-rules/get-assignment-rules.query';
import { CreateRuleDto } from './dto/create-rule.dto';
import { AutoAssignDto } from './dto/auto-assign.dto';
import { RuleEngineService } from '../services/rule-engine.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Controller('ownership/rules')
@UseGuards(AuthGuard('jwt'))
export class OwnershipRulesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly ruleEngine: RuleEngineService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @RequirePermissions('ownership:create')
  async createRule(@Body() dto: CreateRuleDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new CreateAssignmentRuleCommand(
      dto.name, dto.entityType, dto.triggerEvent, dto.conditions,
      dto.assignmentMethod, userId, dto.description,
      dto.assignToUserId, dto.assignToTeamIds, dto.assignToRoleId,
      dto.ownerType, dto.priority, dto.maxPerUser, dto.respectWorkload,
      dto.escalateAfterHours, dto.escalateToUserId, dto.escalateToRoleId,
    ));
    return ApiResponse.success(result, 'Assignment rule created');
  }

  @Get()
  @RequirePermissions('ownership:read')
  async listRules(@Query() query: any) {
    const result = await this.queryBus.execute(new GetAssignmentRulesQuery(query.entityType, query.status, query.page, query.limit));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('ownership:read')
  async getRule(@Param('id') id: string) {
    const rule = await this.prisma.assignmentRule.findUnique({ where: { id } });
    return ApiResponse.success(rule);
  }

  @Put(':id')
  @RequirePermissions('ownership:update')
  async updateRule(@Param('id') id: string, @Body() dto: any) {
    const result = await this.commandBus.execute(new UpdateAssignmentRuleCommand(id, dto));
    return ApiResponse.success(result, 'Assignment rule updated');
  }

  @Delete(':id')
  @RequirePermissions('ownership:delete')
  async deleteRule(@Param('id') id: string) {
    await this.commandBus.execute(new DeleteAssignmentRuleCommand(id));
    return ApiResponse.success(null, 'Assignment rule deactivated');
  }

  @Post(':id/test')
  @RequirePermissions('ownership:read')
  async testRule(@Param('id') id: string, @Body() dto: { entityType: string; entityId: string }) {
    const result = await this.ruleEngine.testRule(id, dto.entityType, dto.entityId);
    return ApiResponse.success(result);
  }

  @Post('/auto-assign')
  @RequirePermissions('ownership:create')
  async autoAssign(@Body() dto: AutoAssignDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new AutoAssignCommand(
      dto.entityType, dto.entityId, dto.triggerEvent, userId,
    ));
    return ApiResponse.success(result);
  }
}
