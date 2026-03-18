"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, NumberInput, SelectInput, Fieldset } from "@/components/ui";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { useSidePanelStore } from "@/stores/side-panel.store";

import {
  useDesignationDetail,
  useDesignationsList,
  useCreateDesignation,
  useUpdateDesignation,
} from "../hooks/useDesignations";
import { useDepartmentsList } from "../hooks/useDepartments";

// ── Validation Schema ────────────────────────────────────

const designationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  level: z.number().optional(),
  grade: z.string().optional(),
  departmentId: z.string().optional(),
  parentId: z.string().optional(),
});

type DesignationFormValues = z.infer<typeof designationSchema>;

// ── Props ────────────────────────────────────────────────

interface DesignationFormProps {
  designationId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Component ────────────────────────────────────────────

export function DesignationForm({
  designationId,
  mode = "page",
  panelId,
  onSuccess,
  onCancel,
}: DesignationFormProps) {
  const router = useRouter();
  const isEdit = !!designationId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const { data: desigData, isLoading: isLoadingDesig } = useDesignationDetail(
    designationId ?? "",
  );
  const { data: deptsData } = useDepartmentsList({ limit: 500 });
  const { data: desigsData } = useDesignationsList({ limit: 500 });
  const createMutation = useCreateDesignation();
  const updateMutation = useUpdateDesignation();

  // Build dropdown options
  const departmentOptions = useMemo(() => {
    const list = deptsData?.data ?? [];
    const items = Array.isArray(list) ? list : (list as any)?.data ?? [];
    return items.map((d: any) => ({ label: d.displayName || d.name, value: d.id }));
  }, [deptsData]);

  const parentOptions = useMemo(() => {
    const list = desigsData?.data ?? [];
    const items = Array.isArray(list) ? list : (list as any)?.data ?? [];
    return items
      .filter((d: any) => d.id !== designationId)
      .map((d: any) => ({ label: d.name, value: d.id }));
  }, [desigsData, designationId]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DesignationFormValues>({
    resolver: zodResolver(designationSchema) as any,
    defaultValues: {
      name: "",
      code: "",
      description: "",
      level: 0,
      grade: "",
      departmentId: "",
      parentId: "",
    },
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !desigData?.data) return;
    const d = desigData.data;
    reset({
      name: d.name,
      code: d.code,
      description: d.description ?? "",
      level: d.level ?? 0,
      grade: d.grade ?? "",
      departmentId: d.departmentId ?? "",
      parentId: d.parentId ?? "",
    });
  }, [isEdit, desigData, reset]);

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
            const formId = `sp-form-designation-${designationId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, designationId, updatePanelConfig]);

  // Submit handler
  const onSubmit = async (values: DesignationFormValues) => {
    try {
      const payload = {
        ...values,
        parentId: values.parentId || undefined,
        departmentId: values.departmentId || undefined,
        description: values.description || undefined,
        grade: values.grade || undefined,
      };

      if (isEdit && designationId) {
        await updateMutation.mutateAsync({ id: designationId, data: payload });
        toast.success("Designation updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Designation created");
      }

      if (mode === "panel" && onSuccess) {
        onSuccess();
      } else {
        router.push("/settings/designations");
      }
    } catch {
      toast.error(
        isEdit ? "Failed to update designation" : "Failed to create designation",
      );
    }
  };

  if (isEdit && isLoadingDesig) return <LoadingSpinner fullPage />;

  const isPanel = mode === "panel";

  return (
    <div className={isPanel ? "p-4" : "p-6 max-w-3xl mx-auto"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Designation" : "New Designation"}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
          }
        />
      )}

      <form
        id={isPanel ? `sp-form-designation-${designationId ?? "new"}` : undefined}
        onSubmit={(handleSubmit as any)(onSubmit)}
        noValidate
        className={`${isPanel ? "mt-2" : "mt-4"} space-y-6`}
      >
        <FormErrors errors={errors} />

        <Fieldset label="Designation Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  label="Name"
                  required
                  leftIcon={<Icon name="briefcase" size={16} />}
                  placeholder="Designation name"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={!!errors.name}
                  errorMessage={errors.name?.message}
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
                  placeholder="DESIG_CODE"
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
              name="grade"
              control={control}
              render={({ field }) => (
                <Input
                  label="Grade"
                  leftIcon={<Icon name="award" size={16} />}
                  placeholder="e.g. A, B, C"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Level"
                  value={field.value ?? 0}
                  onChange={(v) => field.onChange(v ?? 0)}
                  min={0}
                />
              )}
            />

            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Department"
                  options={departmentOptions}
                  value={field.value || null}
                  onChange={(v) => field.onChange(String(v ?? ""))}
                  placeholder="Select department..."
                  leftIcon={<Icon name="building-2" size={16} />}
                  searchable
                  clearable
                />
              )}
            />

            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Parent Designation"
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
