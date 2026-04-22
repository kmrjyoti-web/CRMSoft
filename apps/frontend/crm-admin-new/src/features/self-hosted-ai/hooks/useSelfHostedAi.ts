import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/self-hosted-ai.service';

const KEYS = {
  health: ['self-hosted-ai', 'health'],
  models: ['self-hosted-ai', 'models'],
  localModels: ['self-hosted-ai', 'local-models'],
  datasets: ['self-hosted-ai', 'datasets'],
  dataset: (id: string) => ['self-hosted-ai', 'dataset', id],
  trainingJobs: ['self-hosted-ai', 'training-jobs'],
  trainingJob: (id: string) => ['self-hosted-ai', 'training-job', id],
  chatSessions: ['self-hosted-ai', 'chat-sessions'],
  chatSession: (id: string) => ['self-hosted-ai', 'chat-session', id],
  prompts: ['self-hosted-ai', 'prompts'],
  widgetConfig: ['self-hosted-ai', 'widget-config'],
  vectorStats: ['self-hosted-ai', 'vector-stats'],
};

// ═══ OLLAMA ═══

export function useOllamaHealth() {
  return useQuery({ queryKey: KEYS.health, queryFn: api.checkOllamaHealth, refetchInterval: 30000 });
}

export function useAiModels() {
  return useQuery({
    queryKey: KEYS.models,
    queryFn: api.listModels,
    refetchInterval: (query) => {
      const data = query.state.data?.data;
      const hasDownloading = Array.isArray(data) && data.some((m: { status: string }) => m.status === 'DOWNLOADING');
      return hasDownloading ? 3000 : false;
    },
  });
}

export function useLocalModels() {
  return useQuery({ queryKey: KEYS.localModels, queryFn: api.listLocalModels });
}

export function usePullModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (modelName: string) => api.pullModel(modelName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.models });
      qc.invalidateQueries({ queryKey: KEYS.localModels });
    },
  });
}

export function useCancelPull() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (modelId: string) => api.cancelPull(modelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.models });
      qc.invalidateQueries({ queryKey: KEYS.localModels });
    },
  });
}

export function useDeleteModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (modelId: string) => api.deleteModel(modelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.models });
      qc.invalidateQueries({ queryKey: KEYS.localModels });
    },
  });
}

export function useSetDefaultModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { modelId: string; isEmbedding?: boolean }) =>
      api.setDefaultModel(data.modelId, data.isEmbedding),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.models }),
  });
}

// ═══ DATASETS ═══

export function useDatasets(status?: string) {
  return useQuery({ queryKey: [...KEYS.datasets, status], queryFn: () => api.listDatasets(status) });
}

export function useDataset(id: string) {
  return useQuery({ queryKey: KEYS.dataset(id), queryFn: () => api.getDataset(id), enabled: !!id });
}

export function useCreateDataset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createDataset,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.datasets }),
  });
}

export function useDeleteDataset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteDataset,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.datasets }),
  });
}

export function useImportCrmData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { datasetId: string; entityType: string }) =>
      api.importCrmData(data.datasetId, data.entityType),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.datasets }),
  });
}

// ═══ DOCUMENTS ═══

export function useAddDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { datasetId: string; title: string; content: string }) =>
      api.addDocument(data.datasetId, { title: data.title, content: data.content }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.datasets }),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteDocument,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.datasets }),
  });
}

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { datasetId: string; file: File }) =>
      api.uploadFile(data.datasetId, data.file),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.datasets }),
  });
}

export function useImportUrl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { datasetId: string; url: string; title?: string }) =>
      api.importUrl(data.datasetId, data.url, data.title),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.datasets }),
  });
}

// ═══ TRAINING ═══

export function useTrainingJobs(datasetId?: string) {
  return useQuery({
    queryKey: [...KEYS.trainingJobs, datasetId],
    queryFn: () => api.listTrainingJobs(datasetId),
  });
}

export function useTrainingJob(id: string) {
  return useQuery({
    queryKey: KEYS.trainingJob(id),
    queryFn: () => api.getTrainingJob(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      const status = data?.data?.status;
      return status === 'RUNNING' || status === 'QUEUED' ? 3000 : false;
    },
  });
}

export function useStartTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.startTraining,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.trainingJobs });
      qc.invalidateQueries({ queryKey: KEYS.datasets });
    },
  });
}

export function useCancelTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.cancelTrainingJob,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.trainingJobs }),
  });
}

// ═══ CHAT ═══

export function useChatSessions() {
  return useQuery({ queryKey: KEYS.chatSessions, queryFn: api.listChatSessions });
}

export function useChatSession(id: string) {
  return useQuery({
    queryKey: KEYS.chatSession(id),
    queryFn: () => api.getChatSession(id),
    enabled: !!id,
  });
}

export function useCreateChatSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createChatSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.chatSessions }),
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { sessionId: string; message: string }) =>
      api.sendChatMessage(data.sessionId, data.message),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.chatSession(vars.sessionId) });
      qc.invalidateQueries({ queryKey: KEYS.chatSessions });
    },
  });
}

export function useDeleteChatSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteChatSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.chatSessions }),
  });
}

// ═══ SYSTEM PROMPTS ═══

export function useSystemPrompts(category?: string) {
  return useQuery({ queryKey: [...KEYS.prompts, category], queryFn: () => api.listSystemPrompts(category) });
}

export function useCreatePrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createSystemPrompt,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.prompts }),
  });
}

export function useUpdatePrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string } & Record<string, unknown>) => {
      const { id, ...rest } = data;
      return api.updateSystemPrompt(id, rest);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.prompts }),
  });
}

export function useDeletePrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSystemPrompt,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.prompts }),
  });
}

// ═══ WIDGET ═══

export function useWidgetConfig() {
  return useQuery({ queryKey: KEYS.widgetConfig, queryFn: api.getWidgetConfig });
}

export function useUpdateWidgetConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateWidgetConfig,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.widgetConfig }),
  });
}

// ═══ VECTOR STATS ═══

export function useVectorStats() {
  return useQuery({ queryKey: KEYS.vectorStats, queryFn: api.getVectorStats });
}
