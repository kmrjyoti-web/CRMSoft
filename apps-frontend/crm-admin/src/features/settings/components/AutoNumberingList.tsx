"use client";

import { useMemo } from "react";

import { TableFull } from "@/components/ui";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useEntityPanel } from "@/hooks/useEntityPanel";

import { useAutoNumberSequences } from "../hooks/useAutoNumbering";
import { AutoNumberingEditForm } from "./AutoNumberingEditForm";

import type { AutoNumberSequence } from "../types/auto-numbering.types";

// ── Column definitions ───────────────────────────────────

const COLUMNS = [
  { id: "entityName",      label: "Entity",          visible: true },
  { id: "prefix",          label: "Prefix",          visible: true },
  { id: "formatPattern",   label: "Format Pattern",  visible: true },
  { id: "sampleNumber",    label: "Sample Number",   visible: true },
  { id: "currentSequence", label: "Current Seq",     visible: true },
  { id: "resetPolicy",     label: "Reset Policy",    visible: true },
  { id: "status",          label: "Status",          visible: true },
  { id: "seqPadding",      label: "Seq Padding",     visible: false },
  { id: "startFrom",       label: "Start From",      visible: false },
  { id: "incrementBy",     label: "Increment By",    visible: false },
  { id: "lastResetAt",     label: "Last Reset",      visible: false },
];

// ── Flatten helper ───────────────────────────────────────

function flattenSequences(items: AutoNumberSequence[]): Record<string, unknown>[] {
  return items.map((seq) => ({
    id: seq.entityName,
    entityName: seq.entityName,
    prefix: seq.prefix,
    formatPattern: seq.formatPattern,
    sampleNumber: seq.sampleNumber ?? "\u2014",
    currentSequence: seq.currentSequence,
    resetPolicy: seq.resetPolicy,
    status: seq.isActive ? "Active" : "Inactive",
    seqPadding: seq.seqPadding,
    startFrom: seq.startFrom,
    incrementBy: seq.incrementBy,
    lastResetAt: seq.lastResetAt ? new Date(seq.lastResetAt).toLocaleString() : "\u2014",
  }));
}

// ── Component ────────────────────────────────────────────

export function AutoNumberingList() {
  const { data: response, isLoading } = useAutoNumberSequences();

  const { handleRowEdit } = useEntityPanel({
    entityKey: "auto-number",
    entityLabel: "Auto Number",
    FormComponent: AutoNumberingEditForm,
    idProp: "entityName",
    editRoute: "/settings/auto-numbering/:id",
    createRoute: "/settings/auto-numbering/new",
    displayField: "entityName",
    panelWidth: 600,
  });

  const items = useMemo<AutoNumberSequence[]>(() => {
    const raw = (response as any)?.data;
    if (Array.isArray(raw)) return raw;
    const nested = raw as unknown as { data?: AutoNumberSequence[] };
    return nested?.data ?? [];
  }, [response]);

  const tableData = useMemo(() => flattenSequences(items), [items]);

  if (isLoading) return <TableSkeleton title="Auto Numbering" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, unknown>[]}
        title="Auto Numbering"
        tableKey="auto-numbering"
        columns={COLUMNS}
        defaultViewMode="table"
        defaultDensity="comfortable"
        onRowEdit={handleRowEdit}
      />
    </div>
  );
}
