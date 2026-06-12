"use client";

import { useMemo } from "react";

import { SelectInput } from "@/components/ui";
import { useLookup } from "@/hooks/useLookup";

interface LookupSelectProps {
  masterCode: string;
  parentId?: string;
  value?: string | number | null;
  onChange?: (value: string | number | boolean | null) => void;
  placeholder?: string;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  required?: boolean;
  /** When true, option values are converted to numbers (for GST_RATE etc.) */
  numericValue?: boolean;
  /** Which LookupValue field to use as the option value.
   *  "value" (default) → the code string (e.g. "CEO")
   *  "id" → the lookupValueId UUID (use for filterIds) */
  valueKey?: "id" | "value";
  /** Left icon element (floating label + icon pattern) */
  leftIcon?: React.ReactNode;
  /** Footer content below the select (action links, hints) */
  footer?: React.ReactNode;
}

export function LookupSelect({
  masterCode,
  value,
  onChange,
  placeholder = "Select...",
  label,
  error,
  errorMessage,
  disabled,
  required,
  numericValue,
  valueKey = "value",
  leftIcon,
  footer,
}: LookupSelectProps) {
  const { data, isLoading } = useLookup(masterCode);

  const options = useMemo(
    () =>
      data?.map((v) => ({
        label: v.label,
        value: numericValue ? Number(v.value) : v[valueKey],
      })) ?? [],
    [data, numericValue, valueKey],
  );

  return (
    <SelectInput
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      label={label}
      loading={isLoading}
      error={error}
      errorMessage={errorMessage}
      disabled={disabled}
      required={required}
      leftIcon={leftIcon}
      footer={footer}
      searchable
      clearable
    />
  );
}
