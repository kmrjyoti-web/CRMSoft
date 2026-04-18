"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const reminder_controller_1 = require("./presentation/reminder.controller");
const create_reminder_handler_1 = require("./application/commands/create-reminder/create-reminder.handler");
const dismiss_reminder_handler_1 = require("./application/commands/dismiss-reminder/dismiss-reminder.handler");
const snooze_reminder_handler_1 = require("./application/commands/snooze-reminder/snooze-reminder.handler");
const cancel_reminder_handler_1 = require("./application/commands/cancel-reminder/cancel-reminder.handler");
const acknowledge_reminder_handler_1 = require("./application/commands/acknowledge-reminder/acknowledge-reminder.handler");
const get_reminder_list_handler_1 = require("./application/queries/get-reminder-list/get-reminder-list.handler");
const get_pending_reminders_handler_1 = require("./application/queries/get-pending-reminders/get-pending-reminders.handler");
const get_reminder_stats_handler_1 = require("./application/queries/get-reminder-stats/get-reminder-stats.handler");
const get_manager_reminder_stats_handler_1 = require("./application/queries/get-manager-reminder-stats/get-manager-reminder-stats.handler");
const reminder_processor_service_1 = require("./application/services/reminder-processor.service");
const CommandHandlers = [create_reminder_handler_1.CreateReminderHandler, dismiss_reminder_handler_1.DismissReminderHandler, snooze_reminder_handler_1.SnoozeReminderHandler, cancel_reminder_handler_1.CancelReminderHandler, acknowledge_reminder_handler_1.AcknowledgeReminderHandler];
const QueryHandlers = [get_reminder_list_handler_1.GetReminderListHandler, get_pending_reminders_handler_1.GetPendingRemindersHandler, get_reminder_stats_handler_1.GetReminderStatsHandler, get_manager_reminder_stats_handler_1.GetManagerReminderStatsHandler];
let RemindersModule = class RemindersModule {
};
exports.RemindersModule = RemindersModule;
exports.RemindersModule = RemindersModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [reminder_controller_1.ReminderController],
        providers: [...CommandHandlers, ...QueryHandlers, reminder_processor_service_1.ReminderProcessorService],
        exports: [reminder_processor_service_1.ReminderProcessorService],
    })
], RemindersModule);
//# sourceMappingURL=reminders.module.js.map