"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { SelectInput, Button, Badge } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  useWarrantyTemplatesByIndustry,
  useImportWarrantyTemplate,
} from "../hooks/useAmcWarranty";

const INDUSTRY_OPTIONS = [
  { value: "electronics", label: "Electronics" },
  { value: "software", label: "Software" },
  { value: "industrial", label: "Industrial" },
  { value: "medical", label: "Medical" },
  { value: "automotive", label: "Automotive" },
  { value: "fmcg", label: "FMCG" },
];

export function WarrantyTemplateImport() {
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const importTemplate = useImportWarrantyTemplate();

  const { data, isLoading } = useWarrantyTemplatesByIndustry(selectedIndustry);

  const templates = useMemo(() => {
    const d = data?.data;
    if (Array.isArray(d)) return d;
    const nested = d as unknown as { data?: any[] };
    return nested?.data ?? [];
  }, [data]);

  const toggleId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleImportSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one template");
      return;
    }
    let successCount = 0;
    for (const id of selectedIds) {
      try {
        await importTemplate.mutateAsync(id);
        successCount++;
      } catch {
        // ignore individual errors
      }
    }
    toast.success(`Imported ${successCount} template(s) successfully`);
    setSelectedIds([]);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Import Warranty Templates by Industry
        </h2>
        <p className="text-sm text-gray-500">
          Select an industry to browse system warranty templates and import them
          into your tenant.
        </p>
      </div>

      <div className="max-w-sm mb-6">
        <SelectInput
          label="Select Industry"
          value={selectedIndustry}
          onChange={(v) => {
            setSelectedIndustry(String(v ?? ""));
            setSelectedIds([]);
          }}
          options={INDUSTRY_OPTIONS}
        />
      </div>

      {selectedIndustry && isLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {selectedIndustry && !isLoading && templates.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            No system templates found for this industry.
          </p>
        </div>
      )}

      {templates.length > 0 && (
        <>
          <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
            {templates.map((t: any) => (
              <div
                key={t.id}
                className="flex items-start gap-4 p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleId(t.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(t.id)}
                  onChange={() => toggleId(t.id)}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {t.name}
                    </span>
                    <Badge variant="outline">{t.code}</Badge>
                    <Badge variant="secondary">{t.coverageType}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Duration: {t.durationValue} {t.durationType?.toLowerCase()} |
                    Labor: {t.laborChargeType} | Parts: {t.partsChargeType}
                  </p>
                  {t.description && (
                    <p className="text-xs text-gray-400 mt-1">
                      {t.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {selectedIds.length} template(s) selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedIds([])}
                disabled={selectedIds.length === 0}
              >
                Clear Selection
              </Button>
              <Button
                variant="primary"
                onClick={handleImportSelected}
                loading={importTemplate.isPending}
                disabled={selectedIds.length === 0}
              >
                Import Selected ({selectedIds.length})
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
