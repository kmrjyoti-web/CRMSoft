"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, Fieldset, Switch } from "@/components/ui";

import { FormErrors } from "@/components/common/FormErrors";
import { PageHeader } from "@/components/common/PageHeader";

import { useCreateLookup } from "../hooks/useLookups";

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

export function LookupForm() {
  const router = useRouter();
  const createMutation = useCreateLookup();

  const {
    control,
    handleSubmit,
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

  const onSubmit = async (values: LookupFormValues) => {
    try {
      await createMutation.mutateAsync({
        category: values.category,
        displayName: values.displayName,
        description: values.description || undefined,
        isSystem: values.isSystem,
      });
      toast.success("Lookup created");
      router.push("/settings/lookups");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create lookup";
      toast.error(message);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="New Lookup"
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
                    error={!!errors.category}
                    errorMessage={errors.category?.message}
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Auto-uppercased. Spaces become underscores.
                  </p>
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
            <Controller
              name="isSystem"
              control={control}
              render={({ field }) => (
                <Switch
                  label="System Lookup"
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
            <Icon name="check" size={16} /> Save
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
