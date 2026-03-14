import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyProfileService } from '../services/company-profile.service';

const QK = ['company-profile'];

export function useCompanyProfile() {
  return useQuery({ queryKey: QK, queryFn: companyProfileService.get, staleTime: 30000 });
}

export function useUpdateCompanyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => companyProfileService.update(data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueryData(QK);
      qc.setQueryData(QK, (old: any) => ({ ...old, ...data }));
      return { prev };
    },
    onError: (_err, _data, ctx: any) => {
      if (ctx?.prev) qc.setQueryData(QK, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
