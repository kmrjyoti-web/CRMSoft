"use client";

import { useState, useMemo, useCallback } from "react";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import toast from "react-hot-toast";

import { Input, Button, Icon, Badge, SelectInput, TableFull } from "@/components/ui";

import {
  useNotionConfig,
  useSaveNotionConfig,
  useTestNotionConnection,
  useNotionDatabases,
  useNotionEntries,
  useCreateNotionEntry,
} from "../hooks/useNotion";

import type { NotionEntry } from "../types/notion.types";

// ── Schemas ───────────────────────────────────────────────

const configSchema = z.object({
  token: z.string().min(1, "Token is required"),
  databaseId: z.string().optional(),
});

const entrySchema = z.object({
  promptNumber: z.string().min(1, "Prompt number is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["Planned", "In Progress", "Completed"]),
  filesChanged: z.string().optional(),
  testResults: z.string().optional(),
});

type ConfigFormData = z.infer<typeof configSchema>;
type EntryFormData = z.infer<typeof entrySchema>;

// ── Columns for entries table ─────────────────────────────

const ENTRY_COLUMNS = [
  { id: "date", label: "Date", visible: true },
  { id: "promptNumber", label: "Prompt", visible: true },
  { id: "title", label: "Title", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "filesChanged", label: "Files Changed", visible: true },
  { id: "testResults", label: "Test Results", visible: false },
];

function flattenEntries(entries: NotionEntry[]): Record<string, unknown>[] {
  return entries.map((e) => ({
    id: e.id,
    date: e.date,
    promptNumber: e.promptNumber,
    title: e.title,
    status: e.status,
    filesChanged: e.filesChanged,
    testResults: e.testResults,
  }));
}

// ── Component ─────────────────────────────────────────────

export function NotionSettings() {
  const [connectionStatus, setConnectionStatus] = useState<
    { success: boolean; user?: string; error?: string } | null
  >(null);
  const [selectedDbId, setSelectedDbId] = useState<string>("");

  // ── Data hooks ──────────────────────────────────────────
  const { data: configData } = useNotionConfig();
  const config = configData?.data ?? configData;

  const saveConfigMutation = useSaveNotionConfig();
  const testConnectionMutation = useTestNotionConnection();
  const createEntryMutation = useCreateNotionEntry();

  const hasToken = !!(config as any)?.tokenMasked;
  const hasDatabaseId = !!(config as any)?.databaseId;

  const { data: dbData } = useNotionDatabases(hasToken);
  const databases = Array.isArray(dbData) ? dbData : (dbData as any)?.data ?? [];

  const { data: entriesData } = useNotionEntries(hasDatabaseId);
  const entries: NotionEntry[] = useMemo(() => {
    const raw = Array.isArray(entriesData) ? entriesData : (entriesData as any)?.data ?? [];
    return raw;
  }, [entriesData]);

  const tableData = useMemo(() => flattenEntries(entries), [entries]);

  // ── Config form ─────────────────────────────────────────
  const {
    control: configControl,
    handleSubmit: handleConfigSubmit,
    formState: { errors: configErrors },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema) as any,
    defaultValues: { token: "", databaseId: "" },
  });

  const onSaveConfig = useCallback(
    async (data: ConfigFormData) => {
      try {
        await saveConfigMutation.mutateAsync({
          token: data.token,
          databaseId: data.databaseId || undefined,
        });
        toast.success("Notion config saved");
      } catch {
        toast.error("Failed to save config");
      }
    },
    [saveConfigMutation],
  );

  const onTestConnection = useCallback(async () => {
    try {
      const result = await testConnectionMutation.mutateAsync();
      const res = (result as any)?.data ?? result;
      setConnectionStatus(res);
      if (res.success) {
        toast.success(`Connected as ${res.user}`);
      } else {
        toast.error(res.error ?? "Connection failed");
      }
    } catch {
      setConnectionStatus({ success: false, error: "Connection failed" });
      toast.error("Connection failed");
    }
  }, [testConnectionMutation]);

  const onLinkDatabase = useCallback(async () => {
    if (!selectedDbId) return;
    try {
      await saveConfigMutation.mutateAsync({ token: (config as any)?.token ?? "", databaseId: selectedDbId });
      toast.success("Database linked");
    } catch {
      toast.error("Failed to link database");
    }
  }, [selectedDbId, saveConfigMutation, config]);

  // ── Entry form ──────────────────────────────────────────
  const {
    control: entryControl,
    handleSubmit: handleEntrySubmit,
    reset: resetEntry,
    formState: { errors: entryErrors },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema) as any,
    defaultValues: {
      promptNumber: "",
      title: "",
      description: "",
      status: "Completed",
      filesChanged: "",
      testResults: "",
    },
  });

  const onCreateEntry = useCallback(
    async (data: EntryFormData) => {
      try {
        await createEntryMutation.mutateAsync(data);
        toast.success("Session entry pushed to Notion");
        resetEntry();
      } catch {
        toast.error("Failed to create entry");
      }
    },
    [createEntryMutation, resetEntry],
  );

  // ── Render ──────────────────────────────────────────────

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Notion Integration</h1>
        <p className="text-sm text-gray-500">
          Connect to Notion and log development sessions to a database
        </p>
      </div>

      {/* Section 1: Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          <Icon name="settings" size={18} className="inline mr-2 text-gray-500" />
          Configuration
        </h2>

        {hasToken && (
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="outline">Token saved</Badge>
            <span className="text-xs text-gray-400">
              {(config as any)?.tokenMasked}
            </span>
          </div>
        )}

        <form onSubmit={handleConfigSubmit(onSaveConfig) as any} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Integration Token
            </label>
            <Controller
              name="token"
              control={configControl}
              render={({ field }) => (
                <Input
                  type="password"
                  placeholder="ntn_..."
                  value={field.value}
                  onChange={(val: string) => field.onChange(val)}
                  error={configErrors.token?.message}
                />
              )}
            />
            <p className="text-xs text-gray-400 mt-1">
              Generate from notion.so/my-integrations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={saveConfigMutation.isPending}
            >
              Save Token
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onTestConnection}
              disabled={testConnectionMutation.isPending}
            >
              <Icon name="wifi" size={14} /> Test Connection
            </Button>

            {connectionStatus && (
              <Badge variant={connectionStatus.success ? "success" : "danger"}>
                {connectionStatus.success
                  ? `Connected: ${connectionStatus.user}`
                  : connectionStatus.error}
              </Badge>
            )}
          </div>
        </form>

        {/* Database selection */}
        {hasToken && databases.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Database
            </label>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <SelectInput
                  label="Select Database"
                  options={databases.map((db: any) => ({
                    label: db.title,
                    value: db.id,
                  }))}
                  value={selectedDbId || (config as any)?.databaseId || ""}
                  onChange={(val) => setSelectedDbId(String(val ?? ""))}
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={onLinkDatabase}
                disabled={!selectedDbId}
              >
                Link Database
              </Button>
            </div>
            {hasDatabaseId && (
              <p className="text-xs text-green-600 mt-1">
                <Icon name="check-circle" size={12} className="inline mr-1" />
                Database linked: {(config as any)?.databaseId?.slice(0, 8)}...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Section 2: Add Session Entry */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          <Icon name="plus-circle" size={18} className="inline mr-2 text-gray-500" />
          Push Session Entry
        </h2>

        <form onSubmit={handleEntrySubmit(onCreateEntry) as any} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Controller
                name="promptNumber"
                control={entryControl}
                render={({ field }) => (
                  <Input
                    label="Prompt Number"
                    placeholder="P16"
                    value={field.value}
                    onChange={(val: string) => field.onChange(val)}
                    error={entryErrors.promptNumber?.message}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="title"
                control={entryControl}
                render={({ field }) => (
                  <Input
                    label="Title"
                    placeholder="Notion Integration"
                    value={field.value}
                    onChange={(val: string) => field.onChange(val)}
                    error={entryErrors.title?.message}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="status"
                control={entryControl}
                render={({ field }) => (
                  <SelectInput
                    label="Status"
                    options={[
                      { label: "Planned", value: "Planned" },
                      { label: "In Progress", value: "In Progress" },
                      { label: "Completed", value: "Completed" },
                    ]}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                  />
                )}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Controller
              name="description"
              control={entryControl}
              render={({ field }) => (
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="What was done in this session..."
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Files Changed
              </label>
              <Controller
                name="filesChanged"
                control={entryControl}
                render={({ field }) => (
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="List of files created/modified..."
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Results
              </label>
              <Controller
                name="testResults"
                control={entryControl}
                render={({ field }) => (
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="e.g., 373 tests, 70 suites, all pass"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={createEntryMutation.isPending || !hasDatabaseId}
          >
            <Icon name="upload" size={14} />
            {createEntryMutation.isPending ? "Pushing..." : "Push to Notion"}
          </Button>

          {!hasDatabaseId && (
            <p className="text-xs text-amber-600">
              <Icon name="alert-triangle" size={12} className="inline mr-1" />
              Link a database first before pushing entries.
            </p>
          )}
        </form>
      </div>

      {/* Section 3: Session Log Table */}
      {hasDatabaseId && entries.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">
              <Icon name="list" size={18} className="inline mr-2 text-gray-500" />
              Session Log ({entries.length} entries)
            </h2>
          </div>
          <div style={{ height: 400 }}>
            <TableFull
              data={tableData as Record<string, any>[]}
              title="Sessions"
              columns={ENTRY_COLUMNS}
              defaultViewMode="table"
              defaultDensity="compact"
            />
          </div>
        </div>
      )}
    </div>
  );
}
