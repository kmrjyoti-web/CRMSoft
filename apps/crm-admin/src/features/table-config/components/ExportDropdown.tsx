"use client";

import { useState, useRef, useEffect } from "react";

import { Button, Icon } from "@/components/ui";

import type { ExportFormat } from "../utils/export-utils";

const EXPORT_OPTIONS: { format: ExportFormat; label: string; icon: string }[] = [
  { format: "pdf", label: "Export as PDF", icon: "download" },
  { format: "excel", label: "Export as Excel", icon: "file-spreadsheet" },
  { format: "csv", label: "Export as CSV", icon: "file-text" },
  { format: "json", label: "Export as JSON", icon: "file-json" },
];

interface ExportDropdownProps {
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
}

export function ExportDropdown({ onExport, disabled }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        title="Export data"
      >
        <Icon name="download" size={16} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          {EXPORT_OPTIONS.map((opt) => (
            <button
              key={opt.format}
              type="button"
              onClick={() => {
                setOpen(false);
                onExport(opt.format);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Icon name={opt.icon as any} size={14} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
