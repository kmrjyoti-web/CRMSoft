"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, SelectInput, Fieldset } from "@/components/ui";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { useSidePanelStore } from "@/stores/side-panel.store";

import {
  useDepartmentDetail,
  useDepartmentsList,
  useCreateDepartment,
  useUpdateDepartment,
} from "../hooks/useDepartments";
import { useUsersList } from "../hooks/useUsers";

// ── Validation Schema ────────────────────────────────────

const departmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  displayName: z.string().min(1, "Display name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  level: z.number().optional(),
  parentId: z.string().optional(),
  headUserId: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

// ── Props ────────────────────────────────────────────────

interface DepartmentFormProps {
  departmentId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Component ────────────────────────────────────────────

export function DepartmentForm({
  departmentId,
  mode = "page",
  panelId,
  onSuccess,
  onCancel,
}: DepartmentFormProps) {
  const router = useRouter();
  const isEdit = !!departmentId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const { data: deptData, isLoading: isLoadingDept } = useDepartmentDetail(
    departmentId ?? "",
  );
  const { data: deptsData } = useDepartmentsList({ limit: 500 });
  const { data: usersData } = useUsersList({ limit: 500 });
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  // Build dropdown options
  const parentOptions = useMemo(() => {
    const list = deptsData?.data ?? [];
    const items = Array.isArray(list) ? list : list?.data ?? [];
    return items
      .filter((d: any) => d.id !== departmentId)
      .map((d: any) => ({ label: d.displayName || d.name, value: d.id }));
  }, [deptsData, departmentId]);

  const userOptions = useMemo(() => {
    const list = usersData?.data ?? [];
    const items = Array.isArray(list) ? list : list?.data ?? [];
    return items.map((u: any) => ({
      label: `${u.firstName} ${u.lastName}`,
      value: u.id,
    }));
  }, [usersData]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema) as any,
    defaultValues: {
      name: "",
      displayName: "",
      code: "",
      description: "",
      level: 0,
      parentId: "",
      headUserId: "",
    },
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !deptData?.data) return;
    const d = deptData.data;
    reset({
      name: d.name,
      displayName: d.displayName,
      code: d.code,
      description: d.description ?? "",
      level: d.level ?? 0,
      parentId: d.parentId ?? "",
      headUserId: d.headUserId ?? "",
    });
  }, [isEdit, deptData, reset]);

  // Sync panel footer buttons
  useEffect(() => {
    if (!panelId) return;
    updatePanelConfig(panelId, {
      footerButtons: [
        {
          id: "cancel",
          label: "Cancel",
          showAs: "text",
          variant: "secondary",
          disabled: isSubmitting,
          onClick: () => {},
        },
        {
          id: "save",
          label: isSubmitting
            ? isEdit ? "Updating..." : "Saving..."
            : isEdit ? "Save Changes" : "Save",
          icon: "check",
          showAs: "both",
          variant: "primary",
          loading: isSubmitting,
          disabled: isSubmitting,
          onClick: () => {
            const formId = `sp-form-department-${departmentId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, departmentId, updatePanelConfig]);

  // Submit handler
  const onSubmit = async (values: DepartmentFormValues) => {
    try {
      const payload = {
        ...values,
        parentId: values.parentId || undefined,
        headUserId: values.headUserId || undefined,
        description: values.description || undefined,
      };

      if (isEdit && departmentId) {
        await updateMutation.mutateAsync({ id: departmentId, data: payload });
        toast.success("Department updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Department created");
      }

      if (mode === "panel" && onSuccess) {
        onSuccess();
      } else {
        router.push("/settings/departments");
      }
    } catch {
      toast.error(isEdit ? "Failed to update department" : "Failed to create department");
    }
  };

  if (isEdit && isLoadingDept) return <LoadingSpinner fullPage />;

  const isPanel = mode === "panel";

  return (
    <div className={isPanel ? "p-4" : "p-6 max-w-3xl mx-auto"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Department" : "New Department"}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
          }
        />
      )}

      <form
        id={isPanel ? `sp-form-department-${departmentId ?? "new"}` : undefined}
        onSubmit={(handleSubmit as any)(onSubmit)}
        noValidate
        className={`${isPanel ? "mt-2" : "mt-4"} space-y-6`}
      >
        <FormErrors errors={errors} />

        <Fieldset label="Department Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  label="Name"
                  required
                  leftIcon={<Icon name="building-2" size={16} />}
                  placeholder="Department name"
                  value={field.value ?? ""}
                  onChange={field.onChange}
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
                  placeholder="Display name"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={!!errors.displayName}
                  errorMessage={errors.displayName?.message}
                />
              )}
            />

            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <Input
                  label="Code"
                  required
                  leftIcon={<Icon name="hash" size={16} />}
                  placeholder="DEPT_CODE"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={!!errors.code}
                  errorMessage={errors.code?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input
                  label="Description"
                  leftIcon={<Icon name="file-text" size={16} />}
                  placeholder="Description"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Parent Department"
                  options={parentOptions}
                  value={field.value || null}
                  onChange={(v) => field.onChange(String(v ?? ""))}
                  placeholder="Select parent..."
                  leftIcon={<Icon name="git-branch" size={16} />}
                  searchable
                  clearable
                />
              )}
            />

            <Controller
              name="headUserId"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Department Head"
                  options={userOptions}
                  value={field.value || null}
                  onChange={(v) => field.onChange(String(v ?? ""))}
                  placeholder="Select head..."
                  leftIcon={<Icon name="user" size={16} />}
                  searchable
                  clearable
                />
              )}
            />
          </div>
        </Fieldset>

        {!isPanel && (
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
        )}
      </form>
    </div>
  );
}
