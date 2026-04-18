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
var GetQuotationAnalyticsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetQuotationAnalyticsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_quotation_analytics_query_1 = require("./get-quotation-analytics.query");
const quotation_analytics_service_1 = require("../../../services/quotation-analytics.service");
let GetQuotationAnalyticsHandler = GetQuotationAnalyticsHandler_1 = class GetQuotationAnalyticsHandler {
    constructor(analytics) {
        this.analytics = analytics;
        this.logger = new common_1.Logger(GetQuotationAnalyticsHandler_1.name);
    }
    async execute(query) {
        try {
            if (query.type === 'conversion') {
                return this.analytics.getConversionFunnel({ dateFrom: query.dateFrom, dateTo: query.dateTo });
            }
            return this.analytics.getOverview({ dateFrom: query.dateFrom, dateTo: query.dateTo, userId: query.userId });
        }
        catch (error) {
            this.logger.error(`GetQuotationAnalyticsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetQuotationAnalyticsHandler = GetQuotationAnalyticsHandler;
exports.GetQuotationAnalyticsHandler = GetQuotationAnalyticsHandler = GetQuotationAnalyticsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_quotation_analytics_query_1.GetQuotationAnalyticsQuery),
    __metadata("design:paramtypes", [quotation_analytics_service_1.QuotationAnalyticsService])
], GetQuotationAnalyticsHandler);
//# sourceMappingURL=get-quotation-analytics.handler.js.map