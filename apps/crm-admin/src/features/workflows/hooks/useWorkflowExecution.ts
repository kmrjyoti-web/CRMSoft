import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { leadWorkflowService } from "../services/workflow-execution.service";

const WF_KEY = "lead-workflow";

export function useLeadWorkflowStatus(leadId: string) {
  return useQuery({
    queryKey: [WF_KEY, "status", leadId],
    queryFn: () => leadWorkflowService.getStatus(leadId),
    enabled: !!leadId,
  });
}

export function useLeadWorkflowTransitions(leadId: string) {
  return useQuery({
    queryKey: [WF_KEY, "transitions", leadId],
    queryFn: () => leadWorkflowService.getTransitions(leadId),
    enabled: !!leadId,
  });
}

export function useExecuteLeadTransition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      transitionCode,
      comment,
    }: {
      leadId: string;
      transitionCode: string;
      comment?: string;
    }) => leadWorkflowService.executeTransition(leadId, transitionCode, comment),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [WF_KEY, "status", variables.leadId] });
      qc.invalidateQueries({ queryKey: [WF_KEY, "transitions", variables.leadId] });
      qc.invalidateQueries({ queryKey: [WF_KEY, "history", variables.leadId] });
      qc.invalidateQueries({ queryKey: ["leads", variables.leadId] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useLeadWorkflowHistory(leadId: string) {
  return useQuery({
    queryKey: [WF_KEY, "history", leadId],
    queryFn: () => leadWorkflowService.getHistory(leadId),
    enabled: !!leadId,
  });
}
