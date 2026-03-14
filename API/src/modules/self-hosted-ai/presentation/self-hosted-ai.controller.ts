import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { OllamaService } from '../services/ollama.service';
import { AiTrainingService } from '../services/ai-training.service';
import { AiChatService } from '../services/ai-chat.service';
import { VectorStoreService } from '../services/vector-store.service';
import { DocumentImportService } from '../services/document-import.service';
import {
  PullModelDto, SetDefaultModelDto,
  CreateDatasetDto, UpdateDatasetDto,
  AddDocumentDto, UpdateDocumentDto,
  StartTrainingDto, ImportCrmDataDto, ImportUrlDto,
  CreateSessionDto, SendMessageDto, QuickChatDto,
  CreateSystemPromptDto, UpdateSystemPromptDto,
  UpdateWidgetConfigDto,
} from './dto/self-hosted-ai.dto';

@ApiTags('Self-Hosted AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('self-hosted-ai')
export class SelfHostedAiController {
  constructor(
    private readonly ollama: OllamaService,
    private readonly training: AiTrainingService,
    private readonly chat: AiChatService,
    private readonly vectorStore: VectorStoreService,
    private readonly docImport: DocumentImportService,
  ) {}

  // ═══════════════════════════════════════════════════════════
  // OLLAMA — Model Management (7 endpoints)
  // ═══════════════════════════════════════════════════════════

  @Get('health')
  async checkHealth() {
    const status = await this.ollama.checkHealth();
    return ApiResponse.success(status, 'Chat server health check');
  }

  @Get('models/local')
  async listLocalModels() {
    const models = await this.ollama.listLocalModels();
    return ApiResponse.success(models, 'Local models retrieved');
  }

  @Get('models')
  async getModelStatus(@CurrentUser('tenantId') tenantId: string) {
    const models = await this.ollama.getModelStatus(tenantId);
    return ApiResponse.success(models, 'Model status retrieved');
  }

  @Post('models/pull')
  async pullModel(
    @Body() dto: PullModelDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.ollama.pullModel(dto.modelName, tenantId);
    return ApiResponse.success(result, 'Model pull initiated');
  }

  @Post('models/:modelId/cancel')
  async cancelPull(
    @Param('modelId') modelId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.ollama.cancelPull(decodeURIComponent(modelId), tenantId);
    return ApiResponse.success(null, 'Pull cancelled');
  }

  @Delete('models/:modelId')
  async deleteModel(
    @Param('modelId') modelId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.ollama.deleteModel(decodeURIComponent(modelId), tenantId);
    return ApiResponse.success(null, 'Model deleted');
  }

  @Put('models/default')
  async setDefaultModel(
    @Body() dto: SetDefaultModelDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.ollama.setDefaultModel(tenantId, dto.modelId, dto.isEmbedding ?? false);
    return ApiResponse.success(null, 'Default model updated');
  }

  // ═══════════════════════════════════════════════════════════
  // DATASETS (5 endpoints)
  // ═══════════════════════════════════════════════════════════

  @Get('datasets')
  async listDatasets(
    @CurrentUser('tenantId') tenantId: string,
    @Query('status') status?: string,
  ) {
    const datasets = await this.training.listDatasets(tenantId, status);
    return ApiResponse.success(datasets, 'Datasets retrieved');
  }

  @Post('datasets')
  async createDataset(
    @Body() dto: CreateDatasetDto,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const dataset = await this.training.createDataset(tenantId, { ...dto, createdBy: userId });
    return ApiResponse.success(dataset, 'Dataset created');
  }

  @Get('datasets/:id')
  async getDataset(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const dataset = await this.training.getDataset(tenantId, id);
    return ApiResponse.success(dataset, 'Dataset retrieved');
  }

  @Put('datasets/:id')
  async updateDataset(
    @Param('id') id: string,
    @Body() dto: UpdateDatasetDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.training.updateDataset(tenantId, id, dto);
    return ApiResponse.success(null, 'Dataset updated');
  }

  @Delete('datasets/:id')
  async deleteDataset(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.training.deleteDataset(tenantId, id);
    return ApiResponse.success(null, 'Dataset deleted');
  }

  // ═══════════════════════════════════════════════════════════
  // DOCUMENTS (5 endpoints)
  // ═══════════════════════════════════════════════════════════

  @Post('datasets/:datasetId/documents')
  async addDocument(
    @Param('datasetId') datasetId: string,
    @Body() dto: AddDocumentDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const doc = await this.training.addDocument(tenantId, datasetId, dto);
    return ApiResponse.success(doc, 'Document added');
  }

  @Get('documents/:id')
  async getDocument(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const doc = await this.training.getDocument(tenantId, id);
    return ApiResponse.success(doc, 'Document retrieved');
  }

  @Put('documents/:id')
  async updateDocument(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.training.updateDocument(tenantId, id, dto);
    return ApiResponse.success(null, 'Document updated');
  }

  @Delete('documents/:id')
  async deleteDocument(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.training.deleteDocument(tenantId, id);
    return ApiResponse.success(null, 'Document deleted');
  }

  // ── CRM Data Import ──

  @Post('datasets/:datasetId/import-crm')
  async importCrmData(
    @Param('datasetId') datasetId: string,
    @Body() dto: ImportCrmDataDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.training.importCrmData(tenantId, datasetId, dto.entityType);
    return ApiResponse.success(result, 'CRM data imported');
  }

  // ── File Upload ──

  @Post('datasets/:datasetId/upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  }))
  async uploadFile(
    @Param('datasetId') datasetId: string,
    @UploadedFile() file: any,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const extracted = await this.docImport.extractFromFile(file);
    const doc = await this.training.addDocument(tenantId, datasetId, {
      title: extracted.title,
      content: extracted.content,
      contentType: extracted.contentType,
      metadata: { originalName: file.originalname, fileSize: file.size },
    });
    return ApiResponse.success(doc, `File processed: ${extracted.content.length} characters extracted`);
  }

  // ── URL Import ──

  @Post('datasets/:datasetId/import-url')
  async importUrl(
    @Param('datasetId') datasetId: string,
    @Body() dto: ImportUrlDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const extracted = await this.docImport.extractFromUrl(dto.url);
    const doc = await this.training.addDocument(tenantId, datasetId, {
      title: dto.title || extracted.title,
      content: extracted.content,
      contentType: 'url',
      sourceUrl: dto.url,
      metadata: { scrapedFrom: dto.url },
    });
    return ApiResponse.success(doc, `URL scraped: ${extracted.content.length} characters extracted`);
  }

  // ═══════════════════════════════════════════════════════════
  // TRAINING JOBS (4 endpoints)
  // ═══════════════════════════════════════════════════════════

  @Post('training/start')
  async startTraining(
    @Body() dto: StartTrainingDto,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const job = await this.training.startTrainingJob(tenantId, { ...dto, createdBy: userId });
    return ApiResponse.success(job, 'Training job started');
  }

  @Get('training/jobs')
  async listTrainingJobs(
    @CurrentUser('tenantId') tenantId: string,
    @Query('datasetId') datasetId?: string,
  ) {
    const jobs = await this.training.listTrainingJobs(tenantId, datasetId);
    return ApiResponse.success(jobs, 'Training jobs retrieved');
  }

  @Get('training/jobs/:id')
  async getTrainingJob(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const job = await this.training.getTrainingJob(tenantId, id);
    return ApiResponse.success(job, 'Training job retrieved');
  }

  @Post('training/jobs/:id/cancel')
  async cancelTrainingJob(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.training.cancelTrainingJob(tenantId, id);
    return ApiResponse.success(null, 'Training job cancelled');
  }

  // ═══════════════════════════════════════════════════════════
  // CHAT (6 endpoints)
  // ═══════════════════════════════════════════════════════════

  @Post('chat/sessions')
  async createSession(
    @Body() dto: CreateSessionDto,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const session = await this.chat.createSession(tenantId, { ...dto, userId });
    return ApiResponse.success(session, 'Chat session created');
  }

  @Get('chat/sessions')
  async listSessions(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const sessions = await this.chat.listSessions(tenantId, userId);
    return ApiResponse.success(sessions, 'Chat sessions retrieved');
  }

  @Get('chat/sessions/:id')
  async getSession(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const session = await this.chat.getSession(tenantId, id);
    return ApiResponse.success(session, 'Chat session retrieved');
  }

  @Post('chat/sessions/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.chat.sendMessage(tenantId, id, dto.message);
    return ApiResponse.success(result, 'Message sent');
  }

  @Delete('chat/sessions/:id')
  async deleteSession(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.chat.deleteSession(tenantId, id);
    return ApiResponse.success(null, 'Session deleted');
  }

  @Post('chat/quick')
  async quickChat(
    @Body() dto: QuickChatDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.chat.quickChat(tenantId, dto);
    return ApiResponse.success(result, 'Quick chat response');
  }

  // ═══════════════════════════════════════════════════════════
  // SYSTEM PROMPTS (4 endpoints)
  // ═══════════════════════════════════════════════════════════

  @Get('prompts')
  async listPrompts(
    @CurrentUser('tenantId') tenantId: string,
    @Query('category') category?: string,
  ) {
    const prompts = await this.chat.listSystemPrompts(tenantId, category);
    return ApiResponse.success(prompts, 'System prompts retrieved');
  }

  @Post('prompts')
  async createPrompt(
    @Body() dto: CreateSystemPromptDto,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const prompt = await this.chat.createSystemPrompt(tenantId, { ...dto, createdBy: userId });
    return ApiResponse.success(prompt, 'System prompt created');
  }

  @Put('prompts/:id')
  async updatePrompt(
    @Param('id') id: string,
    @Body() dto: UpdateSystemPromptDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const prompt = await this.chat.updateSystemPrompt(tenantId, id, dto);
    return ApiResponse.success(prompt, 'System prompt updated');
  }

  @Delete('prompts/:id')
  async deletePrompt(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.chat.deleteSystemPrompt(tenantId, id);
    return ApiResponse.success(null, 'System prompt deleted');
  }

  // ═══════════════════════════════════════════════════════════
  // WIDGET CONFIG (2 endpoints)
  // ═══════════════════════════════════════════════════════════

  @Get('widget/config')
  async getWidgetConfig(@CurrentUser('tenantId') tenantId: string) {
    const config = await this.chat.getWidgetConfig(tenantId);
    return ApiResponse.success(config, 'Widget config retrieved');
  }

  @Put('widget/config')
  async updateWidgetConfig(
    @Body() dto: UpdateWidgetConfigDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const config = await this.chat.updateWidgetConfig(tenantId, dto);
    return ApiResponse.success(config, 'Widget config updated');
  }

  // ═══════════════════════════════════════════════════════════
  // VECTOR STORE STATS (1 endpoint)
  // ═══════════════════════════════════════════════════════════

  @Get('vectors/stats')
  async getVectorStats(@CurrentUser('tenantId') tenantId: string) {
    const stats = await this.vectorStore.getStats(tenantId);
    return ApiResponse.success(stats, 'Vector stats retrieved');
  }
}
