import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { tasksService } from "../services/tasks.service";
import type { TaskListParams, TaskCreateData, TaskUpdateData } from "../types/tasks.types";

const TASKS_KEY = "tasks";

export function useTasksList(params?: TaskListParams) {
  return useQuery({
    queryKey: [TASKS_KEY, "list", params],
    queryFn: () => tasksService.getAll(params),
  });
}

export function useMyTasks(params?: TaskListParams) {
  return useQuery({
    queryKey: [TASKS_KEY, "my", params],
    queryFn: () => tasksService.getMy(params),
  });
}

export function useTaskDetail(id: string) {
  return useQuery({
    queryKey: [TASKS_KEY, "detail", id],
    queryFn: () => tasksService.getById(id),
    enabled: !!id,
  });
}

export function useTaskStats() {
  return useQuery({
    queryKey: [TASKS_KEY, "stats"],
    queryFn: () => tasksService.getStats(),
    staleTime: 60_000,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskCreateData) => tasksService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      toast.success("Task created");
    },
    onError: () => toast.error("Failed to create task"),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaskUpdateData }) =>
      tasksService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      toast.success("Task updated");
    },
    onError: () => toast.error("Failed to update task"),
  });
}

export function useChangeTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      tasksService.changeStatus(id, status, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes, actualMinutes }: { id: string; notes?: string; actualMinutes?: number }) =>
      tasksService.complete(id, notes, actualMinutes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      toast.success("Task completed");
    },
    onError: () => toast.error("Failed to complete task"),
  });
}

export function useApproveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksService.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      toast.success("Task approved");
    },
    onError: () => toast.error("Failed to approve task"),
  });
}

export function useRejectTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      tasksService.reject(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      toast.success("Task rejected");
    },
    onError: () => toast.error("Failed to reject task"),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      toast.success("Task deleted");
    },
    onError: () => toast.error("Failed to delete task"),
  });
}
