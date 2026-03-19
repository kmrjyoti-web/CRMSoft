import { api } from '@/services/api-client';

interface AiGenerateRequest {
  prompt: string;
  context?: {
    existingNodes?: number;
    workflowName?: string;
  };
}

interface AiGenerateResponse {
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
  description: string;
  suggestedName?: string;
}

export const workflowAiService = {
  generateFromPrompt(data: AiGenerateRequest): Promise<AiGenerateResponse> {
    return api
      .post<{ data: AiGenerateResponse }>('/api/v1/workflow-admin/ai/generate', data)
      .then((r) => r.data.data);
  },
};
