"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";

import { Input, Switch } from "@/components/ui";

import { FormErrors } from "@/components/common/FormErrors";

import type { LookupValueItem, LookupValueCreateData, LookupValueUpdateData } from "../types/lookup.types";

// ── Schema ──────────────────────────────────────────────

const valueSchema = z.object({
  value: z.string().min(1, "Value code is required"),
  label: z.string().min(1, "Label is required"),
  icon: z.string().optional(),
  color: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type ValueFormValues = z.infer<typeof valueSchema>;

// ── Props ───────────────────────────────────────────────

interface LookupValueFormProps {
  category: string;
  panelId: string;
  initialData?: LookupValueItem;
  onSubmit: (data: LookupValueCreateData | LookupValueUpdateData) => Promise<void>;
  onCancel: () => void;
}

// ── Component ───────────────────────────────────────────

export function LookupValueForm({
  category,
  panelId,
  initialData,
  onSubmit,
  onCancel,
}: LookupValueFormProps) {
  const isEdit = !!initialData;
  const formId = `sp-form-${panelId}`;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ValueFormValues>({
    resolver: zodResolver(valueSchema) as any,
    defaultValues: {
      value: initialData?.value ?? "",
      label: initialData?.label ?? "",
      icon: initialData?.icon ?? "",
      color: initialData?.color ?? "",
      isDefault: initialData?.isDefault ?? false,
    },
  });

  const handleFormSubmit = async (values: ValueFormValues) => {
    if (isEdit) {
      await onSubmit({
        label: values.label,
        icon: values.icon || undefined,
        color: values.color || undefined,
        isDefault: values.isDefault,
      } as LookupValueUpdateData);
    } else {
      await onSubmit({
        value: values.value,
        label: values.label,
        icon: values.icon || undefined,
        color: values.color || undefined,
        isDefault: values.isDefault,
      } as LookupValueCreateData);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-3 px-2 py-1.5 bg-gray-50 rounded text-xs text-gray-500">
        Category: <span className="font-medium text-gray-700">{category}</span>
      </div>

      <FormErrors errors={errors} />

      <form
        id={formId}
        onSubmit={(handleSubmit as any)(handleFormSubmit)}
        noValidate
        className="space-y-4"
      >
        <Controller
          name="value"
          control={control}
          render={({ field }) => (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Value Code <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder={`e.g. ${category}_READY_PRODUCT`}
                value={field.value}
                onChange={field.onChange}
                disabled={isEdit}
                error={!!errors.value}
                errorMessage={errors.value?.message}
              />
              {!isEdit && (
                <p className="mt-1 text-xs text-gray-400">
                  Unique code used in API. Cannot be changed later.
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="label"
          control={control}
          render={({ field }) => (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Label <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Ready Product"
                value={field.value}
                onChange={field.onChange}
                error={!!errors.label}
                errorMessage={errors.label?.message}
              />
            </div>
          )}
        />

        <Controller
          name="icon"
          control={control}
          render={({ field }) => (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Icon
              </label>
              <Input
                placeholder="e.g. package or emoji"
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Color
              </label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="#3B82F6"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
                {field.value && (
                  <span
                    className="inline-block w-8 h-8 rounded border border-gray-200 shrink-0"
                    style={{ backgroundColor: field.value }}
                  />
                )}
              </div>
            </div>
          )}
        />

        <Controller
          name="isDefault"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3 py-1">
              <Switch
                size="sm"
                checked={!!field.value}
                onChange={(v: boolean) => field.onChange(v)}
              />
              <span className="text-sm text-gray-700">Default Value</span>
            </div>
          )}
        />
      </form>
    </div>
  );
}
