"use client";

import { Control, Controller, FieldErrors, UseFormWatch } from "react-hook-form";

import { Icon, Input, Fieldset } from "@/components/ui";
import { SmartDateInput } from "@/components/common/SmartDateInput";
import { LeadSelect } from "@/components/common/LeadSelect";
import type { LeadSelectOption } from "@/components/common/LeadSelect";
import { ContactSelect } from "@/components/common/ContactSelect";
import { OrganizationSelect } from "@/components/common/OrganizationSelect";
import { AddressFields } from "@/components/common/AddressFields";

// ---------------------------------------------------------------------------
// Types (minimal slice for header/billing fields)
// ---------------------------------------------------------------------------

interface ProformaFormValues {
  billingName?: string;
  proformaDate?: string;
  validUntil?: string;
  quotationId?: string;
  leadId?: string;
  contactId?: string;
  organizationId?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingPincode?: string;
  billingGstNumber?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProformaHeaderFieldsProps {
  control: Control<ProformaFormValues>;
  errors: FieldErrors<ProformaFormValues>;
  watch: UseFormWatch<ProformaFormValues>;
  setValue: (name: string, value: unknown) => void;
  billingStateCode: string;
  onBillingStateCodeChange: (code: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProformaHeaderFields({
  control,
  errors,
  watch,
  setValue,
  billingStateCode,
  onBillingStateCodeChange,
}: ProformaHeaderFieldsProps) {
  return (
    <>
      {/* ----------------------------------------------------------------
          Proforma Information
      ---------------------------------------------------------------- */}
      <Fieldset label="Proforma Information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Billing Name */}
          <Controller
            name="billingName"
            control={control as any}
            render={({ field }) => (
              <Input
                label="Billing Name"
                required
                leftIcon={<Icon name="user" size={16} />}
                placeholder="Billing name"
                value={(field.value as string) ?? ""}
                onChange={field.onChange}
                error={!!(errors as any).billingName}
                errorMessage={(errors as any).billingName?.message}
              />
            )}
          />

          {/* Proforma Date */}
          <Controller
            name="proformaDate"
            control={control as any}
            render={({ field }) => (
              <SmartDateInput
                label="Proforma Date"
                value={(field.value as string) || null}
                onChange={(v) => field.onChange(v ?? "")}
              />
            )}
          />

          {/* Valid Until */}
          <Controller
            name="validUntil"
            control={control as any}
            render={({ field }) => (
              <SmartDateInput
                label="Valid Until"
                value={(field.value as string) || null}
                onChange={(v) => field.onChange(v ?? "")}
              />
            )}
          />

          {/* Quotation ID */}
          <Controller
            name="quotationId"
            control={control as any}
            render={({ field }) => (
              <Input
                label="Quotation ID"
                leftIcon={<Icon name="file-text" size={16} />}
                placeholder="Quotation ID"
                value={(field.value as string) ?? ""}
                onChange={field.onChange}
              />
            )}
          />

          {/* Lead */}
          <Controller
            name="leadId"
            control={control as any}
            render={({ field }) => (
              <LeadSelect
                label="Lead"
                value={(field.value as string) || null}
                onChange={(val) => field.onChange(String(val ?? ""))}
                onLeadSelect={(lead: LeadSelectOption | null) => {
                  if (lead) {
                    setValue("contactId", lead.contactId);
                    setValue("organizationId", lead.organizationId ?? "");
                    setValue(
                      "billingName",
                      `${lead.contactFirstName} ${lead.contactLastName}`.trim(),
                    );
                  }
                }}
                error={!!(errors as any).leadId}
                errorMessage={(errors as any).leadId?.message}
              />
            )}
          />

          {/* Contact */}
          <Controller
            name="contactId"
            control={control as any}
            render={({ field }) => (
              <ContactSelect
                label="Contact"
                value={(field.value as string) || null}
                onChange={(val) => field.onChange(String(val ?? ""))}
              />
            )}
          />

          {/* Organization */}
          <Controller
            name="organizationId"
            control={control as any}
            render={({ field }) => (
              <OrganizationSelect
                label="Organization"
                value={(field.value as string) || null}
                onChange={(val) => field.onChange(String(val ?? ""))}
              />
            )}
          />
        </div>
      </Fieldset>

      {/* ----------------------------------------------------------------
          Billing Address
      ---------------------------------------------------------------- */}
      <Fieldset label="Billing Address">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Controller
            name="billingAddress"
            control={control as any}
            render={({ field }) => (
              <Input
                label="Address"
                leftIcon={<Icon name="map-pin" size={16} />}
                placeholder="Street address"
                value={(field.value as string) ?? ""}
                onChange={field.onChange}
              />
            )}
          />

          <div className="sm:col-span-3">
            <AddressFields
              stateCode={billingStateCode}
              city={String(watch("billingCity") ?? "")}
              pincode={String(watch("billingPincode") ?? "")}
              showCountry={false}
              columns={3}
              onChange={(patch) => {
                if (patch.stateCode !== undefined) onBillingStateCodeChange(patch.stateCode);
                if (patch.state !== undefined) setValue("billingState", patch.state);
                if (patch.city !== undefined) setValue("billingCity", patch.city);
                if (patch.pincode !== undefined) setValue("billingPincode", patch.pincode);
              }}
            />
          </div>

          <Controller
            name="billingGstNumber"
            control={control as any}
            render={({ field }) => (
              <Input
                label="GST Number"
                leftIcon={<Icon name="receipt" size={16} />}
                placeholder="GST number"
                value={(field.value as string) ?? ""}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </Fieldset>
    </>
  );
}
