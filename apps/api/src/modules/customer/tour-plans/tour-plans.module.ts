import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TourPlanController } from './presentation/tour-plan.controller';
import { CreateTourPlanHandler } from './application/commands/create-tour-plan/create-tour-plan.handler';
import { UpdateTourPlanHandler } from './application/commands/update-tour-plan/update-tour-plan.handler';
import { SubmitTourPlanHandler } from './application/commands/submit-tour-plan/submit-tour-plan.handler';
import { ApproveTourPlanHandler } from './application/commands/approve-tour-plan/approve-tour-plan.handler';
import { RejectTourPlanHandler } from './application/commands/reject-tour-plan/reject-tour-plan.handler';
import { CheckInVisitHandler } from './application/commands/check-in-visit/check-in-visit.handler';
import { CheckOutVisitHandler } from './application/commands/check-out-visit/check-out-visit.handler';
import { CancelTourPlanHandler } from './application/commands/cancel-tour-plan/cancel-tour-plan.handler';
import { GetTourPlanListHandler } from './application/queries/get-tour-plan-list/get-tour-plan-list.handler';
import { GetTourPlanByIdHandler } from './application/queries/get-tour-plan-by-id/get-tour-plan-by-id.handler';
import { GetTourPlanStatsHandler } from './application/queries/get-tour-plan-stats/get-tour-plan-stats.handler';

const CommandHandlers = [
  CreateTourPlanHandler, UpdateTourPlanHandler, SubmitTourPlanHandler,
  ApproveTourPlanHandler, RejectTourPlanHandler,
  CheckInVisitHandler, CheckOutVisitHandler, CancelTourPlanHandler,
];
const QueryHandlers = [GetTourPlanListHandler, GetTourPlanByIdHandler, GetTourPlanStatsHandler];

@Module({
  imports: [CqrsModule],
  controllers: [TourPlanController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class TourPlansModule {}
