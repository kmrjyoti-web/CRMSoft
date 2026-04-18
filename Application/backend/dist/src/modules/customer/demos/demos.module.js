"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemosModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const demo_controller_1 = require("./presentation/demo.controller");
const create_demo_handler_1 = require("./application/commands/create-demo/create-demo.handler");
const update_demo_handler_1 = require("./application/commands/update-demo/update-demo.handler");
const reschedule_demo_handler_1 = require("./application/commands/reschedule-demo/reschedule-demo.handler");
const complete_demo_handler_1 = require("./application/commands/complete-demo/complete-demo.handler");
const cancel_demo_handler_1 = require("./application/commands/cancel-demo/cancel-demo.handler");
const get_demo_list_handler_1 = require("./application/queries/get-demo-list/get-demo-list.handler");
const get_demo_by_id_handler_1 = require("./application/queries/get-demo-by-id/get-demo-by-id.handler");
const get_demos_by_lead_handler_1 = require("./application/queries/get-demos-by-lead/get-demos-by-lead.handler");
const get_demo_stats_handler_1 = require("./application/queries/get-demo-stats/get-demo-stats.handler");
const CommandHandlers = [create_demo_handler_1.CreateDemoHandler, update_demo_handler_1.UpdateDemoHandler, reschedule_demo_handler_1.RescheduleDemoHandler, complete_demo_handler_1.CompleteDemoHandler, cancel_demo_handler_1.CancelDemoHandler];
const QueryHandlers = [get_demo_list_handler_1.GetDemoListHandler, get_demo_by_id_handler_1.GetDemoByIdHandler, get_demos_by_lead_handler_1.GetDemosByLeadHandler, get_demo_stats_handler_1.GetDemoStatsHandler];
let DemosModule = class DemosModule {
};
exports.DemosModule = DemosModule;
exports.DemosModule = DemosModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [demo_controller_1.DemoController],
        providers: [...CommandHandlers, ...QueryHandlers],
    })
], DemosModule);
//# sourceMappingURL=demos.module.js.map