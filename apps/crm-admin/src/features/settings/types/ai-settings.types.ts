export type AiProvider = 'ANTHROPIC_CLAUDE' | 'OPENAI_GPT' | 'GOOGLE_GEMINI' | 'GROQ';

export interface AiModelInfo {
  id: string;
  label: string;
  context: number;
  costTier: 'low' | 'medium' | 'high';
}

export interface AiModelsResponse {
  models: Record<AiProvider, AiModelInfo[]>;
  suggestions: Record<string, { provider: string; model: string; reason: string }>;
}

export interface AiSettingsData {
  id: string;
  tenantId: string;
  defaultProvider: string;
  defaultModel: string;
  taskOverrides?: Record<string, string> | null;
  isEnabled: boolean;
  monthlyTokenBudget?: number | null;
}

export interface UpdateAiSettingsPayload {
  defaultProvider?: string;
  defaultModel?: string;
  taskOverrides?: Record<string, string>;
  isEnabled?: boolean;
  monthlyTokenBudget?: number;
}

export interface AiUsageStat {
  provider: string;
  model: string;
  totalTokens: number;
  promptTokens: number;
  outputTokens: number;
  requestCount: number;
  successCount: number;
  failureCount: number;
}
