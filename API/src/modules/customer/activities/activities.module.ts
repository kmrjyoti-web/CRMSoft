import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TableConfigModule } from '../../softwarevendor/table-config/table-config.module';
import { NotificationsModule } from '../../core/notifications/notifications.module';
import { ActivityController } from './presentation/activity.controller';
import { CreateActivityHandler } from './application/commands/create-activity/create-activity.handler';
import { UpdateActivityHandler } from './application/commands/update-activity/update-activity.handler';
import { CompleteActivityHandler } from './application/commands/complete-activity/complete-activity.handler';
import { DeleteActivityHandler } from './application/commands/delete-activity/delete-activity.handler';
import { DeactivateActivityHandler } from './application/commands/deactivate-activity/deactivate-activity.handler';
import { ReactivateActivityHandler } from './application/commands/reactivate-activity/reactivate-activity.handler';
import { SoftDeleteActivityHandler } from './application/commands/soft-delete-activity/soft-delete-activity.handler';
import { RestoreActivityHandler } from './application/commands/restore-activity/restore-activity.handler';
import { PermanentDeleteActivityHandler } from './application/commands/permanent-delete-activity/permanent-delete-activity.handler';
import { GetActivityListHandler } from './application/queries/get-activity-list/get-activity-list.handler';
import { GetActivityByIdHandler } from './application/queries/get-activity-by-id/get-activity-by-id.handler';
import { GetActivitiesByEntityHandler } from './application/queries/get-activities-by-entity/get-activities-by-entity.handler';
import { GetActivityStatsHandler } from './application/queries/get-activity-stats/get-activity-stats.handler';

const CommandHandlers = [
  CreateActivityHandler, UpdateActivityHandler, CompleteActivityHandler, DeleteActivityHandler,
  DeactivateActivityHandler, ReactivateActivityHandler,
  SoftDeleteActivityHandler, RestoreActivityHandler, PermanentDeleteActivityHandler,
];
const QueryHandlers = [GetActivityListHandler, GetActivityByIdHandler, GetActivitiesByEntityHandler, GetActivityStatsHandler];

@Module({
  imports: [CqrsModule, TableConfigModule, NotificationsModule],
  controllers: [ActivityController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class ActivitiesModule {}
