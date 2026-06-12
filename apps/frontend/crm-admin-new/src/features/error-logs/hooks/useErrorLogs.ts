import { useQuery } from '@tanstack/react-query';
import * as errorLogService from '../services/error-log.service';

export function useErrorLogs(params?: {
  page?: number;
  limit?: number;
  severity?: string;
}) {
  return useQuery({
    queryKey: ['tenant-error-logs', params],
    queryFn: () => errorLogService.getErrorLogs(params),
  });
}

export function useErrorStats() {
  return useQuery({
    queryKey: ['tenant-error-stats'],
    queryFn: () => errorLogService.getErrorStats(),
  });
}
