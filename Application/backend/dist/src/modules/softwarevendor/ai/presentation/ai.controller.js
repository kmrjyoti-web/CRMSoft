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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const ai_unified_service_1 = require("../services/ai-unified.service");
const ai_settings_service_1 = require("../services/ai-settings.service");
const ai_usage_service_1 = require("../services/ai-usage.service");
const ai_models_config_1 = require("../ai-models.config");
const ai_dto_1 = require("./dto/ai.dto");
let AiController = class AiController {
    constructor(aiService, settingsService, usageService) {
        this.aiService = aiService;
        this.settingsService = settingsService;
        this.usageService = usageService;
    }
    async generate(dto, userId, tenantId) {
        const content = await this.aiService.generate(tenantId, userId, dto);
        return api_response_1.ApiResponse.success({ content }, 'Content generated');
    }
    async improve(dto, userId, tenantId) {
        const content = await this.aiService.improve(tenantId, userId, dto);
        return api_response_1.ApiResponse.success({ content }, 'Text improved');
    }
    async translate(dto, userId, tenantId) {
        const content = await this.aiService.translate(tenantId, userId, dto);
        return api_response_1.ApiResponse.success({ content }, 'Text translated');
    }
    async summarize(dto, userId, tenantId) {
        const content = await this.aiService.summarize(tenantId, userId, dto);
        return api_response_1.ApiResponse.success({ content }, 'Text summarized');
    }
    async changeTone(dto, userId, tenantId) {
        const content = await this.aiService.changeTone(tenantId, userId, dto);
        return api_response_1.ApiResponse.success({ content }, 'Tone changed');
    }
    async getSettings(tenantId) {
        const settings = await this.settingsService.get(tenantId);
        return api_response_1.ApiResponse.success(settings, 'AI settings retrieved');
    }
    async updateSettings(dto, tenantId) {
        const settings = await this.settingsService.update(tenantId, dto);
        return api_response_1.ApiResponse.success(settings, 'AI settings updated');
    }
    async getUsage(tenantId) {
        const stats = await this.usageService.getUsageStats(tenantId);
        return api_response_1.ApiResponse.success(stats, 'Usage stats retrieved');
    }
    async getModels() {
        return api_response_1.ApiResponse.success({ models: ai_models_config_1.AI_MODELS, suggestions: ai_models_config_1.MODEL_SUGGESTIONS }, 'Available models retrieved');
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.GenerateContentDto, String, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generate", null);
__decorate([
    (0, common_1.Post)('improve'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.ImproveTextDto, String, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "improve", null);
__decorate([
    (0, common_1.Post)('translate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.TranslateTextDto, String, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "translate", null);
__decorate([
    (0, common_1.Post)('summarize'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.SummarizeTextDto, String, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "summarize", null);
__decorate([
    (0, common_1.Post)('tone'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.ChangeToneDto, String, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "changeTone", null);
__decorate([
    (0, common_1.Get)('settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_dto_1.UpdateAiSettingsDto, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Get)('usage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getUsage", null);
__decorate([
    (0, common_1.Get)('models'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getModels", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_unified_service_1.AiUnifiedService,
        ai_settings_service_1.AiSettingsService,
        ai_usage_service_1.AiUsageService])
], AiController);
//# sourceMappingURL=ai.controller.js.map