import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  installationService,
  trainingService,
  ticketService,
} from "../services/post-sales.service";

import type {
  InstallationCreateData,
  InstallationUpdateData,
  InstallationListParams,
  TrainingCreateData,
  TrainingUpdateData,
  TrainingListParams,
  TicketCreateData,
  TicketUpdateData,
  TicketListParams,
  AssignTicketData,
  ResolveTicketData,
  AddCommentData,
} from "../types/post-sales.types";

const INSTALLATIONS_KEY = "installations";
const TRAININGS_KEY = "trainings";
const TICKETS_KEY = "tickets";

// ---------------------------------------------------------------------------
// Installation hooks
// ---------------------------------------------------------------------------

export function useInstallationsList(params?: InstallationListParams) {
  return useQuery({
    queryKey: [INSTALLATIONS_KEY, params],
    queryFn: () => installationService.getAll(params).then((r) => r.data),
  });
}

export function useInstallationDetail(id: string) {
  return useQuery({
    queryKey: [INSTALLATIONS_KEY, id],
    queryFn: () => installationService.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateInstallation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InstallationCreateData) =>
      installationService.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INSTALLATIONS_KEY] }),
  });
}

export function useUpdateInstallation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InstallationUpdateData }) =>
      installationService.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INSTALLATIONS_KEY] }),
  });
}

export function useStartInstallation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => installationService.start(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INSTALLATIONS_KEY] }),
  });
}

export function useCompleteInstallation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => installationService.complete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INSTALLATIONS_KEY] }),
  });
}

export function useCancelInstallation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => installationService.cancel(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INSTALLATIONS_KEY] }),
  });
}

// ---------------------------------------------------------------------------
// Training hooks
// ---------------------------------------------------------------------------

export function useTrainingsList(params?: TrainingListParams) {
  return useQuery({
    queryKey: [TRAININGS_KEY, params],
    queryFn: () => trainingService.getAll(params).then((r) => r.data),
  });
}

export function useTrainingDetail(id: string) {
  return useQuery({
    queryKey: [TRAININGS_KEY, id],
    queryFn: () => trainingService.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TrainingCreateData) =>
      trainingService.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TRAININGS_KEY] }),
  });
}

export function useUpdateTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TrainingUpdateData }) =>
      trainingService.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TRAININGS_KEY] }),
  });
}

export function useStartTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trainingService.start(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TRAININGS_KEY] }),
  });
}

export function useCompleteTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trainingService.complete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TRAININGS_KEY] }),
  });
}

export function useCancelTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trainingService.cancel(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TRAININGS_KEY] }),
  });
}

// ---------------------------------------------------------------------------
// Ticket hooks
// ---------------------------------------------------------------------------

export function useTicketsList(params?: TicketListParams) {
  return useQuery({
    queryKey: [TICKETS_KEY, params],
    queryFn: () => ticketService.getAll(params).then((r) => r.data),
  });
}

export function useTicketDetail(id: string) {
  return useQuery({
    queryKey: [TICKETS_KEY, id],
    queryFn: () => ticketService.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TicketCreateData) =>
      ticketService.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TicketUpdateData }) =>
      ticketService.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });
}

export function useAssignTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignTicketData }) =>
      ticketService.assign(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });
}

export function useResolveTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResolveTicketData }) =>
      ticketService.resolve(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });
}

export function useCloseTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketService.close(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });
}

export function useReopenTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketService.reopen(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddCommentData }) =>
      ticketService.addComment(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });
}
