"use client";

import { useState, useCallback } from "react";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button, Icon, Checkbox } from "@/components/ui";

import { CriteriaBuilder, createEmptyRow } from "./criteria";
import type { CriteriaFieldDef, CriteriaRowData } from "./criteria";
import { useBulkDeleteDialog } from "./BulkDeleteDialog";

export interface MassDeletePageProps {
  entityName: string;
  backPath: string;
  criteriaFields: CriteriaFieldDef[];
  /** Search API: receives criteria, returns flat array of { id, label, subtitle? } */
  onSearch: (criteria: CriteriaRowData[]) => Promise<{ id: string; label: string; subtitle?: string }[]>;
  /** Soft-delete a single record by ID */
  onDeactivate: (id: string) => Promise<unknown>;
}

export function MassDeletePage({
  entityName,
  backPath,
  criteriaFields,
  onSearch,
  onDeactivate,
}: MassDeletePageProps) {
  const router = useRouter();

  // Criteria state
  const [criteria, setCriteria] = useState<CriteriaRowData[]>([
    createEmptyRow(criteriaFields),
  ]);

  // Search results
  const [results, setResults] = useState<{ id: string; label: string; subtitle?: string }[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Selection within results
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedArray = Array.from(selectedIds);

  const { trigger: triggerBulkDelete, BulkDeleteDialogPortal, isRunning } = useBulkDeleteDialog({
    ids: selectedArray,
    entityName,
    action: onDeactivate,
    onComplete: (result) => {
      if (result.failed.length === 0) {
        toast.success(`${result.succeeded.length} ${entityName}(s) deactivated successfully`);
        router.push(backPath);
      } else {
        toast.error(`${result.succeeded.length} deactivated, ${result.failed.length} failed`);
        // Remove succeeded from results
        setResults((prev) =>
          prev ? prev.filter((r) => !result.succeeded.includes(r.id)) : null,
        );
        setSelectedIds((prev) => {
          const next = new Set(prev);
          result.succeeded.forEach((id) => next.delete(id));
          return next;
        });
      }
    },
  });

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    setResults(null);
    setSelectedIds(new Set());
    try {
      const res = await onSearch(criteria);
      setResults(res);
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
          <h1 className="text-xl font-semibold text-gray-900">Mass Delete</h1>
          <p className="text-sm text-gray-500">
            Search {entityName}s by criteria, then deactivate selected records
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
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
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

          {/* Delete action */}
          {results.length > 0 && selectedIds.size > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-3">
              <Button
                variant="danger"
                size="sm"
                onClick={() => triggerBulkDelete()}
                disabled={isRunning}
              >
                <Icon name="trash-2" size={14} />
                {isRunning
                  ? "Deleting..."
                  : `Delete ${selectedIds.size} Record${selectedIds.size !== 1 ? "s" : ""}`}
              </Button>
              <span className="text-xs text-gray-400">
                Records will be soft-deleted (deactivated)
              </span>
            </div>
          )}
        </div>
      )}

      <BulkDeleteDialogPortal />
    </div>
  );
}
