"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const quotations_controller_1 = require("./presentation/quotations.controller");
const quotation_analytics_controller_1 = require("./presentation/quotation-analytics.controller");
const quotation_ai_controller_1 = require("./presentation/quotation-ai.controller");
const quotation_templates_controller_1 = require("./presentation/quotation-templates.controller");
const quotation_calculator_service_1 = require("./services/quotation-calculator.service");
const quotation_number_service_1 = require("./services/quotation-number.service");
const quotation_analytics_service_1 = require("./services/quotation-analytics.service");
const quotation_prediction_service_1 = require("./services/quotation-prediction.service");
const quotation_expiry_service_1 = require("./services/quotation-expiry.service");
const create_quotation_handler_1 = require("./application/commands/create-quotation/create-quotation.handler");
const update_quotation_handler_1 = require("./application/commands/update-quotation/update-quotation.handler");
const add_line_item_handler_1 = require("./application/commands/add-line-item/add-line-item.handler");
const update_line_item_handler_1 = require("./application/commands/update-line-item/update-line-item.handler");
const remove_line_item_handler_1 = require("./application/commands/remove-line-item/remove-line-item.handler");
const recalculate_totals_handler_1 = require("./application/commands/recalculate-totals/recalculate-totals.handler");
const send_quotation_handler_1 = require("./application/commands/send-quotation/send-quotation.handler");
const mark_viewed_handler_1 = require("./application/commands/mark-viewed/mark-viewed.handler");
const accept_quotation_handler_1 = require("./application/commands/accept-quotation/accept-quotation.handler");
const reject_quotation_handler_1 = require("./application/commands/reject-quotation/reject-quotation.handler");
const revise_quotation_handler_1 = require("./application/commands/revise-quotation/revise-quotation.handler");
const cancel_quotation_handler_1 = require("./application/commands/cancel-quotation/cancel-quotation.handler");
const clone_quotation_handler_1 = require("./application/commands/clone-quotation/clone-quotation.handler");
const log_negotiation_handler_1 = require("./application/commands/log-negotiation/log-negotiation.handler");
const create_from_template_handler_1 = require("./application/commands/create-from-template/create-from-template.handler");
const ai_generate_quotation_handler_1 = require("./application/commands/ai-generate-quotation/ai-generate-quotation.handler");
const get_quotation_by_id_handler_1 = require("./application/queries/get-quotation-by-id/get-quotation-by-id.handler");
const list_quotations_handler_1 = require("./application/queries/list-quotations/list-quotations.handler");
const get_quotation_timeline_handler_1 = require("./application/queries/get-quotation-timeline/get-quotation-timeline.handler");
const get_quotation_versions_handler_1 = require("./application/queries/get-quotation-versions/get-quotation-versions.handler");
const get_negotiation_history_handler_1 = require("./application/queries/get-negotiation-history/get-negotiation-history.handler");
const get_templates_handler_1 = require("./application/queries/get-templates/get-templates.handler");
const get_quotation_analytics_handler_1 = require("./application/queries/get-quotation-analytics/get-quotation-analytics.handler");
const get_product_analytics_handler_1 = require("./application/queries/get-product-analytics/get-product-analytics.handler");
const get_industry_analytics_handler_1 = require("./application/queries/get-industry-analytics/get-industry-analytics.handler");
const get_best_quotations_handler_1 = require("./application/queries/get-best-quotations/get-best-quotations.handler");
const get_quotation_comparison_handler_1 = require("./application/queries/get-quotation-comparison/get-quotation-comparison.handler");
const get_prediction_matrix_handler_1 = require("./application/queries/get-prediction-matrix/get-prediction-matrix.handler");
const CommandHandlers = [
    create_quotation_handler_1.CreateQuotationHandler, update_quotation_handler_1.UpdateQuotationHandler,
    add_line_item_handler_1.AddLineItemHandler, update_line_item_handler_1.UpdateLineItemHandler, remove_line_item_handler_1.RemoveLineItemHandler,
    recalculate_totals_handler_1.RecalculateTotalsHandler, send_quotation_handler_1.SendQuotationHandler, mark_viewed_handler_1.MarkViewedHandler,
    accept_quotation_handler_1.AcceptQuotationHandler, reject_quotation_handler_1.RejectQuotationHandler, revise_quotation_handler_1.ReviseQuotationHandler,
    cancel_quotation_handler_1.CancelQuotationHandler, clone_quotation_handler_1.CloneQuotationHandler, log_negotiation_handler_1.LogNegotiationHandler,
    create_from_template_handler_1.CreateFromTemplateHandler, ai_generate_quotation_handler_1.AiGenerateQuotationHandler,
];
const QueryHandlers = [
    get_quotation_by_id_handler_1.GetQuotationByIdHandler, list_quotations_handler_1.ListQuotationsHandler,
    get_quotation_timeline_handler_1.GetQuotationTimelineHandler, get_quotation_versions_handler_1.GetQuotationVersionsHandler,
    get_negotiation_history_handler_1.GetNegotiationHistoryHandler, get_templates_handler_1.GetTemplatesHandler,
    get_quotation_analytics_handler_1.GetQuotationAnalyticsHandler, get_product_analytics_handler_1.GetProductAnalyticsHandler,
    get_industry_analytics_handler_1.GetIndustryAnalyticsHandler, get_best_quotations_handler_1.GetBestQuotationsHandler,
    get_quotation_comparison_handler_1.GetQuotationComparisonHandler, get_prediction_matrix_handler_1.GetPredictionMatrixHandler,
];
let QuotationsModule = class QuotationsModule {
};
exports.QuotationsModule = QuotationsModule;
exports.QuotationsModule = QuotationsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [
            quotations_controller_1.QuotationsController,
            quotation_analytics_controller_1.QuotationAnalyticsController,
            quotation_ai_controller_1.QuotationAiController,
            quotation_templates_controller_1.QuotationTemplatesController,
        ],
        providers: [
            quotation_calculator_service_1.QuotationCalculatorService,
            quotation_number_service_1.QuotationNumberService,
            quotation_analytics_service_1.QuotationAnalyticsService,
            quotation_prediction_service_1.QuotationPredictionService,
            quotation_expiry_service_1.QuotationExpiryService,
            ...CommandHandlers,
            ...QueryHandlers,
        ],
        exports: [quotation_calculator_service_1.QuotationCalculatorService, quotation_number_service_1.QuotationNumberService],
    })
], QuotationsModule);
//# sourceMappingURL=quotations.module.js.map