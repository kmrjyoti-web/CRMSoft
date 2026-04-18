"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GetMyDashboardHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMyDashboardHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_my_dashboard_query_1 = require("./get-my-dashboard.query");
const dashboard_aggregator_service_1 = require("../../../services/dashboard-aggregator.service");
let GetMyDashboardHandler = GetMyDashboardHandler_1 = class GetMyDashboardHandler {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
        this.logger = new common_1.Logger(GetMyDashboardHandler_1.name);
    }
    async execute(query) {
        try {
            return this.dashboardService.getMyDashboard(query.userId);
        }
        catch (error) {
            this.logger.error(`GetMyDashboardHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetMyDashboardHandler = GetMyDashboardHandler;
exports.GetMyDashboardHandler = GetMyDashboardHandler = GetMyDashboardHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_my_dashboard_query_1.GetMyDashboardQuery),
    __metadata("design:paramtypes", [dashboard_aggregator_service_1.DashboardAggregatorService])
], GetMyDashboardHandler);
//# sourceMappingURL=get-my-dashboard.handler.js.map