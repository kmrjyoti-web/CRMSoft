import { useQuery, useMutation } from '@tanstack/react-query';
import { aiService } from '../services/ai.service';
import type {
  AiGeneratePayload, AiImprovePayload, AiTranslatePayload,
  AiSummarizePayload, AiTonePayload,
} from '../services/ai.service';

export function useAiGenerate() {
  return useMutation({
    mutationFn: (data: AiGeneratePayload) => aiService.generate(data),
  });
}

export function useAiImprove() {
  return useMutation({
    mutationFn: (data: AiImprovePayload) => aiService.improve(data),
  });
}

export function useAiTranslate() {
  return useMutation({
    mutationFn: (data: AiTranslatePayload) => aiService.translate(data),
  });
}

export function useAiSummarize() {
  return useMutation({
    mutationFn: (data: AiSummarizePayload) => aiService.summarize(data),
  });
}

export function useAiChangeTone() {
  return useMutation({
    mutationFn: (data: AiTonePayload) => aiService.changeTone(data),
  });
}

export function useAiModels() {
  return useQuery({
    queryKey: ['ai-models'],
    queryFn: () => aiService.getModels(),
    staleTime: 30 * 60 * 1000,
  });
}
