import {
  Controller, Get, Post, Put, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { AiUnifiedService } from '../services/ai-unified.service';
import { AiSettingsService } from '../services/ai-settings.service';
import { AiUsageService } from '../services/ai-usage.service';
import { AI_MODELS, MODEL_SUGGESTIONS } from '../ai-models.config';
import {
  GenerateContentDto,
  ImproveTextDto,
  TranslateTextDto,
  SummarizeTextDto,
  ChangeToneDto,
  UpdateAiSettingsDto,
} from './dto/ai.dto';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiUnifiedService,
    private readonly settingsService: AiSettingsService,
    private readonly usageService: AiUsageService,
  ) {}

  // ── Content Operations ────────────────────────────────────

  @Post('generate')
  async generate(
    @Body() dto: GenerateContentDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const content = await this.aiService.generate(tenantId, userId, dto);
    return ApiResponse.success({ content }, 'Content generated');
  }

  @Post('improve')
  async improve(
    @Body() dto: ImproveTextDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const content = await this.aiService.improve(tenantId, userId, dto);
    return ApiResponse.success({ content }, 'Text improved');
  }

  @Post('translate')
  async translate(
    @Body() dto: TranslateTextDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const content = await this.aiService.translate(tenantId, userId, dto);
    return ApiResponse.success({ content }, 'Text translated');
  }

  @Post('summarize')
  async summarize(
    @Body() dto: SummarizeTextDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const content = await this.aiService.summarize(tenantId, userId, dto);
    return ApiResponse.success({ content }, 'Text summarized');
  }

  @Post('tone')
  async changeTone(
    @Body() dto: ChangeToneDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const content = await this.aiService.changeTone(tenantId, userId, dto);
    return ApiResponse.success({ content }, 'Tone changed');
  }

  // ── Settings ──────────────────────────────────────────────

  @Get('settings')
  async getSettings(@CurrentUser('tenantId') tenantId: string) {
    const settings = await this.settingsService.get(tenantId);
    return ApiResponse.success(settings, 'AI settings retrieved');
  }

  @Put('settings')
  async updateSettings(
    @Body() dto: UpdateAiSettingsDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const settings = await this.settingsService.update(tenantId, dto);
    return ApiResponse.success(settings, 'AI settings updated');
  }

  // ── Usage & Models ────────────────────────────────────────

  @Get('usage')
  async getUsage(@CurrentUser('tenantId') tenantId: string) {
    const stats = await this.usageService.getUsageStats(tenantId);
    return ApiResponse.success(stats, 'Usage stats retrieved');
  }

  @Get('models')
  async getModels() {
    return ApiResponse.success(
      { models: AI_MODELS, suggestions: MODEL_SUGGESTIONS },
      'Available models retrieved',
    );
  }
}
