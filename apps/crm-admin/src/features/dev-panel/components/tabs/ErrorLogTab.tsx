"use client";

import { useState } from "react";

import { Button, Icon, Badge, Input } from "@/components/ui";

import { useErrorLog } from "../../hooks/useErrorLog";
import { addErrorEntry } from "../../utils/error-boundary";

import type { ErrorSeverity } from "../../types/dev-panel.types";

const SEVERITY_BADGE: Record<ErrorSeverity, { variant: "danger" | "warning" | "primary"; icon: string }> = {
  error: { variant: "danger", icon: "x-circle" },
  warning: { variant: "warning", icon: "alert-triangle" },
  info: { variant: "primary", icon: "info" },
};

export function ErrorLogTab() {
  const { errors, clear } = useErrorLog();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<ErrorSeverity | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = errors.filter((e) => {
    if (severityFilter !== "all" && e.severity !== severityFilter) return false;
    if (search && !e.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="danger">{errorCount} errors</Badge>
          <Badge variant="warning">{warningCount} warnings</Badge>
          <span className="text-sm text-gray-500">{errors.length} total</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => addErrorEntry("info", "Test info message from DevPanel")}
          >
            <Icon name="plus" size={14} /> Test
          </Button>
          <Button variant="outline" onClick={clear}>
            <Icon name="trash" size={14} /> Clear
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search error messages..."
            value={search}
            onChange={(v) => setSearch(v)}
            leftIcon={<Icon name="search" size={16} />}
          />
        </div>
        <div className="flex gap-1">
          {(["all", "error", "warning", "info"] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                severityFilter === sev
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {sev === "all" ? "All" : sev.charAt(0).toUpperCase() + sev.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filtered.map((entry) => {
          const cfg = SEVERITY_BADGE[entry.severity];
          const isExpanded = expandedId === entry.id;
          return (
            <div key={entry.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                <Icon name={cfg.icon as "x-circle"} size={16} className={`mt-0.5 ${cfg.variant === "danger" ? "text-red-500" : cfg.variant === "warning" ? "text-yellow-500" : "text-blue-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 break-words">{entry.message}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                    {entry.url && ` — ${entry.url}`}
                  </div>
                </div>
                <Badge variant={cfg.variant}>{entry.severity}</Badge>
              </div>
              {isExpanded && entry.stack && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <pre className="text-xs font-mono text-gray-600 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                    {entry.stack}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Icon name="check-circle" size={32} className="mx-auto mb-2 opacity-50" />
            <p>{errors.length === 0 ? "No errors captured yet" : "No errors match your filter"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
