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
var GetProductAnalyticsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProductAnalyticsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_product_analytics_query_1 = require("./get-product-analytics.query");
const quotation_analytics_service_1 = require("../../../services/quotation-analytics.service");
let GetProductAnalyticsHandler = GetProductAnalyticsHandler_1 = class GetProductAnalyticsHandler {
    constructor(analytics) {
        this.analytics = analytics;
        this.logger = new common_1.Logger(GetProductAnalyticsHandler_1.name);
    }
    async execute(query) {
        try {
            return this.analytics.getProductAnalysis({ dateFrom: query.dateFrom, dateTo: query.dateTo });
        }
        catch (error) {
            this.logger.error(`GetProductAnalyticsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetProductAnalyticsHandler = GetProductAnalyticsHandler;
exports.GetProductAnalyticsHandler = GetProductAnalyticsHandler = GetProductAnalyticsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_product_analytics_query_1.GetProductAnalyticsQuery),
    __metadata("design:paramtypes", [quotation_analytics_service_1.QuotationAnalyticsService])
], GetProductAnalyticsHandler);
//# sourceMappingURL=get-product-analytics.handler.js.map