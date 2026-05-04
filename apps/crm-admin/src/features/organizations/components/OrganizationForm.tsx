"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, CurrencyInput, Fieldset, TextareaInput } from "@/components/ui";

import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { LookupSelect } from "@/components/common/LookupSelect";
import { PageHeader } from "@/components/common/PageHeader";
import { AddressFields } from "@/components/common/AddressFields";

import { useSidePanelStore } from "@/stores/side-panel.store";

import { useFormConfig } from "@/features/form-config/hooks/useFormConfig";
import { FormConfigButton } from "@/features/form-config/components/FormConfigButton";

import {
  useOrganizationDetail,
  useCreateOrganization,
  useUpdateOrganization,
} from "../hooks/useOrganizations";

// ── Validation Schema ────────────────────────────────────

const organizationSchema = z.object({
  name: z.string().min(2, "Company name is required (min 2 characters)"),
  gstNumber: z.string().optional(),
  annualRevenue: z.number().nullable().optional(),
  industryId: z.string().optional(),
  orgTypeId: z.string().optional(),
  orgCategoryId: z.string().optional(),
  orgGroupId: z.string().optional(),
  orgStatusId: z.string().optional(),
  businessTypeId: z.string().optional(),
  website: z.string().optional(),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  countryCode: z.string().optional(),
  country: z.string().optional(),
  stateCode: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  notes: z.string().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

// ── Props ────────────────────────────────────────────────

interface OrganizationFormProps {
  organizationId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Component ────────────────────────────────────────────

export function OrganizationForm({ organizationId, mode = "page", panelId, onSuccess, onCancel }: OrganizationFormProps) {
  const router = useRouter();
  const isEdit = !!organizationId;

  const { isFieldVisible, getFieldLabel } = useFormConfig("form-organizations");

  const { data: orgData, isLoading: isLoadingOrg } = useOrganizationDetail(
    organizationId ?? "",
  );
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      gstNumber: "",
      annualRevenue: null,
      industryId: "",
      orgTypeId: "",
      orgCategoryId: "",
      orgGroupId: "",
      orgStatusId: "",
      businessTypeId: "",
      website: "",
      email: "",
      phone: "",
      address: "",
      countryCode: "IN",
      country: "",
      stateCode: "",
      state: "",
      city: "",
      pincode: "",
      notes: "",
    },
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !orgData?.data) return;
    const o = orgData.data;
    const findFilter = (cat: string) =>
      o.filters?.find((f: any) => f.lookupValue?.lookup?.category === cat)?.lookupValueId ?? "";

    reset({
      name: o.name,
      gstNumber: o.gstNumber ?? "",
      annualRevenue: o.annualRevenue ?? null,
      industryId: findFilter("INDUSTRY_TYPE"),
      orgTypeId: findFilter("ORGANIZATION_TYPE"),
      orgCategoryId: findFilter("ORGANIZATION_CATEGORY"),
      orgGroupId: findFilter("ORGANIZATION_GROUP"),
      orgStatusId: findFilter("ORGANIZATION_STATUS"),
      businessTypeId: findFilter("BUSINESS_TYPE"),
      website: o.website ?? "",
      email: o.email ?? "",
      phone: o.phone ?? "",
      address: o.address ?? "",
      countryCode: (o as any).countryCode ?? "IN",
      country: o.country ?? "",
      stateCode: (o as any).stateCode ?? "",
      state: o.state ?? "",
      city: o.city ?? "",
      pincode: o.pincode ?? "",
      notes: o.notes ?? "",
    });
  }, [isEdit, orgData, reset]);

  // Sync isSubmitting → panel footer button
  useEffect(() => {
    if (!panelId) return;
    updatePanelConfig(panelId, {
      footerButtons: [
        {
          id: "cancel",
          label: "Cancel",
          showAs: "text" as const,
          variant: "secondary" as const,
          disabled: isSubmitting,
          onClick: () => {},
        },
        {
          id: "save",
          label: isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Save Changes" : "Save",
          icon: "check",
          showAs: "both" as const,
          variant: "primary" as const,
          loading: isSubmitting,
          disabled: isSubmitting,
          onClick: () => {
            const formId = `sp-form-org-${organizationId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, updatePanelConfig]);

  const onSubmit = async (values: OrganizationFormValues) => {
    const filterIds = [
      values.industryId, values.orgTypeId, values.orgCategoryId,
      values.orgGroupId, values.orgStatusId, values.businessTypeId,
    ].filter(Boolean) as string[];

    const payload = {
      name: values.name,
      gstNumber: values.gstNumber || undefined,
      annualRevenue: values.annualRevenue ?? undefined,
      website: values.website || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
      city: values.city || undefined,
      state: values.state || undefined,
      country: values.country || undefined,
      pincode: values.pincode || undefined,
      notes: values.notes || undefined,
      filterIds: filterIds.length > 0 ? filterIds : undefined,
    };

    try {
      if (isEdit && organizationId) {
        await updateMutation.mutateAsync({ id: organizationId, data: payload });
        toast.success("Organization updated");
        if (mode === "panel" && onSuccess) onSuccess();
        else router.push(`/organizations/${organizationId}`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Organization created");
        if (mode === "panel" && onSuccess) onSuccess();
        else router.push("/organizations");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} organization`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingOrg) return <LoadingSpinner fullPage />;

  const isPanel = mode === "panel";

  // Section visibility helpers
  const showCompanyInfo = isFieldVisible("name") || isFieldVisible("industryId") || isFieldVisible("gstNumber") || isFieldVisible("annualRevenue");
  const showClassification = isFieldVisible("orgTypeId") || isFieldVisible("orgCategoryId") || isFieldVisible("orgGroupId") || isFieldVisible("orgStatusId") || isFieldVisible("businessTypeId");
  const showContact = isFieldVisible("website") || isFieldVisible("email") || isFieldVisible("phone");
  const showAddress = isFieldVisible("address") || isFieldVisible("city") || isFieldVisible("state") || isFieldVisible("country") || isFieldVisible("pincode");
  const showNotes = isFieldVisible("notes");

  return (
    <div className={isPanel ? "p-4" : "p-6"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Organization" : "New Organization"}
          actions={
            <div className="flex items-center gap-2">
              <FormConfigButton formKey="form-organizations" />
              <Button variant="outline" onClick={() => router.back()}>
                <Icon name="arrow-left" size={16} /> Back
              </Button>
            </div>
          }
        />
      )}

      {isPanel && (
        <div className="flex justify-end mb-2">
          <FormConfigButton formKey="form-organizations" />
        </div>
      )}

      <FormErrors errors={errors} />

      <form
        id={isPanel ? `sp-form-org-${organizationId ?? "new"}` : undefined}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={`${isPanel ? "mt-2" : "mt-4"} max-w-3xl space-y-6`}
      >
        {/* Company Information */}
        {showCompanyInfo && (
          <Fieldset label="Company Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isFieldVisible("name") && (
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label={getFieldLabel("name")}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.name}
                      errorMessage={errors.name?.message}
                      leftIcon={<Icon name="building" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("industryId") && (
                <Controller
                  name="industryId"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="INDUSTRY_TYPE"
                      label={getFieldLabel("industryId")}
                      valueKey="id"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? "")}
                      leftIcon={<Icon name="briefcase" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("gstNumber") && (
                <Controller
                  name="gstNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label={getFieldLabel("gstNumber")}
                      value={field.value ?? ""}
                      onChange={(v) => field.onChange(v.toUpperCase().slice(0, 15))}
                      leftIcon={<Icon name="hash" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("annualRevenue") && (
                <Controller
                  name="annualRevenue"
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      label={getFieldLabel("annualRevenue")}
                      currency="INR"
                      value={field.value ?? null}
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
              {isFieldVisible("orgTypeId") && (
                <Controller
                  name="orgTypeId"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="ORGANIZATION_TYPE"
                      label={getFieldLabel("orgTypeId")}
                      valueKey="id"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? "")}
                      leftIcon={<Icon name="building" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("orgCategoryId") && (
                <Controller
                  name="orgCategoryId"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="ORGANIZATION_CATEGORY"
                      label={getFieldLabel("orgCategoryId")}
                      valueKey="id"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? "")}
                      leftIcon={<Icon name="tag" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("orgGroupId") && (
                <Controller
                  name="orgGroupId"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="ORGANIZATION_GROUP"
                      label={getFieldLabel("orgGroupId")}
                      valueKey="id"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? "")}
                      leftIcon={<Icon name="users" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("orgStatusId") && (
                <Controller
                  name="orgStatusId"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="ORGANIZATION_STATUS"
                      label={getFieldLabel("orgStatusId")}
                      valueKey="id"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? "")}
                      leftIcon={<Icon name="activity" size={16} />}
                    />
                  )}
                />
              )}
              {isFieldVisible("businessTypeId") && (
                <Controller
                  name="businessTypeId"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="BUSINESS_TYPE"
                      label={getFieldLabel("businessTypeId")}
                      valueKey="id"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? "")}
                      leftIcon={<Icon name="briefcase" size={16} />}
                    />
                  )}
                />
              )}
            </div>
          </Fieldset>
        )}

        {/* Contact */}
        {showContact && (
          <Fieldset label="Contact">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isFieldVisible("website") && (
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label={getFieldLabel("website")}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      leftIcon={<Icon name="globe" size={16} />}
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
                    <Input
                      label={getFieldLabel("phone")}
                      type="tel"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      leftIcon={<Icon name="phone" size={16} />}
                    />
                  )}
                />
              )}
            </div>
          </Fieldset>
        )}

        {/* Address */}
        {showAddress && (
          <Fieldset label="Address">
            {isFieldVisible("address") && (
              <div className="mb-4">
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label={getFieldLabel("address")}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      leftIcon={<Icon name="map-pin" size={16} />}
                    />
                  )}
                />
              </div>
            )}
            <AddressFields
              countryCode={watch("countryCode") ?? "IN"}
              stateCode={watch("stateCode") ?? ""}
              city={watch("city") ?? ""}
              pincode={watch("pincode") ?? ""}
              columns={2}
              onChange={(patch) => {
                if (patch.countryCode !== undefined) setValue("countryCode", patch.countryCode);
                if (patch.country   !== undefined) setValue("country",     patch.country);
                if (patch.stateCode !== undefined) setValue("stateCode",   patch.stateCode);
                if (patch.state     !== undefined) setValue("state",       patch.state);
                if (patch.city      !== undefined) setValue("city",        patch.city);
                if (patch.pincode   !== undefined) setValue("pincode",     patch.pincode);
              }}
            />
          </Fieldset>
        )}

        {/* Notes */}
        {showNotes && (
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextareaInput
                label={getFieldLabel("notes")}
                rows={3}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        )}

        {/* Submit — hidden in panel mode */}
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
