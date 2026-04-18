"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const performance_controller_1 = require("./presentation/performance.controller");
const create_target_handler_1 = require("./application/commands/create-target/create-target.handler");
const update_target_handler_1 = require("./application/commands/update-target/update-target.handler");
const delete_target_handler_1 = require("./application/commands/delete-target/delete-target.handler");
const list_targets_handler_1 = require("./application/queries/list-targets/list-targets.handler");
const get_target_handler_1 = require("./application/queries/get-target/get-target.handler");
const get_leaderboard_handler_1 = require("./application/queries/get-leaderboard/get-leaderboard.handler");
const get_team_performance_handler_1 = require("./application/queries/get-team-performance/get-team-performance.handler");
const CommandHandlers = [create_target_handler_1.CreateTargetHandler, update_target_handler_1.UpdateTargetHandler, delete_target_handler_1.DeleteTargetHandler];
const QueryHandlers = [list_targets_handler_1.ListTargetsHandler, get_target_handler_1.GetTargetHandler, get_leaderboard_handler_1.GetLeaderboardHandler, get_team_performance_handler_1.GetTeamPerformanceHandler];
let PerformanceModule = class PerformanceModule {
};
exports.PerformanceModule = PerformanceModule;
exports.PerformanceModule = PerformanceModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [performance_controller_1.PerformanceController],
        providers: [...CommandHandlers, ...QueryHandlers],
    })
], PerformanceModule);
//# sourceMappingURL=performance.module.js.map