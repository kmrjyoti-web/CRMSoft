"use client";

import { useState, useMemo, useCallback } from "react";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button, Icon, Checkbox } from "@/components/ui";

import { CriteriaBuilder, createEmptyRow } from "./criteria";
import type { CriteriaFieldDef, CriteriaRowData } from "./criteria";
import type { BulkEditField } from "./BulkEditPanel";
import { useBulkOperations } from "@/hooks/useBulkOperations";

export interface MassUpdatePageProps {
  entityName: string;
  backPath: string;
  criteriaFields: CriteriaFieldDef[];
  updateFields: BulkEditField[];
  /** Search API: receives criteria, returns flat array of { id, label, subtitle? } */
  onSearch: (criteria: CriteriaRowData[]) => Promise<{ id: string; label: string; subtitle?: string }[]>;
  /** Update a single record by ID with values */
  onUpdate: (id: string, values: Record<string, unknown>) => Promise<unknown>;
}

export function MassUpdatePage({
  entityName,
  backPath,
  criteriaFields,
  updateFields,
  onSearch,
  onUpdate,
}: MassUpdatePageProps) {
  const router = useRouter();
  const { execute: bulkExecute, isRunning, progress } = useBulkOperations();

  // Criteria state
  const [criteria, setCriteria] = useState<CriteriaRowData[]>([
    createEmptyRow(criteriaFields),
  ]);

  // Search results
  const [results, setResults] = useState<{ id: string; label: string; subtitle?: string }[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Selection within results
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Update field values
  const [updateValues, setUpdateValues] = useState<Record<string, string>>(() =>
    updateFields.reduce<Record<string, string>>((acc, f) => {
      acc[f.key] = "";
      return acc;
    }, {}),
  );

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    setResults(null);
    setSelectedIds(new Set());
    try {
      const res = await onSearch(criteria);
      setResults(res);
      // Auto-select all
      setSelectedIds(new Set(res.map((r) => r.id)));
    } catch {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  }, [criteria, onSearch]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!results) return;
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map((r) => r.id)));
    }
  };

  const handleUpdate = useCallback(async () => {
    const payload = Object.fromEntries(
      Object.entries(updateValues).filter(([, v]) => v !== "" && v !== undefined),
    );
    if (Object.keys(payload).length === 0) {
      toast.error("Please fill in at least one field to update");
      return;
    }
    if (selectedIds.size === 0) {
      toast.error("No records selected");
      return;
    }

    const ids = Array.from(selectedIds);
    const result = await bulkExecute(ids, (id) => onUpdate(id, payload));
    if (result.failed.length === 0) {
      toast.success(`${result.succeeded.length} ${entityName}(s) updated successfully`);
      router.push(backPath);
    } else {
      toast.error(`${result.succeeded.length} updated, ${result.failed.length} failed`);
    }
  }, [updateValues, selectedIds, bulkExecute, onUpdate, entityName, backPath, router]);

  const allSelected = !!results && results.length > 0 && selectedIds.size === results.length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(backPath)}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Icon name="arrow-left" size={20} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Mass Update</h1>
          <p className="text-sm text-gray-500">
            Search {entityName}s by criteria, then update selected records
          </p>
        </div>
      </div>

      {/* Criteria Builder */}
      <CriteriaBuilder
        fields={criteriaFields}
        criteria={criteria}
        onChange={setCriteria}
        onSearch={handleSearch}
        isSearching={isSearching}
      />

      {/* Results */}
      {results !== null && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              Found {results.length} records
            </h3>
            {results.length > 0 && (
              <button
                onClick={toggleAll}
                className="text-xs text-blue-600 hover:underline"
              >
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              No records match the criteria
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
              {results.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{item.label}</div>
                    {item.subtitle && (
                      <div className="text-xs text-gray-400 truncate">{item.subtitle}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Update Fields */}
      {results && results.length > 0 && selectedIds.size > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Update Fields
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Only filled fields will be updated. Blank fields are ignored.
          </p>

          <div className="space-y-4">
            {updateFields.map((field) => (
              <div key={field.key} className="flex items-center gap-3">
                <label className="w-36 text-sm font-medium text-gray-600 flex-none">
                  {field.label}
                </label>
                <div className="flex-1">
                  {field.type === "select" ? (
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={updateValues[field.key] ?? ""}
                      onChange={(e) =>
                        setUpdateValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                    >
                      <option value="">— Keep existing —</option>
                      {field.options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === "date" ? "date" : "text"}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`New ${field.label.toLowerCase()}`}
                      value={updateValues[field.key] ?? ""}
                      onChange={(e) =>
                        setUpdateValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              variant="primary"
              onClick={handleUpdate}
              disabled={isRunning}
            >
              <Icon name="check" size={14} />
              {isRunning
                ? `Updating ${progress.completed}/${progress.total}...`
                : `Update ${selectedIds.size} Record${selectedIds.size !== 1 ? "s" : ""}`}
            </Button>
            <Button variant="outline" onClick={() => router.push(backPath)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
