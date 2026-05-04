import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { securityService } from '../services/security.service';
import type { CreateIpRuleDto } from '../types/security.types';

const KEY = 'security-ip-rules';

export function useIpRules() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => securityService.listIpRules(),
  });
}

export function useAddIpRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateIpRuleDto) => securityService.addIpRule(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRemoveIpRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => securityService.removeIpRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
