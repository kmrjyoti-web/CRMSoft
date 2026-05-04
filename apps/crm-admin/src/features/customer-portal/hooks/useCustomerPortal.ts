'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as svc from '../services/customer-portal.service';
import type {
  ActivatePortalDto,
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  UpdatePortalUserDto,
} from '../types/customer-portal.types';

// ── Query Keys ────────────────────────────────────────────────────────────────

export const PORTAL_KEYS = {
  eligible: ['portal-eligible'] as const,
  users: ['portal-users'] as const,
  user: (id: string) => ['portal-user', id] as const,
  categories: ['portal-menu-categories'] as const,
  routes: ['portal-routes'] as const,
  analytics: ['portal-analytics'] as const,
};

// ── Eligible Entities ─────────────────────────────────────────────────────────

export function useEligibleEntities() {
  return useQuery({
    queryKey: PORTAL_KEYS.eligible,
    queryFn: svc.getEligibleEntities,
  });
}

// ── Activation ────────────────────────────────────────────────────────────────

export function useActivatePortal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ActivatePortalDto) => svc.activatePortal(dto),
    onSuccess: (res) => {
      const pw = res.data?.temporaryPassword;
      toast.success(pw ? `Portal activated! Temp password: ${pw}` : 'Portal activated!');
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.eligible });
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.users });
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.analytics });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Activation failed'),
  });
}

// ── Portal Users ──────────────────────────────────────────────────────────────

export function usePortalUsers() {
  return useQuery({
    queryKey: PORTAL_KEYS.users,
    queryFn: svc.listPortalUsers,
  });
}

export function usePortalUser(id: string) {
  return useQuery({
    queryKey: PORTAL_KEYS.user(id),
    queryFn: () => svc.getPortalUser(id),
    enabled: !!id,
  });
}

export function useUpdatePortalUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePortalUserDto }) =>
      svc.updatePortalUser(id, dto),
    onSuccess: (_, { id }) => {
      toast.success('User updated');
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.users });
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.user(id) });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Update failed'),
  });
}

export function useUpdatePageOverrides() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, overrides }: { id: string; overrides: Record<string, boolean> }) =>
      svc.updatePageOverrides(id, overrides),
    onSuccess: (_, { id }) => {
      toast.success('Page overrides saved');
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.user(id) });
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.users });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Save failed'),
  });
}

export function useResetPortalPassword() {
  return useMutation({
    mutationFn: (id: string) => svc.resetPortalPassword(id),
    onSuccess: (res) => {
      const pw = res.data?.temporaryPassword;
      toast.success(pw ? `New password: ${pw}` : 'Password reset — credentials sent');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Reset failed'),
  });
}

export function useDeactivatePortalUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deactivatePortalUser(id),
    onSuccess: () => {
      toast.success('Portal user deactivated');
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.users });
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.eligible });
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.analytics });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Deactivation failed'),
  });
}

// ── Menu Categories ───────────────────────────────────────────────────────────

export function useMenuCategories() {
  return useQuery({
    queryKey: PORTAL_KEYS.categories,
    queryFn: svc.listMenuCategories,
  });
}

export function useCreateMenuCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMenuCategoryDto) => svc.createMenuCategory(dto),
    onSuccess: () => {
      toast.success('Menu category created');
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.categories });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Creation failed'),
  });
}

export function useUpdateMenuCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMenuCategoryDto }) =>
      svc.updateMenuCategory(id, dto),
    onSuccess: () => {
      toast.success('Category updated');
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.categories });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Update failed'),
  });
}

export function useDeleteMenuCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteMenuCategory(id),
    onSuccess: () => {
      toast.success('Category deleted');
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.categories });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || 'Delete failed — category may have assigned users'),
  });
}

// ── Available Routes ──────────────────────────────────────────────────────────

export function useAvailableRoutes() {
  return useQuery({
    queryKey: PORTAL_KEYS.routes,
    queryFn: svc.getAvailableRoutes,
    staleTime: 60 * 60 * 1000,
  });
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export function usePortalAnalytics() {
  return useQuery({
    queryKey: PORTAL_KEYS.analytics,
    queryFn: svc.getPortalAnalytics,
  });
}

// ── Seed Defaults ─────────────────────────────────────────────────────────────

export function useSeedDefaultCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.seedDefaultCategories,
    onSuccess: () => {
      toast.success('Default categories seeded');
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.categories });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Seed failed'),
  });
}
