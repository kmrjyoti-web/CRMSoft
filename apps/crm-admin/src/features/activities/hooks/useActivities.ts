import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { activitiesService } from "../services/activities.service";

import type {
  ActivityListParams,
  ActivityCreateData,
  ActivityUpdateData,
  ActivityCompleteData,
} from "../types/activities.types";

const KEY = "activities";

export function useActivitiesList(params?: ActivityListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => activitiesService.getAll(params),
  });
}

export function useActivityDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => activitiesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ActivityCreateData) => activitiesService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ActivityUpdateData }) =>
      activitiesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCompleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ActivityCompleteData;
    }) => activitiesService.complete(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activitiesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useEntityActivities(entityType: string, entityId: string) {
  return useQuery({
    queryKey: [KEY, "entity", entityType, entityId],
    queryFn: () => activitiesService.getByEntity(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useDeactivateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activitiesService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useReactivateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activitiesService.reactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSoftDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activitiesService.softDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["recycle-bin"] });
    },
  });
}

export function useRestoreActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activitiesService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["recycle-bin"] });
    },
  });
}

export function usePermanentDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activitiesService.permanentDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recycle-bin"] }),
  });
}
