import api from '@/services/api-client';

const BASE = '/api/v1/self-hosted-ai';

// ═══ OLLAMA / MODELS ═══

export const checkOllamaHealth = () =>
  api.get(`${BASE}/health`).then((r: any) => r.data);

export const listLocalModels = () =>
  api.get(`${BASE}/models/local`).then((r: any) => r.data);

export const listModels = () =>
  api.get(`${BASE}/models`).then((r: any) => r.data);

export const pullModel = (modelName: string) =>
  api.post(`${BASE}/models/pull`, { modelName }).then((r: any) => r.data);

export const cancelPull = (modelId: string) =>
  api.post(`${BASE}/models/${encodeURIComponent(modelId)}/cancel`).then((r: any) => r.data);

export const deleteModel = (modelId: string) =>
  api.delete(`${BASE}/models/${encodeURIComponent(modelId)}`).then((r: any) => r.data);

export const setDefaultModel = (modelId: string, isEmbedding = false) =>
  api.put(`${BASE}/models/default`, { modelId, isEmbedding }).then((r: any) => r.data);

// ═══ DATASETS ═══

export const listDatasets = (status?: string) =>
  api.get(`${BASE}/datasets`, { params: status ? { status } : {} }).then((r: any) => r.data);

export const createDataset = (data: { name: string; description?: string; sourceType?: string; entityType?: string }) =>
  api.post(`${BASE}/datasets`, data).then((r: any) => r.data);

export const getDataset = (id: string) =>
  api.get(`${BASE}/datasets/${id}`).then((r: any) => r.data);

export const updateDataset = (id: string, data: { name?: string; description?: string }) =>
  api.put(`${BASE}/datasets/${id}`, data).then((r: any) => r.data);

export const deleteDataset = (id: string) =>
  api.delete(`${BASE}/datasets/${id}`).then((r: any) => r.data);

// ═══ DOCUMENTS ═══

export const addDocument = (datasetId: string, data: { title: string; content: string; contentType?: string; sourceUrl?: string }) =>
  api.post(`${BASE}/datasets/${datasetId}/documents`, data).then((r: any) => r.data);

export const getDocument = (id: string) =>
  api.get(`${BASE}/documents/${id}`).then((r: any) => r.data);

export const updateDocument = (id: string, data: { title?: string; content?: string }) =>
  api.put(`${BASE}/documents/${id}`, data).then((r: any) => r.data);

export const deleteDocument = (id: string) =>
  api.delete(`${BASE}/documents/${id}`).then((r: any) => r.data);

export const importCrmData = (datasetId: string, entityType: string) =>
  api.post(`${BASE}/datasets/${datasetId}/import-crm`, { entityType }).then((r: any) => r.data);

export const uploadFile = (datasetId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`${BASE}/datasets/${datasetId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r: any) => r.data);
};

export const importUrl = (datasetId: string, url: string, title?: string) =>
  api.post(`${BASE}/datasets/${datasetId}/import-url`, { url, title }).then((r: any) => r.data);

// ═══ TRAINING ═══

export const startTraining = (data: { datasetId: string; modelId: string; config?: any }) =>
  api.post(`${BASE}/training/start`, data).then((r: any) => r.data);

export const listTrainingJobs = (datasetId?: string) =>
  api.get(`${BASE}/training/jobs`, { params: datasetId ? { datasetId } : {} }).then((r: any) => r.data);

export const getTrainingJob = (id: string) =>
  api.get(`${BASE}/training/jobs/${id}`).then((r: any) => r.data);

export const cancelTrainingJob = (id: string) =>
  api.post(`${BASE}/training/jobs/${id}/cancel`).then((r: any) => r.data);

// ═══ CHAT ═══

export const createChatSession = (data: { modelId: string; title?: string; datasetIds?: string[]; systemPromptId?: string }) =>
  api.post(`${BASE}/chat/sessions`, data).then((r: any) => r.data);

export const listChatSessions = () =>
  api.get(`${BASE}/chat/sessions`).then((r: any) => r.data);

export const getChatSession = (id: string) =>
  api.get(`${BASE}/chat/sessions/${id}`).then((r: any) => r.data);

export const sendChatMessage = (sessionId: string, message: string) =>
  api.post(`${BASE}/chat/sessions/${sessionId}/messages`, { message }).then((r: any) => r.data);

export const deleteChatSession = (id: string) =>
  api.delete(`${BASE}/chat/sessions/${id}`).then((r: any) => r.data);

export const quickChat = (data: { modelId: string; message: string; systemPrompt?: string; datasetIds?: string[] }) =>
  api.post(`${BASE}/chat/quick`, data).then((r: any) => r.data);

// ═══ SYSTEM PROMPTS ═══

export const listSystemPrompts = (category?: string) =>
  api.get(`${BASE}/prompts`, { params: category ? { category } : {} }).then((r: any) => r.data);

export const createSystemPrompt = (data: { name: string; description?: string; prompt: string; category?: string; isDefault?: boolean }) =>
  api.post(`${BASE}/prompts`, data).then((r: any) => r.data);

export const updateSystemPrompt = (id: string, data: Partial<{ name: string; description: string; prompt: string; category: string; isDefault: boolean }>) =>
  api.put(`${BASE}/prompts/${id}`, data).then((r: any) => r.data);

export const deleteSystemPrompt = (id: string) =>
  api.delete(`${BASE}/prompts/${id}`).then((r: any) => r.data);

// ═══ WIDGET CONFIG ═══

export const getWidgetConfig = () =>
  api.get(`${BASE}/widget/config`).then((r: any) => r.data);

export const updateWidgetConfig = (config: any) =>
  api.put(`${BASE}/widget/config`, config).then((r: any) => r.data);

// ═══ VECTOR STATS ═══

export const getVectorStats = () =>
  api.get(`${BASE}/vectors/stats`).then((r: any) => r.data);
