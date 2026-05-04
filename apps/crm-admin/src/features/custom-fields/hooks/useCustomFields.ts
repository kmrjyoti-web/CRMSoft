import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/custom-fields.service";
import type { CreateCustomFieldDto, EntityTypeForFields } from "../types/custom-fields.types";

const KEY = "custom-fields";

export function useCustomFields(entityType?: EntityTypeForFields) {
  return useQuery({
    queryKey: [KEY, entityType],
    queryFn: () => svc.listFields(entityType),
  });
}

export function useFormSchema(entityType: EntityTypeForFields) {
  return useQuery({
    queryKey: [KEY, "schema", entityType],
    queryFn: () => svc.getFormSchema(entityType),
    enabled: !!entityType,
  });
}

export function useFieldValues(entityType: EntityTypeForFields, entityId: string) {
  return useQuery({
    queryKey: [KEY, "values", entityType, entityId],
    queryFn: () => svc.getFieldValues(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useCreateField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCustomFieldDto) => svc.createField(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: Partial<CreateCustomFieldDto> }) => svc.updateField(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteField(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSetFieldValues() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { entityType: EntityTypeForFields; entityId: string; values: Record<string, unknown> }) =>
      svc.setFieldValues(vars.entityType, vars.entityId, vars.values),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, "values", vars.entityType, vars.entityId] }),
  });
}
