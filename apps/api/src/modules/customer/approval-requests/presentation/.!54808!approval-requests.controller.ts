import {
  Controller, Post, Get, Param, Body,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
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

