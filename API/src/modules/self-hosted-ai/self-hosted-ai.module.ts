import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { SelfHostedAiController } from './presentation/self-hosted-ai.controller';
import { OllamaService } from './services/ollama.service';
import { VectorStoreService } from './services/vector-store.service';
import { AiTrainingService } from './services/ai-training.service';
import { AiChatService } from './services/ai-chat.service';
import { DocumentImportService } from './services/document-import.service';
import { CrmDataAgentService } from './services/crm-data-agent.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [SelfHostedAiController],
  providers: [
    OllamaService,
    VectorStoreService,
    AiTrainingService,
    AiChatService,
    DocumentImportService,
    CrmDataAgentService,
  ],
  exports: [OllamaService, AiChatService],
})
export class SelfHostedAiModule {}
