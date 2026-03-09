"use client";

import { useMemo, useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { Button, Icon, Badge, TableFull } from "@/components/ui";

import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { useConfirmDialog } from "@/components/common/useConfirmDialog";

import { useSidePanelStore } from "@/stores/side-panel.store";

import {
  useLookupDetail,
  useDeactivateLookup,
  useAddLookupValue,
  useUpdateLookupValue,
  useDeactivateLookupValue,
} from "../hooks/useLookups";

import { LookupForm } from "./LookupForm";
import { LookupValueForm } from "./LookupValueForm";

import type { LookupValueItem } from "../types/lookup.types";

// ── Value table columns ─────────────────────────────────

const VALUE_COLUMNS = [
  { id: "rowIndex", label: "#", visible: true },
  { id: "value", label: "Value Code", visible: true },
  { id: "label", label: "Label", visible: true },
  { id: "icon", label: "Icon", visible: true },
  { id: "color", label: "Color", visible: true },
  { id: "isDefault", label: "Default", visible: true },
  { id: "status", label: "Status", visible: true },
];

// ── Helpers ─────────────────────────────────────────────

function flattenValues(values: LookupValueItem[]): Record<string, unknown>[] {
  return values.map((v) => ({
    id: v.id,
    rowIndex: v.rowIndex,
    value: v.value,
    label: v.label,
    icon: v.icon ?? "—",
    color: v.color ? (
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block w-3 h-3 rounded-full border border-gray-200"
          style={{ backgroundColor: v.color }}
        />
        {v.color}
      </span>
    ) : "—",
    isDefault: v.isDefault ? "Yes" : "No",
    status: v.isActive ? "Active" : "Inactive",
    _raw: v,
  }));
}

// ── Props ───────────────────────────────────────────────

interface LookupDetailProps {
  lookupId: string;
}

// ── Component ───────────────────────────────────────────

export function LookupDetail({ lookupId }: LookupDetailProps) {
  const router = useRouter();
  const openPanel = useSidePanelStore((s) => s.openPanel);
  const closePanel = useSidePanelStore((s) => s.closePanel);
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();

  const { data, isLoading, error } = useLookupDetail(lookupId);
  const deactivateMutation = useDeactivateLookup();
  const addValueMutation = useAddLookupValue();
  const updateValueMutation = useUpdateLookupValue();
  const deactivateValueMutation = useDeactivateLookupValue();
  const [deactivating, setDeactivating] = useState(false);

  const lookup = useMemo(() => {
    const d = data?.data;
    if (!d) return null;
    if (typeof d === "object" && "data" in d) {
      return (d as unknown as { data: typeof d }).data;
    }
    return d;
  }, [data]);

  const tableData = useMemo(
    () => flattenValues(lookup?.values ?? []),
    [lookup],
  );

  const handleDeactivate = useCallback(async () => {
    if (!lookup || lookup.isSystem) return;
    setDeactivating(true);
    try {
      await deactivateMutation.mutateAsync(lookupId);
      toast.success("Lookup deactivated");
      router.push("/settings/lookups");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to deactivate lookup";
      toast.error(message);
    } finally {
      setDeactivating(false);
    }
  }, [lookup, lookupId, deactivateMutation, router]);

  // ── Edit Lookup metadata (side panel) ──────────────────
  const handleEditLookup = useCallback(() => {
    if (!lookup) return;
    const panelId = `lookup-edit-${lookupId}`;
    const formId = `sp-form-lookup-${lookupId}`;
    openPanel({
      id: panelId,
      title: `Edit: ${lookup.displayName}`,
      footerButtons: [
        {
          id: "cancel",
          label: "Cancel",
          showAs: "text",
          variant: "secondary",
          onClick: () => closePanel(panelId),
        },
        {
          id: "save",
          label: "Save Changes",
          icon: "check",
          showAs: "both",
          variant: "primary",
          onClick: () => {
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
      content: (
        <LookupForm
          lookupId={lookupId}
          mode="panel"
          panelId={panelId}
          onSuccess={() => closePanel(panelId)}
          onCancel={() => closePanel(panelId)}
        />
      ),
    });
  }, [lookup, lookupId, openPanel, closePanel]);

  // ── Add Value (side panel) ─────────────────────────────
  const handleCreateValue = useCallback(() => {
    if (!lookup) return;
    const panelId = "lookup-value-new";
    const formId = `sp-form-${panelId}`;
    openPanel({
      id: panelId,
      title: `Add Value to ${lookup.displayName}`,
      footerButtons: [
        {
          id: "cancel",
          label: "Cancel",
          showAs: "text",
          variant: "secondary",
          onClick: () => closePanel(panelId),
        },
        {
          id: "save",
          label: "Save",
          icon: "check",
          showAs: "both",
          variant: "primary",
          onClick: () => {
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
      content: (
        <LookupValueForm
          category={lookup.category}
          panelId={panelId}
          onSubmit={async (values) => {
            await addValueMutation.mutateAsync({ lookupId, data: values });
            toast.success("Value added");
            closePanel(panelId);
          }}
          onCancel={() => closePanel(panelId)}
        />
      ),
    });
  }, [lookup, lookupId, openPanel, closePanel, addValueMutation]);

  // ── Edit Value (side panel) ────────────────────────────
  const handleRowEdit = useCallback(
    (row: Record<string, unknown>) => {
      if (!lookup) return;
      const rawValue = row._raw as LookupValueItem;
      const panelId = `lookup-value-edit-${rawValue.id}`;
      const formId = `sp-form-${panelId}`;
      openPanel({
        id: panelId,
        title: `Edit Value: ${rawValue.label}`,
        footerButtons: [
          {
            id: "cancel",
            label: "Cancel",
            showAs: "text",
            variant: "secondary",
            onClick: () => closePanel(panelId),
          },
          {
            id: "save",
            label: "Save Changes",
            icon: "check",
            showAs: "both",
            variant: "primary",
            onClick: () => {
              const form = document.getElementById(formId) as HTMLFormElement | null;
              form?.requestSubmit();
            },
          },
        ],
        content: (
          <LookupValueForm
            category={lookup.category}
            panelId={panelId}
            initialData={rawValue}
            onSubmit={async (values) => {
              await updateValueMutation.mutateAsync({
                valueId: rawValue.id,
                data: values,
              });
              toast.success("Value updated");
              closePanel(panelId);
            }}
            onCancel={() => closePanel(panelId)}
          />
        ),
      });
    },
    [lookup, openPanel, closePanel, updateValueMutation],
  );

  // ── Delete Value (confirm dialog) ──────────────────────
  const handleRowDelete = useCallback(
    async (row: Record<string, unknown>) => {
      const ok = await confirm({
        title: "Deactivate Value",
        message: `Deactivate "${row.label}"? It will no longer appear in dropdowns.`,
        type: "danger",
        confirmText: "Deactivate",
      });
      if (!ok) return;
      try {
        await deactivateValueMutation.mutateAsync(row.id as string);
        toast.success("Value deactivated");
      } catch {
        toast.error("Failed to deactivate value");
      }
    },
    [confirm, deactivateValueMutation],
  );

  if (isLoading) return <LoadingSpinner fullPage />;

  if (error || !lookup) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-1">Failed to load lookup</p>
          <p className="text-sm text-gray-500">
            {error ? (error as Error).message : "Lookup not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="shrink-0 px-4 py-3 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">{lookup.displayName}</h1>
            <span className="text-xs text-gray-400 font-mono">{lookup.category}</span>
            <Badge variant={lookup.isSystem ? "warning" : "secondary"}>
              {lookup.isSystem ? "System" : "Custom"}
            </Badge>
            <Badge variant={lookup.isActive ? "success" : "danger"}>
              {lookup.isActive ? "Active" : "Inactive"}
            </Badge>
            {lookup.description && (
              <span className="text-sm text-gray-500 hidden sm:inline">— {lookup.description}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEditLookup}>
              <Icon name="edit" size={14} /> Edit
            </Button>
            {!lookup.isSystem && lookup.isActive && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeactivate}
                loading={deactivating}
                disabled={deactivating}
              >
                <Icon name="trash-2" size={14} /> Deactivate
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => router.push("/settings/lookups")}>
              <Icon name="arrow-left" size={14} /> Back
            </Button>
          </div>
        </div>
      </div>

      {/* Values Table — fills remaining height */}
      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData as Record<string, any>[]}
          title={`Values (${lookup.values?.length ?? 0})`}
          tableKey={`lookup-values-${lookupId}`}
          columns={VALUE_COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
          onRowEdit={handleRowEdit}
          onRowDelete={handleRowDelete}
          onCreate={handleCreateValue}
        />
      </div>

      <ConfirmDialogPortal />
    </div>
  );
}
