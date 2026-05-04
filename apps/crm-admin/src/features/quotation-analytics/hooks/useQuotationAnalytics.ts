import { useQuery } from "@tanstack/react-query";
import * as svc from "../services/quotation-analytics.service";
import type { AnalyticsFilters } from "../types/quotation-analytics.types";

const KEY = "quotation-analytics";

export function useQuotationOverview(params?: AnalyticsFilters) {
  return useQuery({
    queryKey: [KEY, "overview", params],
    queryFn: () => svc.getOverview(params),
  });
}

export function useConversionFunnel(params?: AnalyticsFilters) {
  return useQuery({
    queryKey: [KEY, "conversion", params],
    queryFn: () => svc.getConversion(params),
  });
}

export function useIndustryAnalytics(params?: AnalyticsFilters) {
  return useQuery({
    queryKey: [KEY, "industry", params],
    queryFn: () => svc.getIndustryAnalytics(params),
  });
}

export function useProductAnalytics(params?: AnalyticsFilters) {
  return useQuery({
    queryKey: [KEY, "products", params],
    queryFn: () => svc.getProductAnalytics(params),
  });
}

export function useBestQuotations(params?: { limit?: number } & AnalyticsFilters) {
  return useQuery({
    queryKey: [KEY, "best", params],
    queryFn: () => svc.getBestQuotations(params),
  });
}

export function useQuotationComparison(ids: string[]) {
  return useQuery({
    queryKey: [KEY, "comparison", ids],
    queryFn: () => svc.getComparison(ids),
    enabled: ids.length >= 2,
  });
}
