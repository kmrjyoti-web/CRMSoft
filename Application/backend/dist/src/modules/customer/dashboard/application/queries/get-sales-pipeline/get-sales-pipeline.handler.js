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
var GetSalesPipelineHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSalesPipelineHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_sales_pipeline_query_1 = require("./get-sales-pipeline.query");
const pipeline_service_1 = require("../../../services/pipeline.service");
let GetSalesPipelineHandler = GetSalesPipelineHandler_1 = class GetSalesPipelineHandler {
    constructor(pipelineService) {
        this.pipelineService = pipelineService;
        this.logger = new common_1.Logger(GetSalesPipelineHandler_1.name);
    }
    async execute(query) {
        try {
            return this.pipelineService.getSalesPipeline({
                dateFrom: query.dateFrom, dateTo: query.dateTo, userId: query.userId,
            });
        }
        catch (error) {
            this.logger.error(`GetSalesPipelineHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetSalesPipelineHandler = GetSalesPipelineHandler;
exports.GetSalesPipelineHandler = GetSalesPipelineHandler = GetSalesPipelineHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_sales_pipeline_query_1.GetSalesPipelineQuery),
    __metadata("design:paramtypes", [pipeline_service_1.PipelineService])
], GetSalesPipelineHandler);
//# sourceMappingURL=get-sales-pipeline.handler.js.map