import { api } from '@/services/api-client';

interface AiGenerateRequest {
  prompt: string;
  context?: {
    existingNodes?: number;
    workflowName?: string;
  };
}

interface AiGenerateResponse {
  nodes: any[];
  edges: any[];
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
