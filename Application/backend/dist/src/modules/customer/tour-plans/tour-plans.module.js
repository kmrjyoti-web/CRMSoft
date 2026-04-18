"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourPlansModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const tour_plan_controller_1 = require("./presentation/tour-plan.controller");
const create_tour_plan_handler_1 = require("./application/commands/create-tour-plan/create-tour-plan.handler");
const update_tour_plan_handler_1 = require("./application/commands/update-tour-plan/update-tour-plan.handler");
const submit_tour_plan_handler_1 = require("./application/commands/submit-tour-plan/submit-tour-plan.handler");
const approve_tour_plan_handler_1 = require("./application/commands/approve-tour-plan/approve-tour-plan.handler");
const reject_tour_plan_handler_1 = require("./application/commands/reject-tour-plan/reject-tour-plan.handler");
const check_in_visit_handler_1 = require("./application/commands/check-in-visit/check-in-visit.handler");
const check_out_visit_handler_1 = require("./application/commands/check-out-visit/check-out-visit.handler");
const cancel_tour_plan_handler_1 = require("./application/commands/cancel-tour-plan/cancel-tour-plan.handler");
const get_tour_plan_list_handler_1 = require("./application/queries/get-tour-plan-list/get-tour-plan-list.handler");
const get_tour_plan_by_id_handler_1 = require("./application/queries/get-tour-plan-by-id/get-tour-plan-by-id.handler");
const get_tour_plan_stats_handler_1 = require("./application/queries/get-tour-plan-stats/get-tour-plan-stats.handler");
const CommandHandlers = [
    create_tour_plan_handler_1.CreateTourPlanHandler, update_tour_plan_handler_1.UpdateTourPlanHandler, submit_tour_plan_handler_1.SubmitTourPlanHandler,
    approve_tour_plan_handler_1.ApproveTourPlanHandler, reject_tour_plan_handler_1.RejectTourPlanHandler,
    check_in_visit_handler_1.CheckInVisitHandler, check_out_visit_handler_1.CheckOutVisitHandler, cancel_tour_plan_handler_1.CancelTourPlanHandler,
];
const QueryHandlers = [get_tour_plan_list_handler_1.GetTourPlanListHandler, get_tour_plan_by_id_handler_1.GetTourPlanByIdHandler, get_tour_plan_stats_handler_1.GetTourPlanStatsHandler];
let TourPlansModule = class TourPlansModule {
};
exports.TourPlansModule = TourPlansModule;
exports.TourPlansModule = TourPlansModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [tour_plan_controller_1.TourPlanController],
        providers: [...CommandHandlers, ...QueryHandlers],
    })
], TourPlansModule);
//# sourceMappingURL=tour-plans.module.js.map