// ── Models ──

export interface AiModel {
  id: string;
  tenantId: string;
  name: string;
  modelId: string;
  source: 'OLLAMA' | 'CLOUD';
  status: 'AVAILABLE' | 'DOWNLOADING' | 'NOT_INSTALLED' | 'ERROR';
  sizeBytes: number;
  parameterCount?: string;
  contextLength: number;
  capabilities: string[];
  isDefault: boolean;
  isEmbedding: boolean;
  downloadProgress?: number;
  lastUsedAt?: string;
  createdAt: string;
}

export interface OllamaHealth {
  connected: boolean;
  version?: string;
  error?: string;
}

export interface OllamaLocalModel {
  name: string;
  size: number;
  digest: string;
  modifiedAt: string;
  parameterSize?: string;
}

// ── Datasets ──

export interface AiDataset {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  sourceType: string;
  entityType?: string;
  status: 'DRAFT' | 'PROCESSING' | 'READY' | 'FAILED';
  documentCount: number;
  totalChunks: number;
  totalTokens: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  documents?: AiDocument[];
  trainingJobs?: AiTrainingJob[];
  _count?: { documents: number; trainingJobs: number };
}

export interface AiDocument {
  id: string;
  datasetId: string;
  title: string;
  content: string;
  contentType: string;
  sourceUrl?: string;
  chunkCount: number;
  tokenCount: number;
  isProcessed: boolean;
  createdAt: string;
}

// ── Training ──

export interface AiTrainingJob {
  id: string;
  datasetId: string;
  modelId: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  totalSteps: number;
  completedSteps: number;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  resultJson?: Record<string, unknown>;
  createdAt: string;
  dataset?: { name: string };
}

// ── Chat ──

export interface AiChatSession {
  id: string;
  title: string;
  modelId: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  messages?: AiChatMessage[];
  systemPrompt?: AiSystemPrompt;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: { content: string; score: number; documentId?: string }[];
  tokenCount: number;
  latencyMs?: number;
  createdAt: string;
}

export interface ChatReply {
  reply: string;
  sources: { content: string; score: number }[];
  tokenCount: number;
  latencyMs: number;
}

// ── System Prompts ──

export interface AiSystemPrompt {
  id: string;
  name: string;
  description?: string;
  prompt: string;
  category: string;
  isDefault: boolean;
  isSystem: boolean;
  variables: string[];
  createdAt: string;
}

// ── Widget ──

export interface WidgetConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  primaryColor: string;
  position: string;
  modelId: string;
  datasetIds: string[];
  systemPromptId: string;
}

// ── Vector Stats ──

export interface VectorStats {
  totalEmbeddings: number;
  totalTokens: number;
  datasetBreakdown: { datasetId: string; count: number }[];
}
