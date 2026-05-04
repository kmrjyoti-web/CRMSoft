import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiSettingsService } from '../services/ai-settings.service';
import type { UpdateAiSettingsPayload } from '../types/ai-settings.types';

const AI_KEY = 'ai-settings';

export function useAiSettings() {
  return useQuery({
    queryKey: [AI_KEY],
    queryFn: () => aiSettingsService.getSettings(),
  });
}

export function useUpdateAiSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAiSettingsPayload) => aiSettingsService.updateSettings(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AI_KEY] }),
  });
}

export function useAiModels() {
  return useQuery({
    queryKey: [AI_KEY, 'models'],
    queryFn: () => aiSettingsService.getModels(),
    staleTime: 1000 * 60 * 30, // 30 min cache — models rarely change
  });
}

export function useAiUsage() {
  return useQuery({
    queryKey: [AI_KEY, 'usage'],
    queryFn: () => aiSettingsService.getUsage(),
  });
}
