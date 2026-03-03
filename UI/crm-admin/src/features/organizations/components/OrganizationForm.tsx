"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, InputMask, CurrencyInput, Fieldset } from "@/components/ui";

import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { LookupSelect } from "@/components/common/LookupSelect";
import { PageHeader } from "@/components/common/PageHeader";

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
  website: z.string().optional(),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  notes: z.string().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

// ── Props ────────────────────────────────────────────────

interface OrganizationFormProps {
  organizationId?: string;
}

// ── Component ────────────────────────────────────────────

export function OrganizationForm({ organizationId }: OrganizationFormProps) {
  const router = useRouter();
  const isEdit = !!organizationId;

  const { data: orgData, isLoading: isLoadingOrg } = useOrganizationDetail(
    organizationId ?? "",
  );
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      gstNumber: "",
      annualRevenue: null,
      industryId: "",
      website: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      notes: "",
    },
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !orgData?.data) return;
    const o = orgData.data;
    const industryFilter = o.filters?.find(
      (f) => f.lookupValue?.value?.startsWith("INDUSTRY_TYPE"),
    );

    reset({
      name: o.name,
      gstNumber: o.gstNumber ?? "",
      annualRevenue: o.annualRevenue ?? null,
      industryId: industryFilter?.lookupValueId ?? "",
      website: o.website ?? "",
      email: o.email ?? "",
      phone: o.phone ?? "",
      address: o.address ?? "",
      city: o.city ?? "",
      state: o.state ?? "",
      country: o.country ?? "",
      pincode: o.pincode ?? "",
      notes: o.notes ?? "",
    });
  }, [isEdit, orgData, reset]);

  const onSubmit = async (values: OrganizationFormValues) => {
    const filterIds: string[] = [];
    if (values.industryId) filterIds.push(values.industryId);

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
        router.push(`/organizations/${organizationId}`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Organization created");
        router.push("/organizations");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} organization`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingOrg) return <LoadingSpinner fullPage />;

  return (
    <div className="p-6" style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      <PageHeader
        title={isEdit ? "Edit Organization" : "New Organization"}
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
        {/* Company Information */}
        <Fieldset label="Company Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Company Name"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.name}
                    errorMessage={errors.name?.message}
                  />
                </div>
              )}
            />
            <Controller
              name="industryId"
              control={control}
              render={({ field }) => (
                <LookupSelect
                  masterCode="INDUSTRY_TYPE"
                  label="Industry"
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v ?? "")}
                />
              )}
            />
            <Controller
              name="gstNumber"
              control={control}
              render={({ field }) => (
                <InputMask
                  label="GST Number"
                  maskType="custom"
                  customMask="99AAAAA9999A9A9"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="annualRevenue"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  label="Annual Revenue"
                  currency="INR"
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* Contact */}
        <Fieldset label="Contact">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="website"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <Input
                    placeholder="https://example.com"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    leftIcon={<Icon name="globe" size={18} />}
                  />
                </div>
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    error={!!errors.email}
                    errorMessage={errors.email?.message}
                    leftIcon={<Icon name="mail" size={18} />}
                  />
                </div>
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    placeholder="Phone"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    leftIcon={<Icon name="phone" size={18} />}
                  />
                </div>
              )}
            />
          </div>
        </Fieldset>

        {/* Address */}
        <Fieldset label="Address">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <Input
                    placeholder="Street address"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <Input
                    placeholder="Country"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              name="pincode"
              control={control}
              render={({ field }) => (
                <InputMask
                  label="PIN Code"
                  maskType="custom"
                  customMask="999999"
                  value={field.value ?? ""}
                  onChange={field.onChange}
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
