import { useQuery } from "@tanstack/react-query";
import * as svc from "../services/email-tracking.service";
import type { EmailTrackingFilters } from "../types/email-tracking.types";

const KEYS = {
  events: "email-tracking-events",
  summary: "email-tracking-summary",
};

export function useTrackingEvents(filters?: EmailTrackingFilters) {
  return useQuery({ queryKey: [KEYS.events, filters], queryFn: () => svc.getTrackingEvents(filters) });
}

export function useTrackingSummary(filters?: { fromDate?: string; toDate?: string }) {
  return useQuery({ queryKey: [KEYS.summary, filters], queryFn: () => svc.getTrackingSummary(filters) });
}

export function useEmailEvents(emailId: string) {
  return useQuery({ queryKey: [KEYS.events, emailId], queryFn: () => svc.getEmailEvents(emailId), enabled: !!emailId });
}
