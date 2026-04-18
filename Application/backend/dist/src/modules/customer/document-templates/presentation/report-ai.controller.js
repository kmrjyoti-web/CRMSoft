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
exports.ReportAiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const api_response_1 = require("../../../../common/utils/api-response");
const ai_report_designer_service_1 = require("../services/ai-report-designer.service");
const class_validator_1 = require("class-validator");
class DesignReportDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DesignReportDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DesignReportDto.prototype, "documentType", void 0);
class GenerateFormulaDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateFormulaDto.prototype, "description", void 0);
class FromImageDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FromImageDto.prototype, "imageDescription", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FromImageDto.prototype, "documentType", void 0);
class RefineDesignDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefineDesignDto.prototype, "instruction", void 0);
let ReportAiController = class ReportAiController {
    constructor(aiService) {
        this.aiService = aiService;
    }
    async designReport(dto) {
        const design = await this.aiService.designReport(dto.description, dto.documentType);
        return api_response_1.ApiResponse.success(design, 'Design generated');
    }
    async generateFormula(dto) {
        const formula = await this.aiService.generateFormula(dto.description);
        return api_response_1.ApiResponse.success(formula, 'Formula generated');
    }
    async fromImage(dto) {
        const result = await this.aiService.fromImage(dto.imageDescription, dto.documentType);
        return api_response_1.ApiResponse.success(result, 'Design generated from image');
    }
    async refine(dto) {
        const design = await this.aiService.refineDesign(dto.currentDesign, dto.instruction);
        return api_response_1.ApiResponse.success(design, 'Design refined');
    }
};
exports.ReportAiController = ReportAiController;
__decorate([
    (0, common_1.Post)('design-report'),
    (0, swagger_1.ApiOperation)({ summary: 'AI: Generate canvas layout from description' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DesignReportDto]),
    __metadata("design:returntype", Promise)
], ReportAiController.prototype, "designReport", null);
__decorate([
    (0, common_1.Post)('generate-formula'),
    (0, swagger_1.ApiOperation)({ summary: 'AI: Generate formula from description' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateFormulaDto]),
    __metadata("design:returntype", Promise)
], ReportAiController.prototype, "generateFormula", null);
__decorate([
    (0, common_1.Post)('from-image'),
    (0, swagger_1.ApiOperation)({ summary: 'AI: Generate canvas layout from image' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FromImageDto]),
    __metadata("design:returntype", Promise)
], ReportAiController.prototype, "fromImage", null);
__decorate([
    (0, common_1.Post)('refine'),
    (0, swagger_1.ApiOperation)({ summary: 'AI: Refine existing canvas design' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefineDesignDto]),
    __metadata("design:returntype", Promise)
], ReportAiController.prototype, "refine", null);
exports.ReportAiController = ReportAiController = __decorate([
    (0, swagger_1.ApiTags)('Report AI'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('report-ai'),
    __metadata("design:paramtypes", [ai_report_designer_service_1.AiReportDesignerService])
], ReportAiController);
//# sourceMappingURL=report-ai.controller.js.map