import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FollowUpController } from './presentation/follow-up.controller';
import { CreateFollowUpHandler } from './application/commands/create-follow-up/create-follow-up.handler';
import { UpdateFollowUpHandler } from './application/commands/update-follow-up/update-follow-up.handler';
import { CompleteFollowUpHandler } from './application/commands/complete-follow-up/complete-follow-up.handler';
import { SnoozeFollowUpHandler } from './application/commands/snooze-follow-up/snooze-follow-up.handler';
import { ReassignFollowUpHandler } from './application/commands/reassign-follow-up/reassign-follow-up.handler';
import { DeleteFollowUpHandler } from './application/commands/delete-follow-up/delete-follow-up.handler';
import { GetFollowUpListHandler } from './application/queries/get-follow-up-list/get-follow-up-list.handler';
import { GetFollowUpByIdHandler } from './application/queries/get-follow-up-by-id/get-follow-up-by-id.handler';
import { GetOverdueFollowUpsHandler } from './application/queries/get-overdue-follow-ups/get-overdue-follow-ups.handler';
import { GetFollowUpStatsHandler } from './application/queries/get-follow-up-stats/get-follow-up-stats.handler';
import { OverdueCheckerService } from './application/services/overdue-checker.service';

const CommandHandlers = [
  CreateFollowUpHandler, UpdateFollowUpHandler, CompleteFollowUpHandler,
  SnoozeFollowUpHandler, ReassignFollowUpHandler, DeleteFollowUpHandler,
];
const QueryHandlers = [GetFollowUpListHandler, GetFollowUpByIdHandler, GetOverdueFollowUpsHandler, GetFollowUpStatsHandler];

@Module({
  imports: [CqrsModule],
  controllers: [FollowUpController],
  providers: [...CommandHandlers, ...QueryHandlers, OverdueCheckerService],
})
export class FollowUpsModule {}
