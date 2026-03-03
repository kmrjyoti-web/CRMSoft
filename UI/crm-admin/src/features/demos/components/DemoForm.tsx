"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, SelectInput, DatePicker, Fieldset } from "@/components/ui";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import { useDemoDetail, useCreateDemo, useUpdateDemo } from "../hooks/useDemos";

// ── Validation Schema ────────────────────────────────────

const demoSchema = z.object({
  mode: z.string().min(1, "Mode is required"),
  scheduledAt: z.string().min(1, "Scheduled date is required"),
  meetingLink: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  leadId: z.string().min(1, "Lead is required"),
  conductedById: z.string().optional(),
});

type DemoFormValues = z.infer<typeof demoSchema>;

// ── Props ────────────────────────────────────────────────

interface DemoFormProps {
  demoId?: string;
}

// ── Component ────────────────────────────────────────────

export function DemoForm({ demoId }: DemoFormProps) {
  const router = useRouter();
  const isEdit = !!demoId;

  const { data: demoData, isLoading: isLoadingDemo } = useDemoDetail(
    demoId ?? "",
  );
  const createMutation = useCreateDemo();
  const updateMutation = useUpdateDemo();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DemoFormValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      mode: "",
      scheduledAt: "",
      meetingLink: "",
      location: "",
      notes: "",
      leadId: "",
      conductedById: "",
    },
  });

  const watchMode = watch("mode");

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !demoData?.data) return;
    const d = demoData.data;
    reset({
      mode: d.mode,
      scheduledAt: d.scheduledAt ?? "",
      meetingLink: d.meetingLink ?? "",
      location: d.location ?? "",
      notes: d.notes ?? "",
      leadId: d.leadId,
      conductedById: d.conductedById ?? "",
    });
  }, [isEdit, demoData, reset]);

  const onSubmit = async (values: DemoFormValues) => {
    const payload = {
      mode: values.mode as "ONLINE" | "OFFLINE",
      scheduledAt: values.scheduledAt,
      meetingLink: values.meetingLink || undefined,
      location: values.location || undefined,
      notes: values.notes || undefined,
      leadId: values.leadId,
      conductedById: values.conductedById || undefined,
    };

    try {
      if (isEdit && demoId) {
        const { leadId: _, conductedById: __, ...updatePayload } = payload;
        await updateMutation.mutateAsync({ id: demoId, data: updatePayload });
        toast.success("Demo updated");
        router.push(`/demos/${demoId}`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Demo created");
        router.push("/demos");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} demo`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingDemo) return <LoadingSpinner fullPage />;

  return (
    <div className="p-6" style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      <PageHeader
        title={isEdit ? "Edit Demo" : "New Demo"}
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
        {/* Demo Information */}
        <Fieldset label="Demo Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="mode"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Mode"
                  options={[
                    { label: "Online", value: "ONLINE" },
                    { label: "Offline", value: "OFFLINE" },
                  ]}
                  value={field.value}
                  onChange={(v) => field.onChange(String(v ?? ""))}
                />
              )}
            />
            <Controller
              name="scheduledAt"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Scheduled At"
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
            <Controller
              name="leadId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Lead ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Lead ID"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.leadId}
                    errorMessage={errors.leadId?.message}
                  />
                </div>
              )}
            />
            <Controller
              name="conductedById"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Conducted By
                  </label>
                  <Input
                    placeholder="User ID"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>
        </Fieldset>

        {/* Details */}
        <Fieldset label="Details">
          <div className="space-y-4">
            {watchMode === "ONLINE" && (
              <Controller
                name="meetingLink"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Meeting Link
                    </label>
                    <Input
                      placeholder="https://..."
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </div>
                )}
              />
            )}
            {watchMode === "OFFLINE" && (
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <Input
                      placeholder="Meeting location"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </div>
                )}
              />
            )}
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    rows={3}
                    placeholder="Additional notes"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </div>
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
