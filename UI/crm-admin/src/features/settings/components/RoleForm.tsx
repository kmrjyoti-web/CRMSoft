"use client";

import { useEffect, useMemo } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, Checkbox, Fieldset } from "@/components/ui";

import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import { usePermissionsList } from "../hooks/usePermissions";
import { useRoleDetail, useCreateRole, useUpdateRole } from "../hooks/useRoles";

// ── Validation Schema ────────────────────────────────────

const roleSchema = z.object({
  name: z.string().min(2, "Role name is required (min 2 characters)"),
  displayName: z.string().min(2, "Display name is required (min 2 characters)"),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

// ── Props ────────────────────────────────────────────────

interface RoleFormProps {
  roleId?: string;
}

// ── Component ────────────────────────────────────────────

export function RoleForm({ roleId }: RoleFormProps) {
  const router = useRouter();
  const isEdit = !!roleId;

  const { data: roleData, isLoading: isLoadingRole } = useRoleDetail(
    roleId ?? "",
  );
  const { data: permissionsData } = usePermissionsList();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const permissionOptions = useMemo(() => {
    const permissions = permissionsData?.data ?? [];
    return permissions.map((p) => ({
      label: `${p.module}:${p.action}`,
      value: p.id,
    }));
  }, [permissionsData]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      permissionIds: [],
    },
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !roleData?.data) return;
    const r = roleData.data;
    reset({
      name: r.name,
      displayName: r.displayName,
      description: r.description ?? "",
      permissionIds: r.permissions?.map((p) => p.id) ?? [],
    });
  }, [isEdit, roleData, reset]);

  const isSystemRole = isEdit && roleData?.data?.isSystem;

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
    <div className="p-6" style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      <PageHeader
        title={isEdit ? "Edit Role" : "New Role"}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <Icon name="arrow-left" size={16} /> Back
          </Button>
        }
      />

      <FormErrors errors={errors} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-4 max-w-3xl space-y-6"
      >
        {/* Role Information */}
        <Fieldset label="Role Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Role Name"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isEdit && isSystemRole}
                    error={!!errors.name}
                    errorMessage={errors.name?.message}
                  />
                </div>
              )}
            />
            <Controller
              name="displayName"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Display Name"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.displayName}
                    errorMessage={errors.displayName?.message}
                  />
                </div>
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    placeholder="Role description..."
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>
              )}
            />
          </div>
        </Fieldset>

        {/* Permissions */}
        <Fieldset label="Permissions">
          <Controller
            name="permissionIds"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                {permissionOptions.map((opt) => (
                  <Checkbox
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                    checked={(field.value ?? []).includes(opt.value)}
                    onChange={(checked) => {
                      const current = field.value ?? [];
                      if (checked) {
                        field.onChange([...current, opt.value]);
                      } else {
                        field.onChange(current.filter((id) => id !== opt.value));
                      }
                    }}
                  />
                ))}
                {permissionOptions.length === 0 && (
                  <p className="text-sm text-gray-400 italic">
                    No permissions available
                  </p>
                )}
              </div>
            )}
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
            <Icon name="check" size={16} />{" "}
            {isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Update" : "Save"}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
