"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, Fieldset } from "@/components/ui";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import { usePermissionsList } from "../hooks/usePermissions";
import { useRoleDetail, useCreateRole, useUpdateRole } from "../hooks/useRoles";

import type { PermissionItem } from "../types/settings.types";

// ── Validation Schema ────────────────────────────────────

const roleSchema = z.object({
  name: z.string().min(2, "Role name is required (min 2 characters)"),
  displayName: z.string().min(2, "Display name is required (min 2 characters)"),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

// ── Permission Matrix Helpers ────────────────────────────

const ACTION_COLUMNS = ["create", "read", "update", "delete", "export"] as const;

const ACTION_LABELS: Record<string, string> = {
  create: "Create",
  read: "Read",
  update: "Update",
  delete: "Delete",
  export: "Export",
};

interface PermissionMatrixRow {
  module: string;
  actionMap: Record<string, string>;
}

function buildMatrix(permissions: PermissionItem[]): PermissionMatrixRow[] {
  const map = new Map<string, Record<string, string>>();
  for (const p of permissions) {
    if (!map.has(p.module)) map.set(p.module, {});
    map.get(p.module)![p.action] = p.id;
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([module, actionMap]) => ({ module, actionMap }));
}

function formatModuleName(module: string): string {
  return module
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Props ────────────────────────────────────────────────

interface RoleFormProps {
  roleId?: string;
}

// ── Component ────────────────────────────────────────────

export function RoleForm({ roleId }: RoleFormProps) {
  const router = useRouter();
  const isEdit = !!roleId;

  const { data: roleData, isLoading: isLoadingRole } = useRoleDetail(roleId ?? "");
  const { data: permissionsData } = usePermissionsList();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const permissions = useMemo(() => {
    const raw = permissionsData?.data;
    if (Array.isArray(raw)) return raw;
    const nested = raw as unknown as { data?: PermissionItem[] };
    return nested?.data ?? [];
  }, [permissionsData]);

  const matrix = useMemo(() => buildMatrix(permissions), [permissions]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema) as any,
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      permissionIds: [],
    },
  });

  const roleDetail = useMemo(() => {
    const raw = roleData?.data;
    if (!raw) return null;
    return (raw as any)?.name ? raw : (raw as any)?.data ?? raw;
  }, [roleData]);

  const isSystemRole = isEdit && (roleDetail as any)?.isSystem;

  useEffect(() => {
    if (!isEdit || !roleDetail) return;
    const r = roleDetail as any;
    reset({
      name: r.name,
      displayName: r.displayName,
      description: r.description ?? "",
      permissionIds: r.permissions?.map((p: any) => p.id) ?? [],
    });
  }, [isEdit, roleDetail, reset]);

  const onSubmit = async (values: RoleFormValues) => {
    try {
      if (isEdit && roleId) {
        await updateMutation.mutateAsync({
          id: roleId,
          data: {
            displayName: values.displayName,
            description: values.description || undefined,
            permissionIds: values.permissionIds,
          },
        });
        toast.success("Role updated");
        router.push("/settings/roles");
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          displayName: values.displayName,
          description: values.description || undefined,
          permissionIds: values.permissionIds,
        });
        toast.success("Role created");
        router.push("/settings/roles");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} role`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingRole) return <LoadingSpinner fullPage />;

  return (
    <div className="p-6 mx-auto" style={{ position: "relative", maxWidth: "1100px" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      <PageHeader
        title={isEdit ? "Edit Role" : "New Role"}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <Icon name="arrow-left" size={16} /> Back
          </Button>
        }
      />

      <form
        onSubmit={(handleSubmit as any)(onSubmit)}
        noValidate
        className="mt-4 space-y-6"
      >
        <FormErrors errors={errors} />

        {/* Role Information */}
        <Fieldset label="Role Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  label="Role Name"
                  required
                  leftIcon={<Icon name="shield" size={16} />}
                  placeholder="e.g. sales_manager"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isEdit && !!isSystemRole}
                  error={!!errors.name}
                  errorMessage={errors.name?.message}
                />
              )}
            />
            <Controller
              name="displayName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Display Name"
                  required
                  leftIcon={<Icon name="tag" size={16} />}
                  placeholder="e.g. Sales Manager"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.displayName}
                  errorMessage={errors.displayName?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div className="sm:col-span-2">
                  <Input
                    label="Description"
                    leftIcon={<Icon name="file-text" size={16} />}
                    placeholder="Role description..."
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>
        </Fieldset>

        {/* Permission Matrix Table */}
        <Fieldset label="Permissions">
          <Controller
            name="permissionIds"
            control={control}
            render={({ field }) => {
              const selectedSet = new Set(field.value ?? []);
              const allIds = matrix.flatMap((r) => Object.values(r.actionMap));
              const allChecked = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
              const someChecked = allIds.some((id) => selectedSet.has(id));

              const toggle = (permId: string) => {
                const next = new Set(field.value ?? []);
                if (next.has(permId)) next.delete(permId);
                else next.add(permId);
                field.onChange(Array.from(next));
              };

              const toggleRow = (row: PermissionMatrixRow) => {
                const next = new Set(field.value ?? []);
                const ids = Object.values(row.actionMap);
                const allOn = ids.every((id) => next.has(id));
                ids.forEach((id) => (allOn ? next.delete(id) : next.add(id)));
                field.onChange(Array.from(next));
              };

              const toggleColumn = (action: string) => {
                const next = new Set(field.value ?? []);
                const ids = matrix.map((r) => r.actionMap[action]).filter(Boolean);
                const allOn = ids.every((id) => next.has(id));
                ids.forEach((id) => (allOn ? next.delete(id) : next.add(id)));
                field.onChange(Array.from(next));
              };

              const toggleAll = () => {
                field.onChange(allChecked ? [] : allIds);
              };

              if (matrix.length === 0) {
                return <p className="text-sm text-gray-400 italic">No permissions available</p>;
              }

              return (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2.5 text-left border-b border-gray-200">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                              checked={allChecked}
                              ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                              onChange={toggleAll}
                            />
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Page
                            </span>
                          </label>
                        </th>
                        {ACTION_COLUMNS.map((action) => {
                          const colIds = matrix.map((r) => r.actionMap[action]).filter(Boolean);
                          const colAll = colIds.length > 0 && colIds.every((id) => selectedSet.has(id));
                          const colSome = colIds.some((id) => selectedSet.has(id));
                          return (
                            <th key={action} className="px-3 py-2.5 text-center border-b border-gray-200" style={{ width: "100px" }}>
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  {ACTION_LABELS[action]}
                                </span>
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                  checked={colAll}
                                  ref={(el) => { if (el) el.indeterminate = colSome && !colAll; }}
                                  onChange={() => toggleColumn(action)}
                                />
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {matrix.map((row, idx) => {
                        const rowIds = Object.values(row.actionMap);
                        const rowAll = rowIds.length > 0 && rowIds.every((id) => selectedSet.has(id));
                        const rowSome = rowIds.some((id) => selectedSet.has(id));
                        return (
                          <tr key={row.module} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                            <td className="px-3 py-2">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                  checked={rowAll}
                                  ref={(el) => { if (el) el.indeterminate = rowSome && !rowAll; }}
                                  onChange={() => toggleRow(row)}
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  {formatModuleName(row.module)}
                                </span>
                              </label>
                            </td>
                            {ACTION_COLUMNS.map((action) => {
                              const permId = row.actionMap[action];
                              return (
                                <td key={action} className="px-3 py-2 text-center">
                                  {permId ? (
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                      checked={selectedSet.has(permId)}
                                      onChange={() => toggle(permId)}
                                    />
                                  ) : (
                                    <span className="text-gray-300">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            }}
          />
        </Fieldset>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEdit ? "Updating..." : "Saving..."
              : isEdit ? "Update" : "Save"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
