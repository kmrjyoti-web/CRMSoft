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
var GetAgingAnalysisHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAgingAnalysisHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_aging_analysis_query_1 = require("./get-aging-analysis.query");
const revenue_analytics_service_1 = require("../../../services/revenue-analytics.service");
let GetAgingAnalysisHandler = GetAgingAnalysisHandler_1 = class GetAgingAnalysisHandler {
    constructor(revenueAnalytics) {
        this.revenueAnalytics = revenueAnalytics;
        this.logger = new common_1.Logger(GetAgingAnalysisHandler_1.name);
    }
    async execute(query) {
        try {
            return this.revenueAnalytics.getAgingAnalysis({ userId: query.userId });
        }
        catch (error) {
            this.logger.error(`GetAgingAnalysisHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetAgingAnalysisHandler = GetAgingAnalysisHandler;
exports.GetAgingAnalysisHandler = GetAgingAnalysisHandler = GetAgingAnalysisHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_aging_analysis_query_1.GetAgingAnalysisQuery),
    __metadata("design:paramtypes", [revenue_analytics_service_1.RevenueAnalyticsService])
], GetAgingAnalysisHandler);
//# sourceMappingURL=get-aging-analysis.handler.js.map