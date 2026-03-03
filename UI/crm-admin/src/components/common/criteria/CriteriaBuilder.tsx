"use client";

import { useCallback } from "react";

import { Button, Icon } from "@/components/ui";

import type { CriteriaFieldDef, CriteriaRowData } from "./criteria.types";
import { getOperatorsForType } from "./criteria.types";
import { CriteriaRow } from "./CriteriaRow";

interface CriteriaBuilderProps {
  fields: CriteriaFieldDef[];
  criteria: CriteriaRowData[];
  onChange: (criteria: CriteriaRowData[]) => void;
  onSearch: () => void;
  isSearching?: boolean;
}

let rowCounter = 0;
function nextRowId() {
  rowCounter += 1;
  return `cr_${rowCounter}_${Date.now()}`;
}

export function createEmptyRow(fields: CriteriaFieldDef[]): CriteriaRowData {
  const first = fields[0];
  const ops = first ? getOperatorsForType(first.type) : [];
  return {
    id: nextRowId(),
    field: first?.key ?? "",
    operator: ops[0]?.value ?? "",
    value: "",
  };
}

export function CriteriaBuilder({
  fields,
  criteria,
  onChange,
  onSearch,
  isSearching,
}: CriteriaBuilderProps) {
  const handleRowChange = useCallback(
    (index: number, updated: CriteriaRowData) => {
      const next = [...criteria];
      next[index] = updated;
      onChange(next);
    },
    [criteria, onChange],
  );

  const handleAdd = useCallback(
    (afterIndex: number) => {
      const next = [...criteria];
      next.splice(afterIndex + 1, 0, createEmptyRow(fields));
      onChange(next);
    },
    [criteria, fields, onChange],
  );

  const handleRemove = useCallback(
    (index: number) => {
      if (criteria.length <= 1) return;
      const next = criteria.filter((_, i) => i !== index);
      onChange(next);
    },
    [criteria, onChange],
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Criteria</h3>

      <div className="space-y-3">
        {criteria.map((row, index) => (
          <CriteriaRow
            key={row.id}
            row={row}
            index={index}
            fields={fields}
            onChange={(updated) => handleRowChange(index, updated)}
            onAdd={() => handleAdd(index)}
            onRemove={() => handleRemove(index)}
            canRemove={criteria.length > 1}
          />
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          variant="primary"
          size="sm"
          onClick={onSearch}
          disabled={isSearching}
        >
          <Icon name="search" size={14} />
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>
    </div>
  );
}
