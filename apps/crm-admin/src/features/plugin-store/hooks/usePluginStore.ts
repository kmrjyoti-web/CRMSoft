import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/plugin-store.service";
import type {
  InstallPluginDto,
  UpdateCredentialsDto,
  UpdateSettingsDto,
  PluginFilters,
} from "../types/plugin-store.types";

const KEYS = {
  catalog: "plugin-catalog",
  installed: "plugins-installed",
  logs: "plugin-logs",
  health: "plugin-health",
  usage: "plugin-usage",
};

// ── Catalog ──────────────────────────────────────────────────────────

export function usePluginCatalog(filters?: PluginFilters) {
  return useQuery({ queryKey: [KEYS.catalog, filters], queryFn: () => svc.getCatalog(filters) });
}

export function usePluginCatalogItem(code: string) {
  return useQuery({ queryKey: [KEYS.catalog, code], queryFn: () => svc.getCatalogItem(code), enabled: !!code });
}

// ── Installed ────────────────────────────────────────────────────────

export function useInstalledPlugins() {
  return useQuery({ queryKey: [KEYS.installed], queryFn: svc.getInstalledPlugins });
}

export function useInstalledPlugin(code: string) {
  return useQuery({ queryKey: [KEYS.installed, code], queryFn: () => svc.getInstalledPlugin(code), enabled: !!code });
}

// ── Mutations ────────────────────────────────────────────────────────

export function useInstallPlugin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, dto }: { code: string; dto: InstallPluginDto }) => svc.installPlugin(code, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEYS.installed] }); qc.invalidateQueries({ queryKey: [KEYS.catalog] }); },
  });
}

export function useUninstallPlugin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => svc.uninstallPlugin(code),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEYS.installed] }); qc.invalidateQueries({ queryKey: [KEYS.catalog] }); },
  });
}

export function useUpdatePluginCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, dto }: { code: string; dto: UpdateCredentialsDto }) => svc.updateCredentials(code, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.installed] }),
  });
}

export function useUpdatePluginSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, dto }: { code: string; dto: UpdateSettingsDto }) => svc.updateSettings(code, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.installed] }),
  });
}

export function useEnablePlugin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => svc.enablePlugin(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.installed] }),
  });
}

export function useDisablePlugin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => svc.disablePlugin(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.installed] }),
  });
}

// ── Logs ─────────────────────────────────────────────────────────────

export function usePluginLogs(code: string) {
  return useQuery({ queryKey: [KEYS.logs, code], queryFn: () => svc.getPluginLogs(code), enabled: !!code });
}

// ── Health ────────────────────────────────────────────────────────────

export function useHealthSummary() {
  return useQuery({ queryKey: [KEYS.health], queryFn: svc.getHealthSummary });
}

export function useTestConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => svc.testConnection(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.health] }),
  });
}

export function useTestCredentials() {
  return useMutation({
    mutationFn: ({ code, credentials }: { code: string; credentials: Record<string, string> }) =>
      svc.testCredentials(code, credentials),
  });
}

// ── Usage ─────────────────────────────────────────────────────────────

export function usePluginUsage() {
  return useQuery({ queryKey: [KEYS.usage], queryFn: svc.getPluginUsage });
}

// ── Check ─────────────────────────────────────────────────────────────

export function useCheckPlugin(code: string) {
  return useQuery({ queryKey: ["plugin-check", code], queryFn: () => svc.checkPlugin(code), enabled: !!code });
}
