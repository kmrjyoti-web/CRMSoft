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
exports.QuotationAiController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const passport_1 = require("@nestjs/passport");
const api_response_1 = require("../../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const ai_generate_dto_1 = require("./dto/ai-generate.dto");
const get_prediction_matrix_query_1 = require("../application/queries/get-prediction-matrix/get-prediction-matrix.query");
const ai_generate_quotation_command_1 = require("../application/commands/ai-generate-quotation/ai-generate-quotation.command");
const quotation_prediction_service_1 = require("../services/quotation-prediction.service");
let QuotationAiController = class QuotationAiController {
    constructor(commandBus, queryBus, prediction) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.prediction = prediction;
    }
    async predict(dto) {
        const result = await this.queryBus.execute(new get_prediction_matrix_query_1.GetPredictionMatrixQuery(dto.leadId));
        return api_response_1.ApiResponse.success(result, 'Prediction generated');
    }
    async generate(dto, user) {
        const result = await this.commandBus.execute(new ai_generate_quotation_command_1.AiGenerateQuotationCommand(dto.leadId, user.id, `${user.firstName} ${user.lastName}`, dto.answers, dto.templateId));
        return api_response_1.ApiResponse.success(result, 'AI quotation generated');
    }
    async getQuestions(leadId) {
        const result = await this.prediction.getQuestions(leadId);
        return api_response_1.ApiResponse.success(result);
    }
};
exports.QuotationAiController = QuotationAiController;
__decorate([
    (0, common_1.Post)('predict'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:read'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_generate_dto_1.AiPredictDto]),
    __metadata("design:returntype", Promise)
], QuotationAiController.prototype, "predict", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_generate_dto_1.AiGenerateDto, Object]),
    __metadata("design:returntype", Promise)
], QuotationAiController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)('questions/:leadId'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:read'),
    __param(0, (0, common_1.Param)('leadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuotationAiController.prototype, "getQuestions", null);
exports.QuotationAiController = QuotationAiController = __decorate([
    (0, common_1.Controller)('quotation-ai'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        quotation_prediction_service_1.QuotationPredictionService])
], QuotationAiController);
//# sourceMappingURL=quotation-ai.controller.js.map