"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, MobileInput, SelectInput, Fieldset } from "@/components/ui";

import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import { useSidePanelStore } from "@/stores/side-panel.store";

import {
  useRawContactDetail,
  useCreateRawContact,
  useUpdateRawContact,
} from "../hooks/useRawContacts";

import type { CommunicationInput } from "../types/raw-contacts.types";

// ── Validation Schema ────────────────────────────────────

const rawContactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
});

type RawContactFormValues = z.infer<typeof rawContactSchema>;

// ── Props ────────────────────────────────────────────────

interface RawContactFormProps {
  rawContactId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SOURCE_OPTIONS = [
  { value: "MANUAL", label: "Manual" },
  { value: "BULK_IMPORT", label: "Bulk Import" },
  { value: "WEB_FORM", label: "Web Form" },
  { value: "REFERRAL", label: "Referral" },
  { value: "API", label: "API" },
];

// ── Component ────────────────────────────────────────────

export function RawContactForm({ rawContactId, mode = "page", panelId, onSuccess, onCancel }: RawContactFormProps) {
  const router = useRouter();
  const isEdit = !!rawContactId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const { data: contactData, isLoading: isLoadingContact } = useRawContactDetail(
    rawContactId ?? "",
  );
  const createMutation = useCreateRawContact();
  const updateMutation = useUpdateRawContact();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RawContactFormValues>({
    resolver: zodResolver(rawContactSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
      designation: "",
      department: "",
      notes: "",
      source: "MANUAL",
    },
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !contactData?.data) return;
    const c = contactData.data;
    const primaryEmail =
      c.communications?.find((comm) => comm.type === "EMAIL" && comm.isPrimary)?.value ??
      c.communications?.find((comm) => comm.type === "EMAIL")?.value ??
      "";
    const primaryPhone =
      c.communications?.find(
        (comm) => (comm.type === "MOBILE" || comm.type === "PHONE") && comm.isPrimary,
      )?.value ??
      c.communications?.find(
        (comm) => comm.type === "MOBILE" || comm.type === "PHONE",
      )?.value ??
      "";

    reset({
      firstName: c.firstName,
      lastName: c.lastName,
      email: primaryEmail,
      phone: primaryPhone,
      companyName: c.companyName ?? "",
      designation: c.designation ?? "",
      department: c.department ?? "",
      notes: c.notes ?? "",
      source: c.source ?? "MANUAL",
    });
  }, [isEdit, contactData, reset]);

  // Sync isSubmitting → panel footer button
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
            const formId = `sp-form-${rawContactId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, rawContactId, updatePanelConfig]);

  const onSubmit = async (values: RawContactFormValues) => {
    // Build communications array from email/phone
    const communications: CommunicationInput[] = [];
    if (values.email) {
      communications.push({
        type: "EMAIL",
        value: values.email,
        priorityType: "PRIMARY",
        isPrimary: true,
      });
    }
    if (values.phone) {
      communications.push({
        type: "MOBILE",
        value: values.phone,
        priorityType: "PRIMARY",
        isPrimary: !values.email,
      });
    }

    try {
      if (isEdit && rawContactId) {
        await updateMutation.mutateAsync({
          id: rawContactId,
          data: {
            firstName: values.firstName,
            lastName: values.lastName,
            companyName: values.companyName || undefined,
            designation: values.designation || undefined,
            department: values.department || undefined,
            notes: values.notes || undefined,
          },
        });
        toast.success("Raw contact updated");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push(`/raw-contacts/${rawContactId}`);
        }
      } else {
        await createMutation.mutateAsync({
          firstName: values.firstName,
          lastName: values.lastName,
          source: (values.source as any) || undefined,
          companyName: values.companyName || undefined,
          designation: values.designation || undefined,
          department: values.department || undefined,
          notes: values.notes || undefined,
          communications: communications.length > 0 ? communications : undefined,
        });
        toast.success("Raw contact created");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push("/raw-contacts");
        }
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} raw contact`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingContact) return <LoadingSpinner fullPage />;

  const isPanel = mode === "panel";

  return (
    <div className={isPanel ? "p-4" : "p-6"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Raw Contact" : "New Raw Contact"}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
          }
        />
      )}

      <FormErrors errors={errors} />

      <form
        id={isPanel ? `sp-form-${rawContactId ?? "new"}` : undefined}
        onSubmit={handleSubmit(onSubmit as any)}
        noValidate
        className={`${isPanel ? "mt-2" : "mt-4"} max-w-3xl space-y-6`}
      >
        {/* Personal Information */}
        <Fieldset label="Personal Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input
                  label="First Name"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.firstName}
                  errorMessage={errors.firstName?.message}
                  leftIcon={<Icon name="user" size={16} />}
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Last Name"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.lastName}
                  errorMessage={errors.lastName?.message}
                  leftIcon={<Icon name="user" size={16} />}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  label="Email"
                  type="email"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={!!errors.email}
                  errorMessage={errors.email?.message}
                  leftIcon={<Icon name="mail" size={16} />}
                />
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <MobileInput
                  label="Phone"
                  defaultCountry="IN"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* Company */}
        <Fieldset label="Company">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="companyName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Company Name"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  leftIcon={<Icon name="building" size={16} />}
                />
              )}
            />
            <Controller
              name="designation"
              control={control}
              render={({ field }) => (
                <Input
                  label="Designation"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  leftIcon={<Icon name="briefcase" size={16} />}
                />
              )}
            />
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <Input
                  label="Department"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  leftIcon={<Icon name="users" size={16} />}
                />
              )}
            />
            {!isEdit && (
              <Controller
                name="source"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    label="Source"
                    options={SOURCE_OPTIONS}
                    value={field.value ?? "MANUAL"}
                    onChange={(v) => field.onChange(String(v ?? "MANUAL"))}
                  />
                )}
              />
            )}
          </div>
        </Fieldset>

        {/* Notes */}
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <div>
              <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                <Icon name="file-text" size={14} className="text-gray-400" /> Notes
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

        {/* Submit — hidden in panel mode (footer handles it) */}
        {!isPanel && (
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
        )}
      </form>
    </div>
  );
}
