"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitiesModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const table_config_module_1 = require("../../softwarevendor/table-config/table-config.module");
const notifications_module_1 = require("../../core/work/notifications/notifications.module");
const activity_controller_1 = require("./presentation/activity.controller");
const create_activity_handler_1 = require("./application/commands/create-activity/create-activity.handler");
const update_activity_handler_1 = require("./application/commands/update-activity/update-activity.handler");
const complete_activity_handler_1 = require("./application/commands/complete-activity/complete-activity.handler");
const delete_activity_handler_1 = require("./application/commands/delete-activity/delete-activity.handler");
const deactivate_activity_handler_1 = require("./application/commands/deactivate-activity/deactivate-activity.handler");
const reactivate_activity_handler_1 = require("./application/commands/reactivate-activity/reactivate-activity.handler");
const soft_delete_activity_handler_1 = require("./application/commands/soft-delete-activity/soft-delete-activity.handler");
const restore_activity_handler_1 = require("./application/commands/restore-activity/restore-activity.handler");
const permanent_delete_activity_handler_1 = require("./application/commands/permanent-delete-activity/permanent-delete-activity.handler");
const get_activity_list_handler_1 = require("./application/queries/get-activity-list/get-activity-list.handler");
const get_activity_by_id_handler_1 = require("./application/queries/get-activity-by-id/get-activity-by-id.handler");
const get_activities_by_entity_handler_1 = require("./application/queries/get-activities-by-entity/get-activities-by-entity.handler");
const get_activity_stats_handler_1 = require("./application/queries/get-activity-stats/get-activity-stats.handler");
const CommandHandlers = [
    create_activity_handler_1.CreateActivityHandler, update_activity_handler_1.UpdateActivityHandler, complete_activity_handler_1.CompleteActivityHandler, delete_activity_handler_1.DeleteActivityHandler,
    deactivate_activity_handler_1.DeactivateActivityHandler, reactivate_activity_handler_1.ReactivateActivityHandler,
    soft_delete_activity_handler_1.SoftDeleteActivityHandler, restore_activity_handler_1.RestoreActivityHandler, permanent_delete_activity_handler_1.PermanentDeleteActivityHandler,
];
const QueryHandlers = [get_activity_list_handler_1.GetActivityListHandler, get_activity_by_id_handler_1.GetActivityByIdHandler, get_activities_by_entity_handler_1.GetActivitiesByEntityHandler, get_activity_stats_handler_1.GetActivityStatsHandler];
let ActivitiesModule = class ActivitiesModule {
};
exports.ActivitiesModule = ActivitiesModule;
exports.ActivitiesModule = ActivitiesModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, table_config_module_1.TableConfigModule, notifications_module_1.NotificationsModule],
        controllers: [activity_controller_1.ActivityController],
        providers: [...CommandHandlers, ...QueryHandlers],
    })
], ActivitiesModule);
//# sourceMappingURL=activities.module.js.map