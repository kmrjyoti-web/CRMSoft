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
var GetExecutiveDashboardHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetExecutiveDashboardHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_executive_dashboard_query_1 = require("./get-executive-dashboard.query");
const dashboard_aggregator_service_1 = require("../../../services/dashboard-aggregator.service");
let GetExecutiveDashboardHandler = GetExecutiveDashboardHandler_1 = class GetExecutiveDashboardHandler {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
        this.logger = new common_1.Logger(GetExecutiveDashboardHandler_1.name);
    }
    async execute(query) {
        try {
            return this.dashboardService.getExecutiveDashboard({
                dateFrom: query.dateFrom, dateTo: query.dateTo, userId: query.userId,
            });
        }
        catch (error) {
            this.logger.error(`GetExecutiveDashboardHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetExecutiveDashboardHandler = GetExecutiveDashboardHandler;
exports.GetExecutiveDashboardHandler = GetExecutiveDashboardHandler = GetExecutiveDashboardHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_executive_dashboard_query_1.GetExecutiveDashboardQuery),
    __metadata("design:paramtypes", [dashboard_aggregator_service_1.DashboardAggregatorService])
], GetExecutiveDashboardHandler);
//# sourceMappingURL=get-executive-dashboard.handler.js.map