import { Module } from '@nestjs/common';
import { TasksModule } from '../tasks/tasks.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CalendarController } from './presentation/calendar.controller';
import { CalendarEventsController } from './presentation/calendar-events.controller';
import { CalendarAvailabilityController } from './presentation/calendar-availability.controller';
import { CalendarSyncController } from './presentation/calendar-sync.controller';
import { CalendarICalController } from './presentation/calendar-ical.controller';
import { CalendarAdminController } from './presentation/calendar-admin.controller';
import { CalendarService } from './calendar.service';
import { CalendarSyncService } from './calendar-sync.service';
import { UnifiedCalendarService } from './services/unified-calendar.service';
import { CalendarVisibilityService } from './services/calendar-visibility.service';
import { SchedulingService } from './services/scheduling.service';
import { AvailabilityService } from './services/availability.service';
import { ICalService } from './services/ical.service';
import { CalendarConfigService } from './services/calendar-config.service';
import { GoogleCalendarAdapter } from './adapters/google-calendar.adapter';
import { OutlookCalendarAdapter } from './adapters/outlook-calendar.adapter';

@Module({
  imports: [TasksModule, NotificationsModule],
  controllers: [
    CalendarController,
    CalendarEventsController,
    CalendarAvailabilityController,
    CalendarSyncController,
    CalendarICalController,
    CalendarAdminController,
  ],
  providers: [
    CalendarService,
    CalendarSyncService,
    UnifiedCalendarService,
    CalendarVisibilityService,
    SchedulingService,
    AvailabilityService,
    ICalService,
    CalendarConfigService,
    GoogleCalendarAdapter,
    OutlookCalendarAdapter,
  ],
  exports: [
    CalendarService,
    CalendarSyncService,
    UnifiedCalendarService,
    SchedulingService,
    AvailabilityService,
  ],
})
export class CalendarModule {}
