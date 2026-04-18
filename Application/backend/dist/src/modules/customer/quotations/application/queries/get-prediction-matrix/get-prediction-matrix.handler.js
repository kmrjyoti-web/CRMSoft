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
var GetPredictionMatrixHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPredictionMatrixHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_prediction_matrix_query_1 = require("./get-prediction-matrix.query");
const quotation_prediction_service_1 = require("../../../services/quotation-prediction.service");
let GetPredictionMatrixHandler = GetPredictionMatrixHandler_1 = class GetPredictionMatrixHandler {
    constructor(prediction) {
        this.prediction = prediction;
        this.logger = new common_1.Logger(GetPredictionMatrixHandler_1.name);
    }
    async execute(query) {
        try {
            return this.prediction.predict(query.leadId);
        }
        catch (error) {
            this.logger.error(`GetPredictionMatrixHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetPredictionMatrixHandler = GetPredictionMatrixHandler;
exports.GetPredictionMatrixHandler = GetPredictionMatrixHandler = GetPredictionMatrixHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_prediction_matrix_query_1.GetPredictionMatrixQuery),
    __metadata("design:paramtypes", [quotation_prediction_service_1.QuotationPredictionService])
], GetPredictionMatrixHandler);
//# sourceMappingURL=get-prediction-matrix.handler.js.map