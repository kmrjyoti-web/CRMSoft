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
exports.SelfHostedAiController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const ollama_service_1 = require("../services/ollama.service");
const ai_training_service_1 = require("../services/ai-training.service");
const ai_chat_service_1 = require("../services/ai-chat.service");
const vector_store_service_1 = require("../services/vector-store.service");
const document_import_service_1 = require("../services/document-import.service");
const self_hosted_ai_dto_1 = require("./dto/self-hosted-ai.dto");
let SelfHostedAiController = class SelfHostedAiController {
    constructor(ollama, training, chat, vectorStore, docImport) {
        this.ollama = ollama;
        this.training = training;
        this.chat = chat;
        this.vectorStore = vectorStore;
        this.docImport = docImport;
    }
    async checkHealth() {
        const status = await this.ollama.checkHealth();
        return api_response_1.ApiResponse.success(status, 'Chat server health check');
    }
    async listLocalModels() {
        const models = await this.ollama.listLocalModels();
        return api_response_1.ApiResponse.success(models, 'Local models retrieved');
    }
    async getModelStatus(tenantId) {
        const models = await this.ollama.getModelStatus(tenantId);
        return api_response_1.ApiResponse.success(models, 'Model status retrieved');
    }
    async pullModel(dto, tenantId) {
        const result = await this.ollama.pullModel(dto.modelName, tenantId);
        return api_response_1.ApiResponse.success(result, 'Model pull initiated');
    }
    async cancelPull(modelId, tenantId) {
        await this.ollama.cancelPull(decodeURIComponent(modelId), tenantId);
        return api_response_1.ApiResponse.success(null, 'Pull cancelled');
    }
    async deleteModel(modelId, tenantId) {
        await this.ollama.deleteModel(decodeURIComponent(modelId), tenantId);
        return api_response_1.ApiResponse.success(null, 'Model deleted');
    }
    async setDefaultModel(dto, tenantId) {
        await this.ollama.setDefaultModel(tenantId, dto.modelId, dto.isEmbedding ?? false);
        return api_response_1.ApiResponse.success(null, 'Default model updated');
    }
    async listDatasets(tenantId, status) {
        const datasets = await this.training.listDatasets(tenantId, status);
        return api_response_1.ApiResponse.success(datasets, 'Datasets retrieved');
    }
    async createDataset(dto, tenantId, userId) {
        const dataset = await this.training.createDataset(tenantId, { ...dto, createdBy: userId });
        return api_response_1.ApiResponse.success(dataset, 'Dataset created');
    }
    async getDataset(id, tenantId) {
        const dataset = await this.training.getDataset(tenantId, id);
        return api_response_1.ApiResponse.success(dataset, 'Dataset retrieved');
    }
    async updateDataset(id, dto, tenantId) {
        await this.training.updateDataset(tenantId, id, dto);
        return api_response_1.ApiResponse.success(null, 'Dataset updated');
    }
    async deleteDataset(id, tenantId) {
        await this.training.deleteDataset(tenantId, id);
        return api_response_1.ApiResponse.success(null, 'Dataset deleted');
    }
    async addDocument(datasetId, dto, tenantId) {
        const doc = await this.training.addDocument(tenantId, datasetId, dto);
        return api_response_1.ApiResponse.success(doc, 'Document added');
    }
    async getDocument(id, tenantId) {
        const doc = await this.training.getDocument(tenantId, id);
        return api_response_1.ApiResponse.success(doc, 'Document retrieved');
    }
    async updateDocument(id, dto, tenantId) {
        await this.training.updateDocument(tenantId, id, dto);
        return api_response_1.ApiResponse.success(null, 'Document updated');
    }
    async deleteDocument(id, tenantId) {
        await this.training.deleteDocument(tenantId, id);
        return api_response_1.ApiResponse.success(null, 'Document deleted');
    }
    async importCrmData(datasetId, dto, tenantId) {
        const result = await this.training.importCrmData(tenantId, datasetId, dto.entityType);
        return api_response_1.ApiResponse.success(result, 'CRM data imported');
    }
    async uploadFile(datasetId, file, tenantId) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const extracted = await this.docImport.extractFromFile(file);
        const doc = await this.training.addDocument(tenantId, datasetId, {
            title: extracted.title,
            content: extracted.content,
            contentType: extracted.contentType,
            metadata: { originalName: file.originalname, fileSize: file.size },
        });
        return api_response_1.ApiResponse.success(doc, `File processed: ${extracted.content.length} characters extracted`);
    }
    async importUrl(datasetId, dto, tenantId) {
        const extracted = await this.docImport.extractFromUrl(dto.url);
        const doc = await this.training.addDocument(tenantId, datasetId, {
            title: dto.title || extracted.title,
            content: extracted.content,
            contentType: 'url',
            sourceUrl: dto.url,
            metadata: { scrapedFrom: dto.url },
        });
        return api_response_1.ApiResponse.success(doc, `URL scraped: ${extracted.content.length} characters extracted`);
    }
    async startTraining(dto, tenantId, userId) {
        const job = await this.training.startTrainingJob(tenantId, { ...dto, createdBy: userId });
        return api_response_1.ApiResponse.success(job, 'Training job started');
    }
    async listTrainingJobs(tenantId, datasetId) {
        const jobs = await this.training.listTrainingJobs(tenantId, datasetId);
        return api_response_1.ApiResponse.success(jobs, 'Training jobs retrieved');
    }
    async getTrainingJob(id, tenantId) {
        const job = await this.training.getTrainingJob(tenantId, id);
        return api_response_1.ApiResponse.success(job, 'Training job retrieved');
    }
    async cancelTrainingJob(id, tenantId) {
        await this.training.cancelTrainingJob(tenantId, id);
        return api_response_1.ApiResponse.success(null, 'Training job cancelled');
    }
    async createSession(dto, tenantId, userId) {
        const session = await this.chat.createSession(tenantId, { ...dto, userId });
        return api_response_1.ApiResponse.success(session, 'Chat session created');
    }
    async listSessions(tenantId, userId) {
        const sessions = await this.chat.listSessions(tenantId, userId);
        return api_response_1.ApiResponse.success(sessions, 'Chat sessions retrieved');
    }
    async getSession(id, tenantId) {
        const session = await this.chat.getSession(tenantId, id);
        return api_response_1.ApiResponse.success(session, 'Chat session retrieved');
    }
    async sendMessage(id, dto, tenantId) {
        const result = await this.chat.sendMessage(tenantId, id, dto.message);
        return api_response_1.ApiResponse.success(result, 'Message sent');
    }
    async deleteSession(id, tenantId) {
        await this.chat.deleteSession(tenantId, id);
        return api_response_1.ApiResponse.success(null, 'Session deleted');
    }
    async quickChat(dto, tenantId) {
        const result = await this.chat.quickChat(tenantId, dto);
        return api_response_1.ApiResponse.success(result, 'Quick chat response');
    }
    async listPrompts(tenantId, category) {
        const prompts = await this.chat.listSystemPrompts(tenantId, category);
        return api_response_1.ApiResponse.success(prompts, 'System prompts retrieved');
    }
    async createPrompt(dto, tenantId, userId) {
        const prompt = await this.chat.createSystemPrompt(tenantId, { ...dto, createdBy: userId });
        return api_response_1.ApiResponse.success(prompt, 'System prompt created');
    }
    async updatePrompt(id, dto, tenantId) {
        const prompt = await this.chat.updateSystemPrompt(tenantId, id, dto);
        return api_response_1.ApiResponse.success(prompt, 'System prompt updated');
    }
    async deletePrompt(id, tenantId) {
        await this.chat.deleteSystemPrompt(tenantId, id);
        return api_response_1.ApiResponse.success(null, 'System prompt deleted');
    }
    async getWidgetConfig(tenantId) {
        const config = await this.chat.getWidgetConfig(tenantId);
        return api_response_1.ApiResponse.success(config, 'Widget config retrieved');
    }
    async updateWidgetConfig(dto, tenantId) {
        const config = await this.chat.updateWidgetConfig(tenantId, dto);
        return api_response_1.ApiResponse.success(config, 'Widget config updated');
    }
    async getVectorStats(tenantId) {
        const stats = await this.vectorStore.getStats(tenantId);
        return api_response_1.ApiResponse.success(stats, 'Vector stats retrieved');
    }
};
exports.SelfHostedAiController = SelfHostedAiController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "checkHealth", null);
__decorate([
    (0, common_1.Get)('models/local'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "listLocalModels", null);
__decorate([
    (0, common_1.Get)('models'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "getModelStatus", null);
__decorate([
    (0, common_1.Post)('models/pull'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [self_hosted_ai_dto_1.PullModelDto, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "pullModel", null);
__decorate([
    (0, common_1.Post)('models/:modelId/cancel'),
    __param(0, (0, common_1.Param)('modelId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "cancelPull", null);
__decorate([
    (0, common_1.Delete)('models/:modelId'),
    __param(0, (0, common_1.Param)('modelId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "deleteModel", null);
__decorate([
    (0, common_1.Put)('models/default'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [self_hosted_ai_dto_1.SetDefaultModelDto, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "setDefaultModel", null);
__decorate([
    (0, common_1.Get)('datasets'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "listDatasets", null);
__decorate([
    (0, common_1.Post)('datasets'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [self_hosted_ai_dto_1.CreateDatasetDto, String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "createDataset", null);
__decorate([
    (0, common_1.Get)('datasets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "getDataset", null);
__decorate([
    (0, common_1.Put)('datasets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, self_hosted_ai_dto_1.UpdateDatasetDto, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "updateDataset", null);
__decorate([
    (0, common_1.Delete)('datasets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "deleteDataset", null);
__decorate([
    (0, common_1.Post)('datasets/:datasetId/documents'),
    __param(0, (0, common_1.Param)('datasetId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, self_hosted_ai_dto_1.AddDocumentDto, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "addDocument", null);
__decorate([
    (0, common_1.Get)('documents/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "getDocument", null);
__decorate([
    (0, common_1.Put)('documents/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, self_hosted_ai_dto_1.UpdateDocumentDto, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "updateDocument", null);
__decorate([
    (0, common_1.Delete)('documents/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "deleteDocument", null);
__decorate([
    (0, common_1.Post)('datasets/:datasetId/import-crm'),
    __param(0, (0, common_1.Param)('datasetId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, self_hosted_ai_dto_1.ImportCrmDataDto, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "importCrmData", null);
__decorate([
    (0, common_1.Post)('datasets/:datasetId/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('datasetId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('datasets/:datasetId/import-url'),
    __param(0, (0, common_1.Param)('datasetId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, self_hosted_ai_dto_1.ImportUrlDto, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "importUrl", null);
__decorate([
    (0, common_1.Post)('training/start'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [self_hosted_ai_dto_1.StartTrainingDto, String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "startTraining", null);
__decorate([
    (0, common_1.Get)('training/jobs'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('datasetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "listTrainingJobs", null);
__decorate([
    (0, common_1.Get)('training/jobs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "getTrainingJob", null);
__decorate([
    (0, common_1.Post)('training/jobs/:id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "cancelTrainingJob", null);
__decorate([
    (0, common_1.Post)('chat/sessions'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [self_hosted_ai_dto_1.CreateSessionDto, String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "createSession", null);
__decorate([
    (0, common_1.Get)('chat/sessions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "listSessions", null);
__decorate([
    (0, common_1.Get)('chat/sessions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)('chat/sessions/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, self_hosted_ai_dto_1.SendMessageDto, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Delete)('chat/sessions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "deleteSession", null);
__decorate([
    (0, common_1.Post)('chat/quick'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [self_hosted_ai_dto_1.QuickChatDto, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "quickChat", null);
__decorate([
    (0, common_1.Get)('prompts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "listPrompts", null);
__decorate([
    (0, common_1.Post)('prompts'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [self_hosted_ai_dto_1.CreateSystemPromptDto, String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "createPrompt", null);
__decorate([
    (0, common_1.Put)('prompts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, self_hosted_ai_dto_1.UpdateSystemPromptDto, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "updatePrompt", null);
__decorate([
    (0, common_1.Delete)('prompts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "deletePrompt", null);
__decorate([
    (0, common_1.Get)('widget/config'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "getWidgetConfig", null);
__decorate([
    (0, common_1.Put)('widget/config'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [self_hosted_ai_dto_1.UpdateWidgetConfigDto, String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "updateWidgetConfig", null);
__decorate([
    (0, common_1.Get)('vectors/stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SelfHostedAiController.prototype, "getVectorStats", null);
exports.SelfHostedAiController = SelfHostedAiController = __decorate([
    (0, swagger_1.ApiTags)('Self-Hosted AI'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('self-hosted-ai'),
    __metadata("design:paramtypes", [ollama_service_1.OllamaService,
        ai_training_service_1.AiTrainingService,
        ai_chat_service_1.AiChatService,
        vector_store_service_1.VectorStoreService,
        document_import_service_1.DocumentImportService])
], SelfHostedAiController);
//# sourceMappingURL=self-hosted-ai.controller.js.map