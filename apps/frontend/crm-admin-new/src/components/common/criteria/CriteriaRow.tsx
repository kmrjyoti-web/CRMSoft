"use client";

import { useMemo } from "react";

import { Input, SelectInput, NumberInput, DatePicker, Icon } from "@/components/ui";

import type { CriteriaFieldDef, CriteriaRowData, OperatorDef } from "./criteria.types";
import { getOperatorsForType } from "./criteria.types";

interface CriteriaRowProps {
  row: CriteriaRowData;
  index: number;
  fields: CriteriaFieldDef[];
  onChange: (updated: CriteriaRowData) => void;
  onAdd: () => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function CriteriaRow({
  row,
  index,
  fields,
  onChange,
  onAdd,
  onRemove,
  canRemove,
}: CriteriaRowProps) {
  const selectedField = fields.find((f) => f.key === row.field);
  const operators = useMemo(
    () => (selectedField ? getOperatorsForType(selectedField.type) : []),
    [selectedField],
  );
  const selectedOperator = operators.find((o) => o.value === row.operator);

  const fieldOptions = fields.map((f) => ({ label: f.label, value: f.key }));
  const operatorOptions = operators.map((o) => ({ label: o.label, value: o.value }));

  const handleFieldChange = (val: string | number | boolean | null) => {
    const newField = fields.find((f) => f.key === String(val));
    const newOps = newField ? getOperatorsForType(newField.type) : [];
    onChange({
      ...row,
      field: String(val ?? ""),
      operator: newOps[0]?.value ?? "",
      value: "",
      value2: undefined,
    });
  };

  const handleOperatorChange = (val: string | number | boolean | null) => {
    onChange({ ...row, operator: String(val ?? ""), value: "", value2: undefined });
  };

  const hideValue = !!selectedOperator?.preset;
  const showRange = !!selectedOperator?.range;

  // ── Value input based on field type ──
  const renderValueInput = () => {
    if (hideValue) return null;
    if (!selectedField) return null;

    const { type } = selectedField;

    if (type === "select" || type === "lookup") {
      const opts =
        selectedField.options ??
        [];
      return (
        <SelectInput
          label=""
          options={opts}
          value={String(row.value ?? "")}
          onChange={(v) => onChange({ ...row, value: String(v ?? "") })}
          searchable
        />
      );
    }

    if (type === "number") {
      return (
        <div className="flex items-center gap-2">
          <NumberInput
            label=""
            value={row.value as number | null}
            onChange={(v) => onChange({ ...row, value: v })}
          />
          {showRange && (
            <>
              <span className="text-gray-400 text-xs">and</span>
              <NumberInput
                label=""
                value={row.value2 as number | null}
                onChange={(v) => onChange({ ...row, value2: v })}
              />
            </>
          )}
        </div>
      );
    }

    if (type === "date") {
      return (
        <div className="flex items-center gap-2">
          <DatePicker
            label=""
            value={row.value as string}
            onChange={(v) => onChange({ ...row, value: v })}
          />
          {showRange && (
            <>
              <span className="text-gray-400 text-xs">and</span>
              <DatePicker
                label=""
                value={row.value2 as string}
                onChange={(v) => onChange({ ...row, value2: v })}
              />
            </>
          )}
        </div>
      );
    }

    // Default: string input
    return (
      <Input
        placeholder="Enter value..."
        value={String(row.value ?? "")}
        onChange={(v: string) => onChange({ ...row, value: v })}
      />
    );
  };

  return (
    <div className="flex items-center gap-3">
      {/* Row number */}
      <div className="flex-none w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
        {index + 1}
      </div>

      {/* Field selector */}
      <div className="w-48 flex-none">
        <SelectInput
          label=""
          options={fieldOptions}
          value={row.field}
          onChange={handleFieldChange}
          searchable
        />
      </div>

      {/* Operator selector */}
      <div className="w-40 flex-none">
        <SelectInput
          label=""
          options={operatorOptions}
          value={row.operator}
          onChange={handleOperatorChange}
          searchable
        />
      </div>

      {/* Value input */}
      <div className="flex-1 min-w-0">
        {renderValueInput()}
      </div>

      {/* Add / Remove buttons */}
      <div className="flex-none flex items-center gap-1">
        <button
          type="button"
          onClick={onAdd}
          className="w-7 h-7 rounded-full bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors"
          title="Add criteria"
        >
          <Icon name="plus" size={14} />
        </button>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="w-7 h-7 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
            title="Remove criteria"
          >
            <Icon name="minus" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
