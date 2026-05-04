import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { whatsappConfigService } from '../services/whatsapp-config.service';

import type {
  WABASetupPayload,
  WABAUpdatePayload,
} from '../types/whatsapp-config.types';

const KEY = 'whatsapp-config';

export function useWABAConfig(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => whatsappConfigService.getConfig(id),
    enabled: !!id,
  });
}

export function useSetupWABA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WABASetupPayload) => whatsappConfigService.setup(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateWABA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WABAUpdatePayload }) =>
      whatsappConfigService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
