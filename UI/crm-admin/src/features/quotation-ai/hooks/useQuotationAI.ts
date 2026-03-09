import { useMutation, useQuery } from "@tanstack/react-query";
import * as svc from "../services/quotation-ai.service";
import type { PredictWinDto, GenerateQuotationDto } from "../types/quotation-ai.types";

export function useAIQuestions(leadId: string) {
  return useQuery({
    queryKey: ["quotation-ai", "questions", leadId],
    queryFn: () => svc.getQuestions(leadId),
    enabled: !!leadId,
  });
}

export function usePredictWin() {
  return useMutation({
    mutationFn: (dto: PredictWinDto) => svc.predictWin(dto),
  });
}

export function useGenerateQuotation() {
  return useMutation({
    mutationFn: (dto: GenerateQuotationDto) => svc.generateQuotation(dto),
  });
}
