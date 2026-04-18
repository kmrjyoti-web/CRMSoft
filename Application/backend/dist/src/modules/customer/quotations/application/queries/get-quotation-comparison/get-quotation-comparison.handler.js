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
var GetQuotationComparisonHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetQuotationComparisonHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_quotation_comparison_query_1 = require("./get-quotation-comparison.query");
const quotation_analytics_service_1 = require("../../../services/quotation-analytics.service");
let GetQuotationComparisonHandler = GetQuotationComparisonHandler_1 = class GetQuotationComparisonHandler {
    constructor(analytics) {
        this.analytics = analytics;
        this.logger = new common_1.Logger(GetQuotationComparisonHandler_1.name);
    }
    async execute(query) {
        try {
            return this.analytics.compareQuotations(query.ids);
        }
        catch (error) {
            this.logger.error(`GetQuotationComparisonHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetQuotationComparisonHandler = GetQuotationComparisonHandler;
exports.GetQuotationComparisonHandler = GetQuotationComparisonHandler = GetQuotationComparisonHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_quotation_comparison_query_1.GetQuotationComparisonQuery),
    __metadata("design:paramtypes", [quotation_analytics_service_1.QuotationAnalyticsService])
], GetQuotationComparisonHandler);
//# sourceMappingURL=get-quotation-comparison.handler.js.map