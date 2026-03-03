import {
  Controller, Post, Get, Param, Body,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { SubmitApprovalDto, ApproveRejectDto } from './dto/approval-request.dto';
import { SubmitApprovalCommand } from '../application/commands/submit-approval/submit-approval.command';
import { ApproveRequestCommand } from '../application/commands/approve-request/approve-request.command';
import { RejectRequestCommand } from '../application/commands/reject-request/reject-request.command';
import { GetPendingQuery } from '../application/queries/get-pending/get-pending.query';
import { GetMyRequestsQuery } from '../application/queries/get-my-requests/get-my-requests.query';
import { GetRequestDetailQuery } from '../application/queries/get-request-detail/get-request-detail.query';

@Controller('approval-requests')
export class ApprovalRequestsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /** POST /submit — Submit action for approval. */
  @Post('submit')
  async submit(@Body() dto: SubmitApprovalDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(
      new SubmitApprovalCommand(
        dto.entityType, dto.entityId, dto.action,
        user.id, user.role, user.roleLevel ?? 5,
        dto.payload, dto.makerNote,
      ),
    );
    if (!result) {
      return ApiResponse.success(null, 'No approval required for this action');
    }
    return ApiResponse.success(result, 'Approval request submitted');
  }

  /** POST /:id/approve — Approve a pending request. */
  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() dto: ApproveRejectDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.commandBus.execute(
      new ApproveRequestCommand(id, user.id, user.role, dto.note),
    );
    return ApiResponse.success(result, 'Request approved');
  }

  /** POST /:id/reject — Reject a pending request. */
  @Post(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() dto: ApproveRejectDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.commandBus.execute(
      new RejectRequestCommand(id, user.id, dto.note),
    );
    return ApiResponse.success(result, 'Request rejected');
  }

  /** GET /pending — Pending requests for current user's checker role. */
  @Get('pending')
  async getPending(@CurrentUser() user: any) {
    const result = await this.queryBus.execute(new GetPendingQuery(user.role));
    return ApiResponse.success(result);
  }

  /** GET /my-requests — Requests I submitted. */
  @Get('my-requests')
  async getMyRequests(@CurrentUser('id') userId: string) {
    const result = await this.queryBus.execute(new GetMyRequestsQuery(userId));
    return ApiResponse.success(result);
  }

  /** GET /:id — Request detail. */
  @Get(':id')
  async getDetail(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetRequestDetailQuery(id));
    return ApiResponse.success(result);
  }
}
