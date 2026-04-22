"use client";

import { useState, useCallback } from "react";

import { Icon, Button, Modal, SelectInput } from "@/components/ui";

import { useCreateExport } from "../hooks/useBulkExport";

import type { ExportFormat } from "../types/bulk-export.types";

// ── Constants ───────────────────────────────────────────

const FORMAT_OPTIONS = [
  { label: "CSV (.csv)", value: "CSV" },
  { label: "Excel (.xlsx)", value: "XLSX" },
];

// ── Props ───────────────────────────────────────────────

interface ExportConfigModalProps {
  open: boolean;
  onClose: () => void;
  entityType: string;
}

// ── Component ───────────────────────────────────────────

export function ExportConfigModal({
  open,
  onClose,
  entityType,
}: ExportConfigModalProps) {
  const [format, setFormat] = useState<ExportFormat>("CSV");
  const createExport = useCreateExport();

  const handleExport = useCallback(() => {
    createExport.mutate(
      { targetEntity: entityType, format },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  }, [createExport, entityType, format, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export Data"
      size="sm"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 20 }}>
        {/* Entity info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: 12,
            background: "#f0f9ff",
            borderRadius: 8,
            border: "1px solid #bae6fd",
          }}
        >
          <Icon name="info" size={16} color="#0ea5e9" />
          <span style={{ fontSize: 13, color: "#0c4a6e" }}>
            Export all records matching current filters for{" "}
            <strong>{entityType}</strong>.
          </span>
        </div>

        {/* Format select */}
        <SelectInput
          label="Export Format"
          leftIcon={<Icon name="file" size={16} />}
          options={FORMAT_OPTIONS}
          value={format}
          onChange={(v) => setFormat(v as ExportFormat)}
        />

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            borderTop: "1px solid #e5e7eb",
            paddingTop: 16,
          }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createExport.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={createExport.isPending}>
            <Icon name="download" size={14} />
            {createExport.isPending ? "Starting..." : "Start Export"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
