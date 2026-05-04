import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../services/subscription.service';

const KEY = 'subscription';

export function useCurrentSubscription() {
  return useQuery({
    queryKey: [KEY, 'current'],
    queryFn: () => subscriptionService.getCurrent(),
  });
}

export function useLimitsWithUsage() {
  return useQuery({
    queryKey: [KEY, 'limits'],
    queryFn: () => subscriptionService.getLimitsWithUsage(),
  });
}

export function useUsageDetail() {
  return useQuery({
    queryKey: [KEY, 'usage-detail'],
    queryFn: () => subscriptionService.getUsageDetail(),
  });
}

export function useAvailablePlans() {
  return useQuery({
    queryKey: [KEY, 'plans'],
    queryFn: () => subscriptionService.getPlans(),
  });
}

export function useTenantInvoices() {
  return useQuery({
    queryKey: [KEY, 'invoices'],
    queryFn: () => subscriptionService.getInvoices(),
  });
}

export function useChangePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (newPlanId: string) => subscriptionService.changePlan(newPlanId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionService.cancel(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
