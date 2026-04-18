"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationPredictionService = exports.QuotationNumberService = exports.QuotationExpiryService = exports.QuotationCalculatorService = exports.QuotationAnalyticsService = exports.QuotationsModule = void 0;
var quotations_module_1 = require("./quotations.module");
Object.defineProperty(exports, "QuotationsModule", { enumerable: true, get: function () { return quotations_module_1.QuotationsModule; } });
var quotation_analytics_service_1 = require("./services/quotation-analytics.service");
Object.defineProperty(exports, "QuotationAnalyticsService", { enumerable: true, get: function () { return quotation_analytics_service_1.QuotationAnalyticsService; } });
var quotation_calculator_service_1 = require("./services/quotation-calculator.service");
Object.defineProperty(exports, "QuotationCalculatorService", { enumerable: true, get: function () { return quotation_calculator_service_1.QuotationCalculatorService; } });
var quotation_expiry_service_1 = require("./services/quotation-expiry.service");
Object.defineProperty(exports, "QuotationExpiryService", { enumerable: true, get: function () { return quotation_expiry_service_1.QuotationExpiryService; } });
var quotation_number_service_1 = require("./services/quotation-number.service");
Object.defineProperty(exports, "QuotationNumberService", { enumerable: true, get: function () { return quotation_number_service_1.QuotationNumberService; } });
var quotation_prediction_service_1 = require("./services/quotation-prediction.service");
Object.defineProperty(exports, "QuotationPredictionService", { enumerable: true, get: function () { return quotation_prediction_service_1.QuotationPredictionService; } });
//# sourceMappingURL=index.js.map