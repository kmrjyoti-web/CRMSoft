import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ReminderController } from './presentation/reminder.controller';
import { CreateReminderHandler } from './application/commands/create-reminder/create-reminder.handler';
import { DismissReminderHandler } from './application/commands/dismiss-reminder/dismiss-reminder.handler';
import { GetReminderListHandler } from './application/queries/get-reminder-list/get-reminder-list.handler';
import { GetPendingRemindersHandler } from './application/queries/get-pending-reminders/get-pending-reminders.handler';
import { GetReminderStatsHandler } from './application/queries/get-reminder-stats/get-reminder-stats.handler';
import { ReminderProcessorService } from './application/services/reminder-processor.service';

const CommandHandlers = [CreateReminderHandler, DismissReminderHandler];
const QueryHandlers = [GetReminderListHandler, GetPendingRemindersHandler, GetReminderStatsHandler];

@Module({
  imports: [CqrsModule],
  controllers: [ReminderController],
  providers: [...CommandHandlers, ...QueryHandlers, ReminderProcessorService],
})
export class RemindersModule {}
