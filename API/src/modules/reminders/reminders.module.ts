import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ReminderController } from './presentation/reminder.controller';
import { CreateReminderHandler } from './application/commands/create-reminder/create-reminder.handler';
import { DismissReminderHandler } from './application/commands/dismiss-reminder/dismiss-reminder.handler';
import { SnoozeReminderHandler } from './application/commands/snooze-reminder/snooze-reminder.handler';
import { CancelReminderHandler } from './application/commands/cancel-reminder/cancel-reminder.handler';
import { AcknowledgeReminderHandler } from './application/commands/acknowledge-reminder/acknowledge-reminder.handler';
import { GetReminderListHandler } from './application/queries/get-reminder-list/get-reminder-list.handler';
import { GetPendingRemindersHandler } from './application/queries/get-pending-reminders/get-pending-reminders.handler';
import { GetReminderStatsHandler } from './application/queries/get-reminder-stats/get-reminder-stats.handler';
import { GetManagerReminderStatsHandler } from './application/queries/get-manager-reminder-stats/get-manager-reminder-stats.handler';
import { ReminderProcessorService } from './application/services/reminder-processor.service';

const CommandHandlers = [CreateReminderHandler, DismissReminderHandler, SnoozeReminderHandler, CancelReminderHandler, AcknowledgeReminderHandler];
const QueryHandlers = [GetReminderListHandler, GetPendingRemindersHandler, GetReminderStatsHandler, GetManagerReminderStatsHandler];

@Module({
  imports: [CqrsModule],
  controllers: [ReminderController],
  providers: [...CommandHandlers, ...QueryHandlers, ReminderProcessorService],
  exports: [ReminderProcessorService],
})
export class RemindersModule {}
