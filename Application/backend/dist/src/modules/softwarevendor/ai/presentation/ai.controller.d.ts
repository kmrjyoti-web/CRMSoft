import { ApiResponse } from '../../../../common/utils/api-response';
import { AiUnifiedService } from '../services/ai-unified.service';
import { AiSettingsService } from '../services/ai-settings.service';
import { AiUsageService } from '../services/ai-usage.service';
import { GenerateContentDto, ImproveTextDto, TranslateTextDto, SummarizeTextDto, ChangeToneDto, UpdateAiSettingsDto } from './dto/ai.dto';
export declare class AiController {
    private readonly aiService;
    private readonly settingsService;
    private readonly usageService;
    constructor(aiService: AiUnifiedService, settingsService: AiSettingsService, usageService: AiUsageService);
    generate(dto: GenerateContentDto, userId: string, tenantId: string): Promise<ApiResponse<{
        content: string;
    }>>;
    improve(dto: ImproveTextDto, userId: string, tenantId: string): Promise<ApiResponse<{
        content: string;
    }>>;
    translate(dto: TranslateTextDto, userId: string, tenantId: string): Promise<ApiResponse<{
        content: string;
    }>>;
    summarize(dto: SummarizeTextDto, userId: string, tenantId: string): Promise<ApiResponse<{
        content: string;
    }>>;
    changeTone(dto: ChangeToneDto, userId: string, tenantId: string): Promise<ApiResponse<{
        content: string;
    }>>;
    getSettings(tenantId: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        isEnabled: boolean;
        defaultProvider: string;
        defaultModel: string;
        taskOverrides: import("@prisma/working-client/runtime/library").JsonValue | null;
        monthlyTokenBudget: number | null;
    }>>;
    updateSettings(dto: UpdateAiSettingsDto, tenantId: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        isEnabled: boolean;
        defaultProvider: string;
        defaultModel: string;
        taskOverrides: import("@prisma/working-client/runtime/library").JsonValue | null;
        monthlyTokenBudget: number | null;
    }>>;
    getUsage(tenantId: string): Promise<ApiResponse<{
        provider: string;
        model: string;
        totalTokens: number;
        promptTokens: number;
        outputTokens: number;
        requestCount: number;
        successCount: number;
        failureCount: number;
    }[]>>;
    getModels(): Promise<ApiResponse<{
        models: Record<string, import("../ai-models.config").AiModelInfo[]>;
        suggestions: Record<string, {
            provider: string;
            model: string;
            reason: string;
        }>;
    }>>;
}
