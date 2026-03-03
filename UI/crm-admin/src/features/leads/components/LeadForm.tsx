"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, CurrencyInput, DatePicker, Rating, Fieldset } from "@/components/ui";

import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useLeadDetail,
  useCreateLead,
  useUpdateLead,
} from "../hooks/useLeads";

import type { LeadPriority } from "../types/leads.types";

// ── Priority mapping ────────────────────────────────────

const RATING_TO_PRIORITY: Record<number, LeadPriority> = {
  1: "LOW",
  2: "LOW",
  3: "MEDIUM",
  4: "HIGH",
  5: "URGENT",
};

const PRIORITY_TO_RATING: Record<LeadPriority, number> = {
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  URGENT: 5,
};

// ── Validation Schema ────────────────────────────────────

const leadSchema = z.object({
  contactId: z.string().min(1, "Contact is required"),
  organizationId: z.string().optional(),
  priority: z.number().min(1).max(5),
  expectedValue: z.number().nullable().optional(),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

// ── Props ────────────────────────────────────────────────

interface LeadFormProps {
  leadId?: string;
}

// ── Component ────────────────────────────────────────────

export function LeadForm({ leadId }: LeadFormProps) {
  const router = useRouter();
  const isEdit = !!leadId;

  const { data: leadData, isLoading: isLoadingLead } = useLeadDetail(
    leadId ?? "",
  );
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      contactId: "",
      organizationId: "",
      priority: 3,
      expectedValue: null,
      expectedCloseDate: "",
      notes: "",
    },
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !leadData?.data) return;
    const l = leadData.data;
    reset({
      contactId: l.contactId,
      organizationId: l.organizationId ?? "",
      priority: PRIORITY_TO_RATING[l.priority] ?? 3,
      expectedValue: l.expectedValue ?? null,
      expectedCloseDate: l.expectedCloseDate ?? "",
      notes: l.notes ?? "",
    });
  }, [isEdit, leadData, reset]);

  const onSubmit = async (values: LeadFormValues) => {
    const priority = RATING_TO_PRIORITY[values.priority] ?? "MEDIUM";

    const payload = {
      contactId: values.contactId,
      organizationId: values.organizationId || undefined,
      priority,
      expectedValue: values.expectedValue ?? undefined,
      expectedCloseDate: values.expectedCloseDate || undefined,
      notes: values.notes || undefined,
    };

    try {
      if (isEdit && leadId) {
        const { contactId: _, ...updatePayload } = payload;
        await updateMutation.mutateAsync({ id: leadId, data: updatePayload });
        toast.success("Lead updated");
        router.push(`/leads/${leadId}`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Lead created");
        router.push("/leads");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} lead`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingLead) return <LoadingSpinner fullPage />;

  return (
    <div className="p-6" style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      <PageHeader
        title={isEdit ? "Edit Lead" : "New Lead"}
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
        {/* Lead Information */}
        <Fieldset label="Lead Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="contactId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Contact <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Contact ID"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.contactId}
                    errorMessage={errors.contactId?.message}
                  />
                </div>
              )}
            />
            <Controller
              name="organizationId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Organization
                  </label>
                  <Input
                    placeholder="Organization ID"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Rating
                  label="Priority"
                  max={5}
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
            <Controller
              name="expectedValue"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  label="Expected Value"
                  currency="INR"
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
            <Controller
              name="expectedCloseDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Expected Close Date"
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* Notes */}
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
                placeholder="Notes"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </div>
          )}
        />

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
