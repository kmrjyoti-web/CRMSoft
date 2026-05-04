import { IsString, IsOptional, IsEnum } from 'class-validator';

export class GenerateContentDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;
}

export class ImproveTextDto {
  @IsString()
  text: string;

  @IsString()
  instruction: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  model?: string;
}

export class TranslateTextDto {
  @IsString()
  text: string;

  @IsString()
  targetLanguage: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  model?: string;
}

export class SummarizeTextDto {
  @IsString()
  text: string;

  @IsOptional()
  maxLength?: number;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  model?: string;
}

export class ChangeToneDto {
  @IsString()
  text: string;

  @IsEnum(['formal', 'casual', 'professional', 'friendly'])
  tone: 'formal' | 'casual' | 'professional' | 'friendly';

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  model?: string;
}

export class UpdateAiSettingsDto {
  @IsOptional()
  @IsString()
  defaultProvider?: string;

  @IsOptional()
  @IsString()
  defaultModel?: string;

  @IsOptional()
  taskOverrides?: Record<string, string>;

  @IsOptional()
  isEnabled?: boolean;

  @IsOptional()
  monthlyTokenBudget?: number;
}
