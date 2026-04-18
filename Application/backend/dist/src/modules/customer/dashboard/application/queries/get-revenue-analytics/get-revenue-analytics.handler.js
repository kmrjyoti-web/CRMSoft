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
var GetRevenueAnalyticsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRevenueAnalyticsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_revenue_analytics_query_1 = require("./get-revenue-analytics.query");
const revenue_analytics_service_1 = require("../../../services/revenue-analytics.service");
let GetRevenueAnalyticsHandler = GetRevenueAnalyticsHandler_1 = class GetRevenueAnalyticsHandler {
    constructor(revenueAnalytics) {
        this.revenueAnalytics = revenueAnalytics;
        this.logger = new common_1.Logger(GetRevenueAnalyticsHandler_1.name);
    }
    async execute(query) {
        try {
            return this.revenueAnalytics.getRevenueAnalytics({
                dateFrom: query.dateFrom, dateTo: query.dateTo, groupBy: query.groupBy,
            });
        }
        catch (error) {
            this.logger.error(`GetRevenueAnalyticsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetRevenueAnalyticsHandler = GetRevenueAnalyticsHandler;
exports.GetRevenueAnalyticsHandler = GetRevenueAnalyticsHandler = GetRevenueAnalyticsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_revenue_analytics_query_1.GetRevenueAnalyticsQuery),
    __metadata("design:paramtypes", [revenue_analytics_service_1.RevenueAnalyticsService])
], GetRevenueAnalyticsHandler);
//# sourceMappingURL=get-revenue-analytics.handler.js.map