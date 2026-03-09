import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { TenantConfigModule } from '../tenant-config/tenant-config.module';
import { AiController } from './presentation/ai.controller';
import { AiUnifiedService } from './services/ai-unified.service';
import { AiSettingsService } from './services/ai-settings.service';
import { AiUsageService } from './services/ai-usage.service';
import { AnthropicProvider } from './services/providers/anthropic.provider';
import { OpenaiProvider } from './services/providers/openai.provider';
import { GeminiProvider } from './services/providers/gemini.provider';
import { GroqProvider } from './services/providers/groq.provider';

@Module({
  imports: [PrismaModule, TenantConfigModule],
  controllers: [AiController],
  providers: [
    AiUnifiedService,
    AiSettingsService,
    AiUsageService,
    AnthropicProvider,
    OpenaiProvider,
    GeminiProvider,
    GroqProvider,
  ],
  exports: [AiUnifiedService],
})
export class AiModule {}
