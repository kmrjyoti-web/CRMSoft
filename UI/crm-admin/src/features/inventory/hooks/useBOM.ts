import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bomService } from "../services/bom.service";
import type {
  CreateFormulaPayload, UpdateFormulaPayload,
  StartProductionPayload, CompleteProductionPayload,
  RecordScrapPayload,
} from "../types/bom.types";

const KEYS = {
  recipes: "bom-recipes",
  recipe: "bom-recipe",
  stockCheck: "bom-stock-check",
  productions: "bom-productions",
  production: "bom-production",
  scrapList: "bom-scrap",
  productionReport: "bom-production-report",
  consumptionReport: "bom-consumption-report",
  costingReport: "bom-costing-report",
  yieldReport: "bom-yield-report",
  scrapReport: "bom-scrap-report",
};

// ─── Recipes ───

export function useRecipeList(params?: Record<string, any>) {
  return useQuery({
    queryKey: [KEYS.recipes, params],
    queryFn: () => bomService.listRecipes(params),
  });
}

export function useRecipeDetail(id: string) {
  return useQuery({
    queryKey: [KEYS.recipe, id],
    queryFn: () => bomService.getRecipe(id),
    enabled: !!id,
  });
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFormulaPayload) => bomService.createRecipe(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.recipes] }),
  });
}

export function useUpdateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFormulaPayload }) =>
      bomService.updateRecipe(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.recipes] });
      qc.invalidateQueries({ queryKey: [KEYS.recipe] });
    },
  });
}

export function useDuplicateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      bomService.duplicateRecipe(id, newName),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.recipes] }),
  });
}

export function useDeactivateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bomService.deactivateRecipe(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.recipes] }),
  });
}

export function useCheckStock() {
  return useMutation({
    mutationFn: ({ id, quantity, locationId }: { id: string; quantity: number; locationId: string }) =>
      bomService.checkStock(id, quantity, locationId),
  });
}

// ─── Production ───

export function useProductionList(params?: Record<string, any>) {
  return useQuery({
    queryKey: [KEYS.productions, params],
    queryFn: () => bomService.listProduction(params),
  });
}

export function useProductionDetail(id: string) {
  return useQuery({
    queryKey: [KEYS.production, id],
    queryFn: () => bomService.getProduction(id),
    enabled: !!id,
  });
}

export function useStartProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartProductionPayload) => bomService.startProduction(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.productions] }),
  });
}

export function useCompleteProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CompleteProductionPayload }) =>
      bomService.completeProduction(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.productions] });
      qc.invalidateQueries({ queryKey: [KEYS.production] });
    },
  });
}

export function useCancelProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      bomService.cancelProduction(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.productions] }),
  });
}

// ─── Scrap ───

export function useScrapList(params?: Record<string, any>) {
  return useQuery({
    queryKey: [KEYS.scrapList, params],
    queryFn: () => bomService.listScrap(params),
  });
}

export function useRecordScrap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordScrapPayload) => bomService.recordScrap(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.scrapList] }),
  });
}

export function useWriteOffScrap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, disposalMethod }: { id: string; disposalMethod?: string }) =>
      bomService.writeOffScrap(id, disposalMethod),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.scrapList] }),
  });
}

// ─── Reports ───

export function useProductionReport(params?: Record<string, any>) {
  return useQuery({
    queryKey: [KEYS.productionReport, params],
    queryFn: () => bomService.productionReport(params),
  });
}

export function useConsumptionReport(params?: Record<string, any>) {
  return useQuery({
    queryKey: [KEYS.consumptionReport, params],
    queryFn: () => bomService.consumptionReport(params),
  });
}

export function useCostingReport(formulaId: string) {
  return useQuery({
    queryKey: [KEYS.costingReport, formulaId],
    queryFn: () => bomService.costingReport(formulaId),
    enabled: !!formulaId,
  });
}

export function useYieldReport(params?: Record<string, any>) {
  return useQuery({
    queryKey: [KEYS.yieldReport, params],
    queryFn: () => bomService.yieldReport(params),
  });
}
