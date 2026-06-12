"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Input, SelectInput, Switch, Fieldset } from "@/components/ui";

import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useWorkflowDetail,
  useCreateWorkflow,
  useUpdateWorkflow,
} from "../hooks/useWorkflows";

// ── Validation Schema ────────────────────────────────────

const workflowSchema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required"),
  entityType: z.string().min(1, "Entity type is required"),
  description: z.string().optional().default(""),
  isDefault: z.boolean().optional().default(false),
});

type WorkflowFormValues = z.infer<typeof workflowSchema>;

// ── Constants ────────────────────────────────────────────

const ENTITY_TYPE_OPTIONS = [
  { label: "Lead", value: "LEAD" },
  { label: "Quotation", value: "QUOTATION" },
  { label: "Invoice", value: "INVOICE" },
  { label: "Installation", value: "INSTALLATION" },
  { label: "Ticket", value: "TICKET" },
];

// ── Label Style ──────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "#475569",
  display: "block",
  marginBottom: 4,
};

// ── Component ────────────────────────────────────────────

export function WorkflowForm({ workflowId }: { workflowId?: string }) {
  const router = useRouter();
  const isEdit = !!workflowId;

  const { data: workflowData, isLoading: isLoadingWorkflow } =
    useWorkflowDetail(workflowId!);
  const createMutation = useCreateWorkflow();
  const updateMutation = useUpdateWorkflow();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowSchema) as any,
    defaultValues: {
      name: "",
      code: "",
      entityType: "",
      description: "",
      isDefault: false,
    },
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !workflowData?.data) return;
    const w = workflowData.data;
    reset({
      name: w.name,
      code: w.code,
      entityType: w.entityType,
      description: w.description ?? "",
      isDefault: w.isDefault ?? false,
    });
  }, [isEdit, workflowData, reset]);

  const onSubmit = async (values: WorkflowFormValues) => {
    try {
      if (isEdit && workflowId) {
        await updateMutation.mutateAsync({
          id: workflowId,
          data: {
            name: values.name,
            description: values.description || undefined,
            isDefault: values.isDefault,
          },
        });
        toast.success("Workflow updated");
        router.push(`/workflows/${workflowId}`);
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          code: values.code,
          entityType: values.entityType as
            | "LEAD"
            | "QUOTATION"
            | "INVOICE"
            | "INSTALLATION"
            | "TICKET",
          description: values.description || undefined,
          isDefault: values.isDefault,
        });
        toast.success("Workflow created");
        router.push("/workflows");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} workflow`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingWorkflow) return <LoadingSpinner fullPage />;

  return (
    <div className="p-6" style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      <PageHeader
        title={isEdit ? "Edit Workflow" : "Create Workflow"}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit(onSubmit as any)}
        noValidate
        className="mt-4 max-w-3xl space-y-6"
      >
        {/* Workflow Information */}
        <Fieldset label="Workflow Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div>
                  <label style={labelStyle}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Workflow name"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.name}
                    errorMessage={errors.name?.message}
                  />
                </div>
              )}
            />
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <div>
                  <label style={labelStyle}>
                    Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Workflow code"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isEdit}
                    error={!!errors.code}
                    errorMessage={errors.code?.message}
                  />
                </div>
              )}
            />
            <Controller
              name="entityType"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Entity Type"
                  options={ENTITY_TYPE_OPTIONS}
                  value={field.value}
                  onChange={(v) => field.onChange(String(v ?? ""))}
                  disabled={isEdit}
                  error={!!errors.entityType}
                  errorMessage={errors.entityType?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div>
                  <label style={labelStyle}>Description</label>
                  <Input
                    placeholder="Workflow description"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>
          <div className="mt-4">
            <Controller
              name="isDefault"
              control={control}
              render={({ field }) => (
                <Switch
                  label="Default workflow"
                  checked={field.value ?? false}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
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
