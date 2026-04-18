"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarModule = void 0;
const common_1 = require("@nestjs/common");
const tasks_module_1 = require("../../customer/tasks/tasks.module");
const notifications_module_1 = require("../../core/work/notifications/notifications.module");
const calendar_controller_1 = require("./presentation/calendar.controller");
const calendar_events_controller_1 = require("./presentation/calendar-events.controller");
const calendar_availability_controller_1 = require("./presentation/calendar-availability.controller");
const calendar_sync_controller_1 = require("./presentation/calendar-sync.controller");
const calendar_ical_controller_1 = require("./presentation/calendar-ical.controller");
const calendar_admin_controller_1 = require("./presentation/calendar-admin.controller");
const calendar_service_1 = require("./calendar.service");
const calendar_sync_service_1 = require("./calendar-sync.service");
const unified_calendar_service_1 = require("./services/unified-calendar.service");
const calendar_visibility_service_1 = require("./services/calendar-visibility.service");
const scheduling_service_1 = require("./services/scheduling.service");
const availability_service_1 = require("./services/availability.service");
const ical_service_1 = require("./services/ical.service");
const calendar_config_service_1 = require("./services/calendar-config.service");
const google_calendar_adapter_1 = require("./adapters/google-calendar.adapter");
const outlook_calendar_adapter_1 = require("./adapters/outlook-calendar.adapter");
let CalendarModule = class CalendarModule {
};
exports.CalendarModule = CalendarModule;
exports.CalendarModule = CalendarModule = __decorate([
    (0, common_1.Module)({
        imports: [tasks_module_1.TasksModule, notifications_module_1.NotificationsModule],
        controllers: [
            calendar_controller_1.CalendarController,
            calendar_events_controller_1.CalendarEventsController,
            calendar_availability_controller_1.CalendarAvailabilityController,
            calendar_sync_controller_1.CalendarSyncController,
            calendar_ical_controller_1.CalendarICalController,
            calendar_admin_controller_1.CalendarAdminController,
        ],
        providers: [
            calendar_service_1.CalendarService,
            calendar_sync_service_1.CalendarSyncService,
            unified_calendar_service_1.UnifiedCalendarService,
            calendar_visibility_service_1.CalendarVisibilityService,
            scheduling_service_1.SchedulingService,
            availability_service_1.AvailabilityService,
            ical_service_1.ICalService,
            calendar_config_service_1.CalendarConfigService,
            google_calendar_adapter_1.GoogleCalendarAdapter,
            outlook_calendar_adapter_1.OutlookCalendarAdapter,
        ],
        exports: [
            calendar_service_1.CalendarService,
            calendar_sync_service_1.CalendarSyncService,
            unified_calendar_service_1.UnifiedCalendarService,
            scheduling_service_1.SchedulingService,
            availability_service_1.AvailabilityService,
        ],
    })
], CalendarModule);
//# sourceMappingURL=calendar.module.js.map