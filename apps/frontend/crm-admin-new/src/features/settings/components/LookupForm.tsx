"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, Fieldset, Switch } from "@/components/ui";

import { FormErrors } from "@/components/common/FormErrors";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { useCreateLookup, useUpdateLookup, useLookupDetail } from "../hooks/useLookups";

// ── Validation Schema ────────────────────────────────────

const lookupSchema = z.object({
  category: z
    .string()
    .min(2, "Category code is required (min 2 characters)")
    .regex(
      /^[A-Za-z_\s]+$/,
      "Only letters, underscores and spaces allowed",
    ),
  displayName: z.string().min(2, "Display name is required (min 2 characters)"),
  description: z.string().optional(),
  isSystem: z.boolean().optional(),
});

type LookupFormValues = z.infer<typeof lookupSchema>;

// ── Component ────────────────────────────────────────────

interface LookupFormProps {
  mode?: "page" | "panel";
  panelId?: string;
  lookupId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LookupForm({ mode = "page", panelId, lookupId, onSuccess, onCancel }: LookupFormProps) {
  const router = useRouter();
  const isEdit = !!lookupId;

  const createMutation = useCreateLookup();
  const updateMutation = useUpdateLookup();
  const { data: detailData, isLoading: detailLoading } = useLookupDetail(lookupId ?? "");

  const formId = panelId ? `sp-form-lookup-${lookupId ?? "new"}` : undefined;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LookupFormValues>({
    resolver: zodResolver(lookupSchema) as any,
    defaultValues: {
      category: "",
      displayName: "",
      description: "",
      isSystem: false,
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (!isEdit || !detailData) return;
    const d = detailData?.data;
    if (!d) return;
    const lookup = typeof d === "object" && "data" in d ? (d as any).data : d;
    if (!lookup) return;
    reset({
      category: lookup.category ?? "",
      displayName: lookup.displayName ?? "",
      description: lookup.description ?? "",
      isSystem: lookup.isSystem ?? false,
    });
  }, [isEdit, detailData, reset]);

  const onSubmit = async (values: LookupFormValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: lookupId!,
          data: {
            displayName: values.displayName,
            description: values.description || undefined,
          },
        });
        toast.success("Lookup updated");
      } else {
        await createMutation.mutateAsync({
          category: values.category,
          displayName: values.displayName,
          description: values.description || undefined,
          isSystem: values.isSystem,
        });
        toast.success("Lookup created");
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/settings/lookups");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} lookup`;
      toast.error(message);
    }
  };

  if (isEdit && detailLoading) {
    return <LoadingSpinner />;
  }

  // Panel mode — compact form without page header
  if (mode === "panel") {
    return (
      <div className="p-4">
        <FormErrors errors={errors} />
        <form
          id={formId}
          onSubmit={(handleSubmit as any)(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Category Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. INDUSTRY or LEAD_SOURCE"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isEdit}
                    error={!!errors.category}
                    errorMessage={errors.category?.message}
                  />
                  {!isEdit && (
                    <p className="mt-1 text-xs text-gray-400">
                      Auto-uppercased. Spaces become underscores.
                    </p>
                  )}
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
                    placeholder="e.g. Industry Type"
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
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Input
                    placeholder="Optional description"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            {!isEdit && (
              <Controller
                name="isSystem"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-3 py-1">
                    <Switch
                      size="sm"
                      checked={!!field.value}
                      onChange={(v: boolean) => field.onChange(v)}
                    />
                    <span className="text-sm text-gray-700">System Lookup</span>
                  </div>
                )}
              />
            )}
          </div>
        </form>
      </div>
    );
  }

  // Page mode — full page with header
  return (
    <div className="p-6">
      <PageHeader
        title={isEdit ? "Edit Lookup" : "New Lookup"}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <Icon name="arrow-left" size={16} /> Back
          </Button>
        }
      />

      <FormErrors errors={errors} />

      <form
        onSubmit={(handleSubmit as any)(onSubmit)}
        noValidate
        className="mt-4 max-w-3xl space-y-6"
      >
        <Fieldset label="Lookup Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Category Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. INDUSTRY or LEAD_SOURCE"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isEdit}
                    error={!!errors.category}
                    errorMessage={errors.category?.message}
                  />
                  {!isEdit && (
                    <p className="mt-1 text-xs text-gray-400">
                      Auto-uppercased. Spaces become underscores.
                    </p>
                  )}
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
                    placeholder="e.g. Industry Type"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.displayName}
                    errorMessage={errors.displayName?.message}
                  />
                </div>
              )}
            />
            <div className="sm:col-span-2">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <Input
                      placeholder="Optional description"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </div>
                )}
              />
            </div>
            {!isEdit && (
              <Controller
                name="isSystem"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-3 py-1">
                    <Switch
                      size="sm"
                      checked={!!field.value}
                      onChange={(v: boolean) => field.onChange(v)}
                    />
                    <span className="text-sm text-gray-700">System Lookup</span>
                  </div>
                )}
              />
            )}
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
            <Icon name="check" size={16} /> {isEdit ? "Update" : "Save"}
          </Button>
          <Button variant="outline" onClick={onCancel ?? (() => router.back())}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
