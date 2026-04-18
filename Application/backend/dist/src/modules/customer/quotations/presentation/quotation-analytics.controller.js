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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const passport_1 = require("@nestjs/passport");
const api_response_1 = require("../../../../common/utils/api-response");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const quotation_query_dto_1 = require("./dto/quotation-query.dto");
const get_quotation_analytics_query_1 = require("../application/queries/get-quotation-analytics/get-quotation-analytics.query");
const get_industry_analytics_query_1 = require("../application/queries/get-industry-analytics/get-industry-analytics.query");
const get_product_analytics_query_1 = require("../application/queries/get-product-analytics/get-product-analytics.query");
const get_best_quotations_query_1 = require("../application/queries/get-best-quotations/get-best-quotations.query");
const get_quotation_comparison_query_1 = require("../application/queries/get-quotation-comparison/get-quotation-comparison.query");
let QuotationAnalyticsController = class QuotationAnalyticsController {
    constructor(queryBus) {
        this.queryBus = queryBus;
    }
    async overview(query) {
        const result = await this.queryBus.execute(new get_quotation_analytics_query_1.GetQuotationAnalyticsQuery('overview', query.dateFrom ? new Date(query.dateFrom) : undefined, query.dateTo ? new Date(query.dateTo) : undefined, query.userId));
        return api_response_1.ApiResponse.success(result);
    }
    async conversion(query) {
        const result = await this.queryBus.execute(new get_quotation_analytics_query_1.GetQuotationAnalyticsQuery('conversion', query.dateFrom ? new Date(query.dateFrom) : undefined, query.dateTo ? new Date(query.dateTo) : undefined));
        return api_response_1.ApiResponse.success(result);
    }
    async industry(query) {
        const result = await this.queryBus.execute(new get_industry_analytics_query_1.GetIndustryAnalyticsQuery(query.dateFrom ? new Date(query.dateFrom) : undefined, query.dateTo ? new Date(query.dateTo) : undefined));
        return api_response_1.ApiResponse.success(result);
    }
    async products(query) {
        const result = await this.queryBus.execute(new get_product_analytics_query_1.GetProductAnalyticsQuery(query.dateFrom ? new Date(query.dateFrom) : undefined, query.dateTo ? new Date(query.dateTo) : undefined));
        return api_response_1.ApiResponse.success(result);
    }
    async bestQuotations(limit) {
        const result = await this.queryBus.execute(new get_best_quotations_query_1.GetBestQuotationsQuery(limit ? parseInt(limit) : undefined));
        return api_response_1.ApiResponse.success(result);
    }
    async comparison(ids) {
        const idList = ids?.split(',').filter(Boolean) || [];
        const result = await this.queryBus.execute(new get_quotation_comparison_query_1.GetQuotationComparisonQuery(idList));
        return api_response_1.ApiResponse.success(result);
    }
};
exports.QuotationAnalyticsController = QuotationAnalyticsController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quotation_query_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], QuotationAnalyticsController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('conversion'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quotation_query_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], QuotationAnalyticsController.prototype, "conversion", null);
__decorate([
    (0, common_1.Get)('industry'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quotation_query_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], QuotationAnalyticsController.prototype, "industry", null);
__decorate([
    (0, common_1.Get)('products'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quotation_query_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], QuotationAnalyticsController.prototype, "products", null);
__decorate([
    (0, common_1.Get)('best-quotations'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:read'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuotationAnalyticsController.prototype, "bestQuotations", null);
__decorate([
    (0, common_1.Get)('comparison'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:read'),
    __param(0, (0, common_1.Query)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuotationAnalyticsController.prototype, "comparison", null);
exports.QuotationAnalyticsController = QuotationAnalyticsController = __decorate([
    (0, common_1.Controller)('quotation-analytics'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [cqrs_1.QueryBus])
], QuotationAnalyticsController);
//# sourceMappingURL=quotation-analytics.controller.js.map