import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { tourPlansService } from "../services/tour-plans.service";

import type {
  TourPlanListParams,
  TourPlanCreateData,
  TourPlanUpdateData,
  TourPlanRejectData,
  VisitCheckInData,
  VisitCheckOutData,
} from "../types/tour-plans.types";

const KEY = "tour-plans";

export function useTourPlansList(params?: TourPlanListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => tourPlansService.getAll(params),
  });
}

export function useTourPlanDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => tourPlansService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTourPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TourPlanCreateData) => tourPlansService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateTourPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TourPlanUpdateData }) =>
      tourPlansService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSubmitTourPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tourPlansService.submit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useApproveTourPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tourPlansService.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRejectTourPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: TourPlanRejectData;
    }) => tourPlansService.reject(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCancelTourPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tourPlansService.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useVisitCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitId,
      data,
    }: {
      visitId: string;
      data: VisitCheckInData;
    }) => tourPlansService.visitCheckIn(visitId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useVisitCheckOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitId,
      data,
    }: {
      visitId: string;
      data: VisitCheckOutData;
    }) => tourPlansService.visitCheckOut(visitId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
