import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ── Model DTOs ──

export class PullModelDto {
  @ApiProperty({ example: 'llama3.2:3b' })
  @IsString() @MinLength(1)
  modelName: string;
}

export class SetDefaultModelDto {
  @ApiProperty({ example: 'llama3.2:3b' })
  @IsString()
  modelId: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isEmbedding?: boolean;
}

// ── Dataset DTOs ──

export class CreateDatasetDto {
  @ApiProperty({ example: 'Product Knowledge Base' })
  @IsString() @MinLength(1)
  name: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'MANUAL' })
  @IsOptional() @IsString()
  sourceType?: string;

  @ApiPropertyOptional({ example: 'PRODUCT' })
  @IsOptional() @IsString()
  entityType?: string;
}

export class UpdateDatasetDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;
}

// ── Document DTOs ──

export class AddDocumentDto {
  @ApiProperty({ example: 'Product Guide' })
  @IsString() @MinLength(1)
  title: string;

  @ApiProperty({ example: 'Full text content...' })
  @IsString() @MinLength(1)
  content: string;

  @ApiPropertyOptional({ example: 'text' })
  @IsOptional() @IsString()
  contentType?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  sourceUrl?: string;
}

export class UpdateDocumentDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  content?: string;
}

// ── Training Job DTOs ──

export class StartTrainingDto {
  @ApiProperty()
  @IsString()
  datasetId: string;

  @ApiProperty({ example: 'nomic-embed-text' })
  @IsString()
  modelId: string;

  @ApiPropertyOptional()
  @IsOptional()
  config?: Record<string, unknown>;
}

// ── Import CRM Data ──

export class ImportCrmDataDto {
  @ApiProperty({ example: 'CONTACT' })
  @IsString()
  entityType: string;
}

// ── Import URL ──

export class ImportUrlDto {
  @ApiProperty({ example: 'https://example.com/about' })
  @IsString() @MinLength(1)
  url: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  title?: string;
}

// ── Chat DTOs ──

export class CreateSessionDto {
  @ApiProperty({ example: 'llama3.2:3b' })
  @IsString()
  modelId: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray()
  datasetIds?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  systemPromptId?: string;
}

export class SendMessageDto {
  @ApiProperty({ example: 'What products do we have?' })
  @IsString() @MinLength(1)
  message: string;
}

export class QuickChatDto {
  @ApiProperty({ example: 'llama3.2:3b' })
  @IsString()
  modelId: string;

  @ApiProperty({ example: 'Summarize our top customers' })
  @IsString() @MinLength(1)
  message: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  systemPrompt?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray()
  datasetIds?: string[];
}

// ── System Prompt DTOs ──

export class CreateSystemPromptDto {
  @ApiProperty({ example: 'CRM Sales Assistant' })
  @IsString() @MinLength(1)
  name: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiProperty({ example: 'You are a helpful sales assistant...' })
  @IsString() @MinLength(1)
  prompt: string;

  @ApiPropertyOptional({ example: 'sales' })
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  variables?: Record<string, unknown>;
}

export class UpdateSystemPromptDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  prompt?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  variables?: Record<string, unknown>;
}

// ── Widget Config ──

export class UpdateWidgetConfigDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  subtitle?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  primaryColor?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  position?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  modelId?: string;

  @ApiPropertyOptional() @IsOptional() @IsArray()
  datasetIds?: string[];

  @ApiPropertyOptional() @IsOptional() @IsString()
  systemPromptId?: string;
}
