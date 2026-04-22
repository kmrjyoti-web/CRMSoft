"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, DatePicker, Fieldset, TextareaInput } from "@/components/ui";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import { useSidePanelStore } from "@/stores/side-panel.store";

import {
  useInstallationDetail,
  useCreateInstallation,
  useUpdateInstallation,
} from "../hooks/usePostSales";

// ---------------------------------------------------------------------------
// Zod Schema
// ---------------------------------------------------------------------------

const installationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  leadId: z.string().optional(),
  contactId: z.string().optional(),
  organizationId: z.string().optional(),
  quotationId: z.string().optional(),
  invoiceId: z.string().optional(),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  assignedToId: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

type InstallationFormValues = z.infer<typeof installationSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface InstallationFormProps {
  installationId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InstallationForm({ installationId, mode = "page", panelId, onSuccess, onCancel }: InstallationFormProps) {
  const router = useRouter();
  const isEdit = !!installationId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  // -- Queries & Mutations --------------------------------------------------
  const { data: installationData, isLoading: isLoadingInstallation } =
    useInstallationDetail(installationId ?? "");
  const createMutation = useCreateInstallation();
  const updateMutation = useUpdateInstallation();

  // -- Form Setup -----------------------------------------------------------
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InstallationFormValues>({
    resolver: zodResolver(installationSchema),
    defaultValues: {
      title: "",
      description: "",
      leadId: "",
      contactId: "",
      organizationId: "",
      quotationId: "",
      invoiceId: "",
      scheduledDate: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      assignedToId: "",
      notes: "",
      internalNotes: "",
    },
  });

  // -- Pre-populate in edit mode --------------------------------------------
  useEffect(() => {
    if (!isEdit || !installationData?.data) return;
    const inst = installationData.data;
    reset({
      title: inst.title ?? "",
      description: inst.description ?? "",
      leadId: inst.leadId ?? "",
      contactId: inst.contactId ?? "",
      organizationId: inst.organizationId ?? "",
      quotationId: inst.quotationId ?? "",
      invoiceId: inst.invoiceId ?? "",
      scheduledDate: inst.scheduledDate ?? "",
      address: inst.address ?? "",
      city: inst.city ?? "",
      state: inst.state ?? "",
      pincode: inst.pincode ?? "",
      assignedToId: inst.assignedToId ?? "",
      notes: inst.notes ?? "",
      internalNotes: inst.internalNotes ?? "",
    });
  }, [isEdit, installationData, reset]);

  // -- Submit handler -------------------------------------------------------
  const onSubmit = async (values: InstallationFormValues) => {
    try {
      if (isEdit && installationId) {
        await updateMutation.mutateAsync({ id: installationId, data: values });
        toast.success("Installation updated");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push(`/post-sales/installations/${installationId}`);
        }
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Installation created");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push("/post-sales/installations");
        }
      }
    } catch {
      toast.error(
        isEdit
          ? "Failed to update installation"
          : "Failed to create installation",
      );
    }
  };

  // -- Panel footer sync ----------------------------------------------------
  const isPanel = mode === "panel";

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
            ? isEdit
              ? "Updating..."
              : "Saving..."
            : isEdit
              ? "Save Changes"
              : "Save",
          icon: "check",
          showAs: "both",
          variant: "primary",
          loading: isSubmitting,
          disabled: isSubmitting,
          onClick: () => {
            const formId = `sp-form-installation-${installationId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, installationId, updatePanelConfig]);

  // -- Loading state --------------------------------------------------------
  if (isEdit && isLoadingInstallation) return <LoadingSpinner fullPage />;

  // -- Render ---------------------------------------------------------------
  return (
    <div className={isPanel ? "p-4" : "p-6"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Installation" : "New Installation"}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
          }
        />
      )}

      <form
        id={isPanel ? `sp-form-installation-${installationId ?? "new"}` : undefined}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-4 max-w-5xl space-y-6"
      >
        <FormErrors errors={errors} />

        {/* ----------------------------------------------------------------
            Installation Information
        ---------------------------------------------------------------- */}
        <Fieldset label="Installation Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Installation title"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    error={!!errors.title}
                    errorMessage={errors.title?.message}
                  />
                </div>
              )}
            />

            {/* Scheduled Date */}
            <Controller
              name="scheduledDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Scheduled Date *"
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(v)}
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

            {/* Quotation ID */}
            <Controller
              name="quotationId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quotation ID
                  </label>
                  <Input
                    placeholder="Quotation ID"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            {/* Invoice ID */}
            <Controller
              name="invoiceId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice ID
                  </label>
                  <Input
                    placeholder="Invoice ID"
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
                <TextareaInput
                  label="Description"
                  rows={3}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* ----------------------------------------------------------------
            Location
        ---------------------------------------------------------------- */}
        <Fieldset label="Location">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address */}
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <Input
                    placeholder="Street address"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            {/* City */}
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <Input
                    placeholder="City"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            {/* State */}
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <Input
                    placeholder="State"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            {/* Pincode */}
            <Controller
              name="pincode"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <Input
                    placeholder="Pincode"
                    value={field.value ?? ""}
                    onChange={field.onChange}
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
                <TextareaInput
                  label="Notes"
                  rows={3}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />

            <Controller
              name="internalNotes"
              control={control}
              render={({ field }) => (
                <TextareaInput
                  label="Internal Notes"
                  rows={3}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* ----------------------------------------------------------------
            Actions
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
