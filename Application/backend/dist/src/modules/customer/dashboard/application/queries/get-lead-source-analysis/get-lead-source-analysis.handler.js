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
var GetLeadSourceAnalysisHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLeadSourceAnalysisHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_lead_source_analysis_query_1 = require("./get-lead-source-analysis.query");
const revenue_analytics_service_1 = require("../../../services/revenue-analytics.service");
let GetLeadSourceAnalysisHandler = GetLeadSourceAnalysisHandler_1 = class GetLeadSourceAnalysisHandler {
    constructor(revenueAnalytics) {
        this.revenueAnalytics = revenueAnalytics;
        this.logger = new common_1.Logger(GetLeadSourceAnalysisHandler_1.name);
    }
    async execute(query) {
        try {
            return this.revenueAnalytics.getLeadSourceAnalysis({ dateFrom: query.dateFrom, dateTo: query.dateTo });
        }
        catch (error) {
            this.logger.error(`GetLeadSourceAnalysisHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetLeadSourceAnalysisHandler = GetLeadSourceAnalysisHandler;
exports.GetLeadSourceAnalysisHandler = GetLeadSourceAnalysisHandler = GetLeadSourceAnalysisHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_lead_source_analysis_query_1.GetLeadSourceAnalysisQuery),
    __metadata("design:paramtypes", [revenue_analytics_service_1.RevenueAnalyticsService])
], GetLeadSourceAnalysisHandler);
//# sourceMappingURL=get-lead-source-analysis.handler.js.map