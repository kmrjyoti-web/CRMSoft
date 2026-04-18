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
var GetActivityHeatmapHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetActivityHeatmapHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_activity_heatmap_query_1 = require("./get-activity-heatmap.query");
const activity_analytics_service_1 = require("../../../services/activity-analytics.service");
let GetActivityHeatmapHandler = GetActivityHeatmapHandler_1 = class GetActivityHeatmapHandler {
    constructor(activityAnalytics) {
        this.activityAnalytics = activityAnalytics;
        this.logger = new common_1.Logger(GetActivityHeatmapHandler_1.name);
    }
    async execute(query) {
        try {
            return this.activityAnalytics.getActivityHeatmap({
                dateFrom: query.dateFrom, dateTo: query.dateTo,
                userId: query.userId, activityType: query.activityType,
            });
        }
        catch (error) {
            this.logger.error(`GetActivityHeatmapHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetActivityHeatmapHandler = GetActivityHeatmapHandler;
exports.GetActivityHeatmapHandler = GetActivityHeatmapHandler = GetActivityHeatmapHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_activity_heatmap_query_1.GetActivityHeatmapQuery),
    __metadata("design:paramtypes", [activity_analytics_service_1.ActivityAnalyticsService])
], GetActivityHeatmapHandler);
//# sourceMappingURL=get-activity-heatmap.handler.js.map