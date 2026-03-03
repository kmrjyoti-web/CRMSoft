import {
  Controller, Get, Post, Param, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { ApproveRejectDto } from './dto/approve-reject.dto';
import { ApproveTransitionCommand } from '../application/commands/approve-transition/approve-transition.command';
import { RejectTransitionCommand } from '../application/commands/reject-transition/reject-transition.command';
import { GetPendingApprovalsQuery } from '../application/queries/get-pending-approvals/get-pending-approvals.query';
import { GetApprovalByIdQuery } from '../application/queries/get-approval-by-id/get-approval-by-id.query';
import { GetApprovalHistoryQuery } from '../application/queries/get-approval-history/get-approval-history.query';

@ApiTags('Workflow Approvals')
@ApiBearerAuth()
@Controller('workflow-approvals')
export class WorkflowApprovalController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('pending')
  @RequirePermissions('workflows:read')
  @ApiOperation({ summary: 'Get pending workflow approvals' })
  async getPending(@CurrentUser('id') userId: string) {
    const approvals = await this.queryBus.execute(new GetPendingApprovalsQuery(userId));
    return ApiResponse.success(approvals);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('workflows:update')
  @ApiOperation({ summary: 'Approve a workflow transition' })
  async approve(@Param('id') id: string, @Body() dto: ApproveRejectDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new ApproveTransitionCommand(id, userId, dto.comment));
    return ApiResponse.success(result, 'Transition approved');
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('workflows:update')
  @ApiOperation({ summary: 'Reject a workflow transition' })
  async reject(@Param('id') id: string, @Body() dto: ApproveRejectDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new RejectTransitionCommand(id, userId, dto.comment));
    return ApiResponse.success(result, 'Transition rejected');
  }

  @Get(':id')
  @RequirePermissions('workflows:read')
  @ApiOperation({ summary: 'Get approval details' })
  async getById(@Param('id') id: string) {
    const approval = await this.queryBus.execute(new GetApprovalByIdQuery(id));
    return ApiResponse.success(approval);
  }

  @Get('history')
  @RequirePermissions('workflows:read')
  @ApiOperation({ summary: 'Get approval history' })
  async getHistory(@CurrentUser('id') userId: string) {
    const history = await this.queryBus.execute(new GetApprovalHistoryQuery(userId));
    return ApiResponse.success(history);
  }
}
