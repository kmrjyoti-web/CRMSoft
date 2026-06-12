"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, MobileInput, CurrencyInput, DatePicker, Rating, Fieldset } from "@/components/ui";

import { ContactSelect } from "@/components/common/ContactSelect";
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
  useLeadDetail,
  useCreateLead,
  useUpdateLead,
  useQuickCreateLead,
} from "../hooks/useLeads";

import type { LeadPriority, InlineContactData, InlineOrganizationData } from "../types/leads.types";

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
  contactId: z.string().optional(),
  organizationId: z.string().optional(),
  priority: z.number().min(1).max(5),
  expectedValue: z.number().nullable().optional(),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional(),
  leadTypeId: z.string().optional(),
  leadCategoryId: z.string().optional(),
  leadGroupId: z.string().optional(),
  customerBudgetId: z.string().optional(),
  previousSoftwareId: z.string().optional(),
  itInfraId: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

// ── Props ────────────────────────────────────────────────

interface LeadFormProps {
  leadId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Component ────────────────────────────────────────────

export function LeadForm({ leadId, mode = "page", panelId, onSuccess, onCancel }: LeadFormProps) {
  const router = useRouter();
  const isEdit = !!leadId;
  const isPanel = mode === "panel";
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const { isFieldVisible, getFieldLabel } = useFormConfig("form-leads");

  const { data: leadData, isLoading: isLoadingLead } = useLeadDetail(
    leadId ?? "",
  );
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const quickCreateMutation = useQuickCreateLead();

  // ── Quick-add state ──────────────────────────────────
  const [quickContact, setQuickContact] = useState<InlineContactData | null>(null);
  const [quickOrg, setQuickOrg] = useState<InlineOrganizationData | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema) as any,
    defaultValues: {
      contactId: "",
      organizationId: "",
      priority: 3,
      expectedValue: null,
      expectedCloseDate: "",
      notes: "",
      leadTypeId: "",
      leadCategoryId: "",
      leadGroupId: "",
      customerBudgetId: "",
      previousSoftwareId: "",
      itInfraId: "",
    },
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !leadData?.data) return;
    const l = leadData.data;
    const findFilter = (cat: string) =>
      l.filters?.find((f: any) => f.lookupValue?.lookup?.category === cat)?.lookupValueId ?? "";

    reset({
      contactId: l.contactId,
      organizationId: l.organizationId ?? "",
      priority: PRIORITY_TO_RATING[l.priority] ?? 3,
      expectedValue: l.expectedValue ?? null,
      expectedCloseDate: l.expectedCloseDate ?? "",
      notes: l.notes ?? "",
      leadTypeId: findFilter("LEAD_TYPE"),
      leadCategoryId: findFilter("LEAD_CATEGORY"),
      leadGroupId: findFilter("LEAD_GROUP"),
      customerBudgetId: findFilter("CUSTOMER_BUDGET"),
      previousSoftwareId: findFilter("PREVIOUS_SOFTWARE"),
      itInfraId: findFilter("IT_INFRA"),
    });
  }, [isEdit, leadData, reset]);

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
            const formId = `sp-form-lead-${leadId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, leadId, updatePanelConfig]);

  const onSubmit = async (values: LeadFormValues) => {
    // Validate: either existing contactId or quick-add contact
    if (!quickContact && !values.contactId) {
      toast.error("Please select a contact or use Quick Add");
      return;
    }

    // Validate quick-add contact fields
    if (quickContact) {
      if (!quickContact.firstName.trim()) {
        toast.error("First Name is required for quick-add contact");
        return;
      }
      if (!quickContact.lastName.trim()) {
        toast.error("Last Name is required for quick-add contact");
        return;
      }
      if (!quickContact.mobile.trim()) {
        toast.error("Mobile is required for quick-add contact");
        return;
      }
    }

    // Validate quick-add org
    if (quickOrg && !quickOrg.name.trim()) {
      toast.error("Organization Name is required");
      return;
    }

    const priority = RATING_TO_PRIORITY[values.priority] ?? "MEDIUM";

    const filterIds = [
      values.leadTypeId, values.leadCategoryId, values.leadGroupId,
      values.customerBudgetId, values.previousSoftwareId, values.itInfraId,
    ].filter(Boolean) as string[];

    try {
      if (isEdit && leadId) {
        // Edit mode — standard update (no quick-add)
        const updatePayload = {
          priority,
          expectedValue: values.expectedValue ?? undefined,
          expectedCloseDate: values.expectedCloseDate || undefined,
          notes: values.notes || undefined,
          filterIds: filterIds.length > 0 ? filterIds : undefined,
        };
        await updateMutation.mutateAsync({ id: leadId, data: updatePayload });
        toast.success("Lead updated");
        if (isPanel) {
          onSuccess?.();
        } else {
          router.push(`/leads/${leadId}`);
        }
      } else if (quickContact || quickOrg) {
        // Quick-create mode — single atomic request
        await quickCreateMutation.mutateAsync({
          contactId: quickContact ? undefined : values.contactId,
          inlineContact: quickContact || undefined,
          organizationId: quickOrg ? undefined : (values.organizationId || undefined),
          inlineOrganization: quickOrg || undefined,
          priority,
          expectedValue: values.expectedValue ?? undefined,
          expectedCloseDate: values.expectedCloseDate || undefined,
          notes: values.notes || undefined,
          filterIds: filterIds.length > 0 ? filterIds : undefined,
        });
        toast.success("Lead created");
        if (isPanel) {
          onSuccess?.();
        } else {
          router.push("/leads");
        }
      } else {
        // Standard create — existing contact
        await createMutation.mutateAsync({
          contactId: values.contactId!,
          organizationId: values.organizationId || undefined,
          priority,
          expectedValue: values.expectedValue ?? undefined,
          expectedCloseDate: values.expectedCloseDate || undefined,
          notes: values.notes || undefined,
          filterIds: filterIds.length > 0 ? filterIds : undefined,
        });
        toast.success("Lead created");
        if (isPanel) {
          onSuccess?.();
        } else {
          router.push("/leads");
        }
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} lead`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingLead) return <LoadingSpinner fullPage />;

  // Section visibility helpers
  const showLeadInfo = isFieldVisible("contactId") || isFieldVisible("organizationId") || isFieldVisible("priority") || isFieldVisible("expectedValue") || isFieldVisible("expectedCloseDate");
  const showClassification = isFieldVisible("leadTypeId") || isFieldVisible("leadCategoryId") || isFieldVisible("leadGroupId") || isFieldVisible("customerBudgetId") || isFieldVisible("previousSoftwareId") || isFieldVisible("itInfraId");
  const showNotes = isFieldVisible("notes");

  return (
    <div className={isPanel ? "p-4" : "p-6"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />

      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Lead" : "New Lead"}
          actions={
            <div className="flex items-center gap-2">
              <FormConfigButton formKey="form-leads" />
              <Button variant="outline" onClick={() => router.back()}>
                <Icon name="arrow-left" size={16} /> Back
              </Button>
            </div>
          }
        />
      )}

      {isPanel && (
        <div className="flex justify-end mb-2">
          <FormConfigButton formKey="form-leads" />
        </div>
      )}

      <FormErrors errors={errors} />

      <form
        id={isPanel ? `sp-form-lead-${leadId ?? "new"}` : undefined}
        onSubmit={handleSubmit(onSubmit) as any}
        noValidate
        className={isPanel ? "space-y-5" : "mt-4 max-w-3xl space-y-6"}
      >
        {/* Lead Information */}
        {showLeadInfo && (
          <Fieldset label="Lead Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isFieldVisible("contactId") && (
                <>
                  {quickContact ? (
                    /* ── Quick-Add Contact Inline Fields ── */
                    <div className="sm:col-span-2 rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-700">
                          <Icon name="user-plus" size={14} className="inline mr-1" />
                          Quick Add Contact
                        </span>
                        <button
                          type="button"
                          className="text-xs text-blue-500 hover:underline"
                          onClick={() => setQuickContact(null)}
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Input
                          label="First Name"
                          required
                          value={quickContact.firstName}
                          onChange={(v) => setQuickContact((prev) => prev ? { ...prev, firstName: v } : null)}
                          leftIcon={<Icon name="user" size={16} />}
                        />
                        <Input
                          label="Last Name"
                          required
                          value={quickContact.lastName}
                          onChange={(v) => setQuickContact((prev) => prev ? { ...prev, lastName: v } : null)}
                          leftIcon={<Icon name="user" size={16} />}
                        />
                      </div>
                      <MobileInput
                        label="Mobile Number"
                        defaultCountry="IN"
                        value={quickContact.mobile}
                        onChange={(v) => setQuickContact((prev) => prev ? { ...prev, mobile: v } : null)}
                      />
                    </div>
                  ) : (
                    <Controller
                      name="contactId"
                      control={control}
                      render={({ field }) => (
                        <ContactSelect
                          label={getFieldLabel("contactId")}
                          required
                          value={field.value}
                          onChange={(v) => field.onChange(v ?? "")}
                          onContactSelected={(contact) => {
                            if (contact.organizationId) {
                              setValue("organizationId", contact.organizationId);
                            }
                          }}
                          onQuickAdd={() => {
                            setQuickContact({ firstName: "", lastName: "", mobile: "" });
                            setValue("contactId", "");
                          }}
                          error={!!errors.contactId}
                          errorMessage={errors.contactId?.message}
                          disabled={isEdit}
                          leftIcon={<Icon name="user" size={16} />}
                        />
                      )}
                    />
                  )}
                </>
              )}
              {isFieldVisible("organizationId") && (
                <>
                  {quickOrg ? (
                    /* ── Quick-Add Organization Inline Field ── */
                    <div className="sm:col-span-2 rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-700">
                          <Icon name="building" size={14} className="inline mr-1" />
                          Quick Add Organization
                        </span>
                        <button
                          type="button"
                          className="text-xs text-green-500 hover:underline"
                          onClick={() => setQuickOrg(null)}
                        >
                          Cancel
                        </button>
                      </div>
                      <Input
                        label="Organization Name"
                        required
                        value={quickOrg.name}
                        onChange={(v) => setQuickOrg((prev) => prev ? { ...prev, name: v } : null)}
                        leftIcon={<Icon name="building" size={16} />}
                      />
                    </div>
                  ) : (
                    <Controller
                      name="organizationId"
                      control={control}
                      render={({ field }) => (
                        <OrganizationSelect
                          label={getFieldLabel("organizationId")}
                          value={field.value ?? null}
                          onChange={(v) => field.onChange(v ?? "")}
                          onQuickAdd={() => {
                            setQuickOrg({ name: "" });
                            setValue("organizationId", "");
                          }}
                          leftIcon={<Icon name="building" size={16} />}
                        />
                      )}
                    />
                  )}
                </>
              )}
              {isFieldVisible("priority") && (
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Rating
                      label={getFieldLabel("priority")}
                      max={5}
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                    />
                  )}
                />
              )}
              {isFieldVisible("expectedValue") && (
                <Controller
                  name="expectedValue"
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      label={getFieldLabel("expectedValue")}
                      currency="INR"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v)}
                    />
                  )}
                />
              )}
              {isFieldVisible("expectedCloseDate") && (
                <Controller
                  name="expectedCloseDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label={getFieldLabel("expectedCloseDate")}
                      value={field.value ?? ""}
                      onChange={(v) => field.onChange(v)}
                    />
                  )}
                />
              )}
            </div>
          </Fieldset>
        )}

        {/* Classification */}
        {showClassification && (
          <Fieldset label="Classification">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isFieldVisible("leadTypeId") && (
                <Controller
                  name="leadTypeId"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="LEAD_TYPE"
                      label={getFieldLabel("leadTypeId")}
                      valueKey="id"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? "")}
                      leftIcon={<Icon name="tag" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("leadCategoryId") && (
                <Controller
                  name="leadCategoryId"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="LEAD_CATEGORY"
                      label={getFieldLabel("leadCategoryId")}
                      valueKey="id"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? "")}
                      leftIcon={<Icon name="layers" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("leadGroupId") && (
                <Controller
                  name="leadGroupId"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="LEAD_GROUP"
                      label={getFieldLabel("leadGroupId")}
                      valueKey="id"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? "")}
                      leftIcon={<Icon name="users" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("customerBudgetId") && (
                <Controller
                  name="customerBudgetId"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="CUSTOMER_BUDGET"
                      label={getFieldLabel("customerBudgetId")}
                      valueKey="id"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? "")}
                      leftIcon={<Icon name="dollar-sign" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("previousSoftwareId") && (
                <Controller
                  name="previousSoftwareId"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="PREVIOUS_SOFTWARE"
                      label={getFieldLabel("previousSoftwareId")}
                      valueKey="id"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? "")}
                      leftIcon={<Icon name="monitor" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("itInfraId") && (
                <Controller
                  name="itInfraId"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="IT_INFRA"
                      label={getFieldLabel("itInfraId")}
                      valueKey="id"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? "")}
                      leftIcon={<Icon name="database" size={16} />}
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
              <Input
                label={getFieldLabel("notes")}
                value={field.value ?? ""}
                onChange={field.onChange}
                leftIcon={<Icon name="file-text" size={16} />}
              />
            )}
          />
        )}

        {/* Submit — only in page mode */}
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
            <Button variant="outline" onClick={onCancel ?? (() => router.back())}>
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
