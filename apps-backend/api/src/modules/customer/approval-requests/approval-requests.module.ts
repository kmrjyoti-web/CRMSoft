import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ApprovalRequestsController } from './presentation/approval-requests.controller';
import { SubmitApprovalHandler } from './application/commands/submit-approval/submit-approval.handler';
import { ApproveRequestHandler } from './application/commands/approve-request/approve-request.handler';
import { RejectRequestHandler } from './application/commands/reject-request/reject-request.handler';
import { GetPendingHandler } from './application/queries/get-pending/get-pending.handler';
import { GetMyRequestsHandler } from './application/queries/get-my-requests/get-my-requests.handler';
import { GetRequestDetailHandler } from './application/queries/get-request-detail/get-request-detail.handler';

const CommandHandlers = [SubmitApprovalHandler, ApproveRequestHandler, RejectRequestHandler];
const QueryHandlers = [GetPendingHandler, GetMyRequestsHandler, GetRequestDetailHandler];

@Module({
  imports: [CqrsModule],
  controllers: [ApprovalRequestsController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class ApprovalRequestsModule {}
