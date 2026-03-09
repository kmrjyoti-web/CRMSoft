"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Input, SelectInput, Fieldset } from "@/components/ui";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import { useSidePanelStore } from "@/stores/side-panel.store";

import {
  useTicketDetail,
  useCreateTicket,
  useUpdateTicket,
} from "../hooks/usePostSales";

// ---------------------------------------------------------------------------
// Zod Schema
// ---------------------------------------------------------------------------

const ticketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  priority: z.string().min(1, "Priority is required"),
  category: z.string().min(1, "Category is required"),
  contactId: z.string().optional(),
  organizationId: z.string().optional(),
  leadId: z.string().optional(),
  assignedToId: z.string().optional(),
  tags: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TicketFormProps {
  ticketId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TicketForm({ ticketId, mode = "page", panelId, onSuccess, onCancel }: TicketFormProps) {
  const router = useRouter();
  const isEdit = !!ticketId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  // -- Queries & Mutations --------------------------------------------------
  const { data: ticketData, isLoading: isLoadingTicket } = useTicketDetail(
    ticketId ?? "",
  );
  const createMutation = useCreateTicket();
  const updateMutation = useUpdateTicket();

  // -- Form Setup -----------------------------------------------------------
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: "",
      category: "",
      contactId: "",
      organizationId: "",
      leadId: "",
      assignedToId: "",
      tags: "",
      notes: "",
      internalNotes: "",
    },
  });

  // -- Pre-populate in edit mode --------------------------------------------
  useEffect(() => {
    if (!isEdit || !ticketData?.data) return;
    const t = ticketData.data;
    reset({
      subject: t.subject ?? "",
      description: t.description ?? "",
      priority: t.priority ?? "",
      category: t.category ?? "",
      contactId: t.contactId ?? "",
      organizationId: t.organizationId ?? "",
      leadId: t.leadId ?? "",
      assignedToId: t.assignedToId ?? "",
      tags: t.tags ?? "",
      notes: t.notes ?? "",
      internalNotes: t.internalNotes ?? "",
    });
  }, [isEdit, ticketData, reset]);

  // -- Sync isSubmitting → panel footer button ----------------------------
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
          label: isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Save Changes" : "Save",
          icon: "check",
          showAs: "both",
          variant: "primary",
          loading: isSubmitting,
          disabled: isSubmitting,
          onClick: () => {
            const formId = `sp-form-ticket-${ticketId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, ticketId, updatePanelConfig]);

  // -- Submit handler -------------------------------------------------------
  const onSubmit = async (values: TicketFormValues) => {
    try {
      if (isEdit && ticketId) {
        await updateMutation.mutateAsync({ id: ticketId, data: values as any });
        toast.success("Ticket updated");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push(`/post-sales/tickets/${ticketId}`);
        }
      } else {
        await createMutation.mutateAsync(values as any);
        toast.success("Ticket created");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push("/post-sales/tickets");
        }
      }
    } catch {
      toast.error(
        isEdit ? "Failed to update ticket" : "Failed to create ticket",
      );
    }
  };

  // -- Loading state --------------------------------------------------------
  if (isEdit && isLoadingTicket) return <LoadingSpinner fullPage />;

  // -- Render ---------------------------------------------------------------
  const isPanel = mode === "panel";

  return (
    <div className={isPanel ? "p-4" : "p-6"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Ticket" : "New Ticket"}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          }
        />
      )}

      <form
        id={isPanel ? `sp-form-ticket-${ticketId ?? "new"}` : undefined}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={`${isPanel ? "mt-2" : "mt-4"} max-w-5xl space-y-6`}
      >
        <FormErrors errors={errors} />

        {/* ----------------------------------------------------------------
            Ticket Information
        ---------------------------------------------------------------- */}
        <Fieldset label="Ticket Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subject — full width */}
            <div className="md:col-span-2">
              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Ticket subject"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      error={!!errors.subject}
                      errorMessage={errors.subject?.message}
                    />
                  </div>
                )}
              />
            </div>

            {/* Priority */}
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Priority *"
                  options={[
                    { label: "Low", value: "LOW" },
                    { label: "Medium", value: "MEDIUM" },
                    { label: "High", value: "HIGH" },
                    { label: "Urgent", value: "URGENT" },
                  ]}
                  value={field.value}
                  onChange={(v) => field.onChange(String(v ?? ""))}
                  error={!!errors.priority}
                  errorMessage={errors.priority?.message}
                />
              )}
            />

            {/* Category */}
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Category *"
                  options={[
                    { label: "Installation", value: "INSTALLATION" },
                    { label: "Product", value: "PRODUCT" },
                    { label: "Billing", value: "BILLING" },
                    { label: "General", value: "GENERAL" },
                    { label: "Feature Request", value: "FEATURE_REQUEST" },
                    { label: "Bug", value: "BUG" },
                  ]}
                  value={field.value}
                  onChange={(v) => field.onChange(String(v ?? ""))}
                  error={!!errors.category}
                  errorMessage={errors.category?.message}
                />
              )}
            />

            {/* Assigned To ID */}
            <Controller
              name="assignedToId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To ID
                  </label>
                  <Input
                    placeholder="Assigned to user ID"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            {/* Contact ID */}
            <Controller
              name="contactId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact ID
                  </label>
                  <Input
                    placeholder="Contact ID"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            {/* Organization ID */}
            <Controller
              name="organizationId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization ID
                  </label>
                  <Input
                    placeholder="Organization ID"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            {/* Lead ID */}
            <Controller
              name="leadId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead ID
                  </label>
                  <Input
                    placeholder="Lead ID"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            {/* Tags */}
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <Input
                    placeholder="Comma-separated tags"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>

          {/* Description (full width) */}
          <div className="mt-4">
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    rows={3}
                    placeholder="Describe the ticket..."
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </div>
              )}
            />
          </div>
        </Fieldset>

        {/* ----------------------------------------------------------------
            Notes
        ---------------------------------------------------------------- */}
        <Fieldset label="Notes" toggleable defaultCollapsed>
          <div className="space-y-4">
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    rows={3}
                    placeholder="Notes visible on ticket..."
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </div>
              )}
            />

            <Controller
              name="internalNotes"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Internal Notes
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    rows={3}
                    placeholder="Internal notes (not visible to customer)..."
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </div>
              )}
            />
          </div>
        </Fieldset>

        {/* ----------------------------------------------------------------
            Actions — hidden in panel mode (footer handles it)
        ---------------------------------------------------------------- */}
        {!isPanel && (
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Update" : "Save"}
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
