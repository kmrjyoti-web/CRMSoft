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
exports.WorkflowAiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const api_response_1 = require("../../../../common/utils/api-response");
const workflow_ai_service_1 = require("../services/workflow-ai.service");
class GenerateFromPromptDto {
}
let WorkflowAiController = class WorkflowAiController {
    constructor(workflowAiService) {
        this.workflowAiService = workflowAiService;
    }
    generate(dto) {
        const result = this.workflowAiService.generateFromPrompt(dto.prompt, dto.context);
        return api_response_1.ApiResponse.success(result, 'Workflow generated from prompt');
    }
};
exports.WorkflowAiController = WorkflowAiController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Generate workflow nodes from natural language prompt' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateFromPromptDto]),
    __metadata("design:returntype", void 0)
], WorkflowAiController.prototype, "generate", null);
exports.WorkflowAiController = WorkflowAiController = __decorate([
    (0, swagger_1.ApiTags)('Workflows - AI'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('workflow-admin/ai'),
    __metadata("design:paramtypes", [workflow_ai_service_1.WorkflowAiService])
], WorkflowAiController);
//# sourceMappingURL=workflow-ai.controller.js.map