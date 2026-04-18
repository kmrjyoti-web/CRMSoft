"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowUpsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const follow_up_controller_1 = require("./presentation/follow-up.controller");
const create_follow_up_handler_1 = require("./application/commands/create-follow-up/create-follow-up.handler");
const update_follow_up_handler_1 = require("./application/commands/update-follow-up/update-follow-up.handler");
const complete_follow_up_handler_1 = require("./application/commands/complete-follow-up/complete-follow-up.handler");
const snooze_follow_up_handler_1 = require("./application/commands/snooze-follow-up/snooze-follow-up.handler");
const reassign_follow_up_handler_1 = require("./application/commands/reassign-follow-up/reassign-follow-up.handler");
const delete_follow_up_handler_1 = require("./application/commands/delete-follow-up/delete-follow-up.handler");
const get_follow_up_list_handler_1 = require("./application/queries/get-follow-up-list/get-follow-up-list.handler");
const get_follow_up_by_id_handler_1 = require("./application/queries/get-follow-up-by-id/get-follow-up-by-id.handler");
const get_overdue_follow_ups_handler_1 = require("./application/queries/get-overdue-follow-ups/get-overdue-follow-ups.handler");
const get_follow_up_stats_handler_1 = require("./application/queries/get-follow-up-stats/get-follow-up-stats.handler");
const overdue_checker_service_1 = require("./application/services/overdue-checker.service");
const CommandHandlers = [
    create_follow_up_handler_1.CreateFollowUpHandler, update_follow_up_handler_1.UpdateFollowUpHandler, complete_follow_up_handler_1.CompleteFollowUpHandler,
    snooze_follow_up_handler_1.SnoozeFollowUpHandler, reassign_follow_up_handler_1.ReassignFollowUpHandler, delete_follow_up_handler_1.DeleteFollowUpHandler,
];
const QueryHandlers = [get_follow_up_list_handler_1.GetFollowUpListHandler, get_follow_up_by_id_handler_1.GetFollowUpByIdHandler, get_overdue_follow_ups_handler_1.GetOverdueFollowUpsHandler, get_follow_up_stats_handler_1.GetFollowUpStatsHandler];
let FollowUpsModule = class FollowUpsModule {
};
exports.FollowUpsModule = FollowUpsModule;
exports.FollowUpsModule = FollowUpsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [follow_up_controller_1.FollowUpController],
        providers: [...CommandHandlers, ...QueryHandlers, overdue_checker_service_1.OverdueCheckerService],
    })
], FollowUpsModule);
//# sourceMappingURL=follow-ups.module.js.map