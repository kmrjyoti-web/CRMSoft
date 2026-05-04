"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge, SelectInput, Fieldset } from "@/components/ui";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/format-date";
import { useReportDefinitions, useExportHistory } from "../hooks/useDashboard";
import type { ReportDefinition, ExportHistoryItem } from "../types/dashboard.types";

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "" },
  { label: "Sales", value: "Sales" },
  { label: "Lead", value: "Lead" },
  { label: "Contact", value: "Contact" },
  { label: "Activity", value: "Activity" },
  { label: "Demo", value: "Demo" },
  { label: "Quotation", value: "Quotation" },
  { label: "Tour Plan", value: "TourPlan" },
  { label: "Team", value: "Team" },
  { label: "Communication", value: "Communication" },
  { label: "Executive", value: "Executive" },
  { label: "Custom", value: "Custom" },
];

const CATEGORY_BADGE_MAP: Record<string, string> = {
  Sales: "primary",
  Lead: "success",
  Contact: "secondary",
  Activity: "warning",
  Team: "primary",
  Executive: "danger",
};

export function ReportCatalog() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const router = useRouter();

  const { data: defsData, isLoading } = useReportDefinitions(selectedCategory || undefined);
  const { data: exportsData } = useExportHistory({ limit: 10 });

  const definitions: ReportDefinition[] = defsData?.data ?? [];
  const exports: ExportHistoryItem[] = exportsData?.data ?? [];

  const handleRowClick = useCallback((code: string) => {
    router.push(`/reports/${code}`);
  }, [router]);

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader title="Reports" subtitle="Browse and generate MIS reports" />

      {/* Filter */}
      <div className="rounded-lg border border-gray-200 bg-white p-5" style={{ marginBottom: 16 }}>
        <div style={{ maxWidth: 300 }}>
          <SelectInput
            label="Category"
            options={CATEGORY_OPTIONS}
            value={selectedCategory}
            onChange={(v) => setSelectedCategory(String(v ?? ""))}
          />
        </div>
      </div>

      {/* Definitions table */}
      <div className="rounded-lg border border-gray-200 bg-white p-5" style={{ marginBottom: 16 }}>
        {definitions.length === 0 ? (
          <EmptyState icon="bar-chart" title="No reports found" description="Try selecting a different category." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>Name</th>
                  <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>Category</th>
                  <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>Description</th>
                  <th style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {definitions.map((def: ReportDefinition) => (
                  <tr
                    key={def.id}
                    onClick={() => handleRowClick(def.code)}
                    style={{ borderBottom: "1px solid #e2e8f0", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                  >
                    <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 500 }}>{def.name}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <Badge variant={(CATEGORY_BADGE_MAP[def.category] ?? "default") as any}>{def.category}</Badge>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 14, color: "#64748b" }}>{def.description}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <Button size="sm" variant="outline" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleRowClick(def.code); }}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Exports */}
      {exports.length > 0 && (
        <Fieldset label="Recent Exports" toggleable defaultCollapsed>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>Report</th>
                  <th style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>Format</th>
                  <th style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>Status</th>
                  <th style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, color: "#475569" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {exports.map((exp: ExportHistoryItem) => (
                  <tr key={exp.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 12px", fontSize: 14 }}>{exp.reportName}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <Badge variant="outline">{exp.format}</Badge>
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <Badge variant={exp.status === "COMPLETED" ? "success" : exp.status === "FAILED" ? "danger" : "warning"}>
                        {exp.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 14 }}>{formatDate(exp.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fieldset>
      )}
    </div>
  );
}
