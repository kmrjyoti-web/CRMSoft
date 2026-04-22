"use client";

import { useMemo, useCallback } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { tableConfigService } from "@/features/table-config/services/table-config.service";

import { FORM_REGISTRY } from "../utils/form-registry";
import { mergeFormConfig } from "../utils/merge-form-config";

import type { FormFieldConfig, FormConfigData } from "../utils/form-registry";

const KEY = "table-config";

const EMPTY_FIELDS: FormFieldConfig[] = [];

/**
 * Hook to fetch + save form field configuration.
 * Reuses the TableConfig backend API with `form-` prefixed keys.
 */
export function useFormConfig(formKey: string) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [KEY, formKey],
    queryFn: () => tableConfigService.get(formKey),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const savedConfig = data?.data?.config as FormConfigData | null | undefined;
  const systemDefaults = FORM_REGISTRY[formKey] ?? EMPTY_FIELDS;

  const fields = useMemo(
    () => mergeFormConfig(savedConfig, systemDefaults),
    [savedConfig, systemDefaults],
  );

  const fieldMap = useMemo(
    () => new Map(fields.map((f) => [f.id, f])),
    [fields],
  );

  const isFieldVisible = useCallback(
    (fieldId: string): boolean => fieldMap.get(fieldId)?.visible ?? true,
    [fieldMap],
  );

  const getFieldLabel = useCallback(
    (fieldId: string): string => {
      const f = fieldMap.get(fieldId);
      return f?.label ?? fieldId;
    },
    [fieldMap],
  );

  const saveMutation = useMutation({
    mutationFn: (payload: { config: FormConfigData; applyToAll?: boolean }) =>
      tableConfigService.upsert(formKey, { config: payload.config as any, applyToAll: payload.applyToAll }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, formKey] }),
  });

  const resetMutation = useMutation({
    mutationFn: () => tableConfigService.reset(formKey),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, formKey] }),
  });

  const saveConfig = useCallback(
    (updatedFields: FormFieldConfig[], applyToAll?: boolean) =>
      saveMutation.mutateAsync({ config: { fields: updatedFields }, applyToAll }),
    [saveMutation],
  );

  const resetToDefault = useCallback(
    () => resetMutation.mutateAsync(),
    [resetMutation],
  );

  return {
    fields,
    isFieldVisible,
    getFieldLabel,
    isLoading,
    isSaving: saveMutation.isPending,
    saveConfig,
    resetToDefault,
  };
}
