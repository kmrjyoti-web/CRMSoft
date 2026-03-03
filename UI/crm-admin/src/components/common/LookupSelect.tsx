"use client";

import { useMemo } from "react";

import { SelectInput } from "@/components/ui";
import { useLookup } from "@/hooks/useLookup";

interface LookupSelectProps {
  masterCode: string;
  parentId?: string;
  value?: string | null;
  onChange?: (value: string | number | boolean | null) => void;
  placeholder?: string;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  required?: boolean;
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
}: LookupSelectProps) {
  const { data, isLoading } = useLookup(masterCode);

  const options = useMemo(
    () =>
      data?.map((v) => ({
        label: v.label,
        value: v.value,
      })) ?? [],
    [data],
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
      searchable
      clearable
    />
  );
}
