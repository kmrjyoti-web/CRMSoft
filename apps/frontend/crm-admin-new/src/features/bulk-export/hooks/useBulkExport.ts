import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/bulk-export.service";
import type { CreateExportDto } from "../types/bulk-export.types";

const KEY = "export-jobs";

export function useExportJobs(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => svc.listExportJobs(params),
  });
}

export function useExportJob(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => svc.getExportJob(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      return status === "PENDING" || status === "PROCESSING" ? 3000 : false;
    },
  });
}

export function useCreateExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateExportDto) => svc.createExport(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDownloadExport() {
  return useMutation({
    mutationFn: (id: string) => svc.downloadExport(id),
  });
}
