"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, MobileInput, Fieldset } from "@/components/ui";

import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { LookupSelect } from "@/components/common/LookupSelect";
import { OrganizationSelect } from "@/components/common/OrganizationSelect";
import { PageHeader } from "@/components/common/PageHeader";

import { useSidePanelStore } from "@/stores/side-panel.store";

import { useFormConfig } from "@/features/form-config/hooks/useFormConfig";
import { FormConfigButton } from "@/features/form-config/components/FormConfigButton";

import {
  useContactDetail,
  useCreateContact,
  useUpdateContact,
} from "../hooks/useContacts";

import type { CommunicationInput } from "../types/contacts.types";

// ── Validation Schema ────────────────────────────────────

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  organizationId: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  notes: z.string().optional(),
  sourceId: z.string().optional(),
  categoryId: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

// ── Props ────────────────────────────────────────────────

interface ContactFormProps {
  contactId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Component ────────────────────────────────────────────

export function ContactForm({ contactId, mode = "page", panelId, onSuccess, onCancel }: ContactFormProps) {
  const router = useRouter();
  const isEdit = !!contactId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const { isFieldVisible, getFieldLabel } = useFormConfig("form-contacts");

  const { data: contactData, isLoading: isLoadingContact } = useContactDetail(
    contactId ?? "",
  );
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      organizationId: "",
      designation: "",
      department: "",
      notes: "",
      sourceId: "",
      categoryId: "",
    },
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !contactData?.data) return;
    const c = contactData.data;
    const primaryEmail = c.communications?.find(
      (comm) => comm.type === "EMAIL" && comm.isPrimary,
    )?.value ?? c.communications?.find((comm) => comm.type === "EMAIL")?.value ?? "";
    const primaryPhone = c.communications?.find(
      (comm) => (comm.type === "MOBILE" || comm.type === "PHONE") && comm.isPrimary,
    )?.value ?? c.communications?.find(
      (comm) => comm.type === "MOBILE" || comm.type === "PHONE",
    )?.value ?? "";
    const sourceFilter = c.filters?.find(
      (f) => f.lookupValue?.lookup?.category === "CONTACT_SOURCE",
    );
    const categoryFilter = c.filters?.find(
      (f) => f.lookupValue?.lookup?.category === "CONTACT_CATEGORY",
    );

    reset({
      firstName: c.firstName,
      lastName: c.lastName,
      email: primaryEmail,
      phone: primaryPhone,
      organizationId: (c as any).organizationId ?? "",
      designation: c.designation ?? "",
      department: c.department ?? "",
      notes: c.notes ?? "",
      sourceId: sourceFilter?.lookupValueId ?? "",
      categoryId: categoryFilter?.lookupValueId ?? "",
    });
  }, [isEdit, contactData, reset]);

  // Sync isSubmitting → panel footer button (loading / disabled / label)
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
            const formId = `sp-form-contact-${contactId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, contactId, updatePanelConfig]);

  const onSubmit = async (values: ContactFormValues) => {
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

    // Build filterIds from source/category
    const filterIds: string[] = [];
    if (values.sourceId) filterIds.push(values.sourceId);
    if (values.categoryId) filterIds.push(values.categoryId);

    try {
      if (isEdit && contactId) {
        await updateMutation.mutateAsync({
          id: contactId,
          data: {
            firstName: values.firstName,
            lastName: values.lastName,
            organizationId: values.organizationId || undefined,
            designation: values.designation || undefined,
            department: values.department || undefined,
            notes: values.notes || undefined,
            communications: communications.length > 0 ? communications : undefined,
            filterIds: filterIds.length > 0 ? filterIds : undefined,
          },
        });
        toast.success("Contact updated");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push(`/contacts/${contactId}`);
        }
      } else {
        await createMutation.mutateAsync({
          firstName: values.firstName,
          lastName: values.lastName,
          organizationId: values.organizationId || undefined,
          designation: values.designation || undefined,
          department: values.department || undefined,
          notes: values.notes || undefined,
          communications: communications.length > 0 ? communications : undefined,
          filterIds: filterIds.length > 0 ? filterIds : undefined,
        });
        toast.success("Contact created");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push("/contacts");
        }
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} contact`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingContact) return <LoadingSpinner fullPage />;

  const isPanel = mode === "panel";

  // Section visibility helpers
  const showPersonalInfo = isFieldVisible("firstName") || isFieldVisible("lastName") || isFieldVisible("email") || isFieldVisible("phone");
  const showCompany = isFieldVisible("organizationId") || isFieldVisible("designation") || isFieldVisible("department") || isFieldVisible("sourceId") || isFieldVisible("categoryId");
  const showNotes = isFieldVisible("notes");

  return (
    <div className={isPanel ? "p-4" : "p-6"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Contact" : "New Contact"}
          actions={
            <div className="flex items-center gap-2">
              <FormConfigButton formKey="form-contacts" />
              <Button variant="outline" onClick={() => router.back()}>
                <Icon name="arrow-left" size={16} /> Back
              </Button>
            </div>
          }
        />
      )}

      {isPanel && (
        <div className="flex justify-end mb-2">
          <FormConfigButton formKey="form-contacts" />
        </div>
      )}

      <FormErrors errors={errors} />

      <form
        id={isPanel ? `sp-form-contact-${contactId ?? "new"}` : undefined}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={`${isPanel ? "mt-2" : "mt-4"} max-w-3xl space-y-6`}
      >
        {/* Personal Information */}
        {showPersonalInfo && (
          <Fieldset label="Personal Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isFieldVisible("firstName") && (
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label={getFieldLabel("firstName")}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.firstName}
                      errorMessage={errors.firstName?.message}
                      leftIcon={<Icon name="user" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("lastName") && (
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label={getFieldLabel("lastName")}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.lastName}
                      errorMessage={errors.lastName?.message}
                      leftIcon={<Icon name="user" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("email") && (
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label={getFieldLabel("email")}
                      type="email"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      error={!!errors.email}
                      errorMessage={errors.email?.message}
                      leftIcon={<Icon name="mail" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("phone") && (
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <MobileInput
                      label={getFieldLabel("phone")}
                      defaultCountry="IN"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  )}
                />
              )}
            </div>
          </Fieldset>
        )}

        {/* Company */}
        {showCompany && (
          <Fieldset label="Company">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isFieldVisible("organizationId") && (
                <div className="sm:col-span-2">
                  <Controller
                    name="organizationId"
                    control={control}
                    render={({ field }) => (
                      <OrganizationSelect
                        label={getFieldLabel("organizationId")}
                        value={field.value ?? null}
                        onChange={(v) => field.onChange(v ?? "")}
                        leftIcon={<Icon name="building" size={16} />}
                      />
                    )}
                  />
                </div>
              )}
              {isFieldVisible("designation") && (
                <Controller
                  name="designation"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="DESIGNATION"
                      label={getFieldLabel("designation")}
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(String(v ?? ""))}
                      leftIcon={<Icon name="briefcase" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("department") && (
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="DEPARTMENT"
                      label={getFieldLabel("department")}
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(String(v ?? ""))}
                      leftIcon={<Icon name="users" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("sourceId") && (
                <Controller
                  name="sourceId"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="CONTACT_SOURCE"
                      label={getFieldLabel("sourceId")}
                      valueKey="id"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? "")}
                      leftIcon={<Icon name="target" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("categoryId") && (
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="CONTACT_CATEGORY"
                      label={getFieldLabel("categoryId")}
                      valueKey="id"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? "")}
                      leftIcon={<Icon name="tag" size={16} />}
                    />
                  )}
                />
              )}
            </div>
          </Fieldset>
        )}

        {/* Notes */}
        {showNotes && (
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <Icon name="file-text" size={14} className="text-gray-400" /> {getFieldLabel("notes")}
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  rows={3}
                  placeholder={getFieldLabel("notes")}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </div>
            )}
          />
        )}

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
