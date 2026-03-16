"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import {
  Button,
  Icon,
  Input,
  NumberInput,
  CurrencyInput,
  Fieldset,
  Typography,
  Modal,
  TextareaInput,
} from "@/components/ui";
import { SmartDateInput } from "@/components/common/SmartDateInput";
import { LookupSelect } from "@/components/common/LookupSelect";
import { ProductSelect } from "@/components/common/ProductSelect";
import type { ProductSelectOption } from "@/components/common/ProductSelect";
import { LeadSelect } from "@/components/common/LeadSelect";
import type { LeadSelectOption } from "@/components/common/LeadSelect";
import { ContactSelect } from "@/components/common/ContactSelect";
import { OrganizationSelect } from "@/components/common/OrganizationSelect";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { AddressFields } from "@/components/common/AddressFields";
import { useSidePanelStore } from "@/stores/side-panel.store";

import {
  useInvoiceDetail,
  useCreateInvoice,
  useUpdateInvoice,
} from "../hooks/useFinance";
import { calculateLineItem, calculateSummary, splitGst } from "@/features/quotations/utils/gst";
import type { InvoiceLineItem } from "../types/finance.types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const lineItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  hsnCode: z.string().optional(),
  quantity: z.number().min(0.01, "Quantity required"),
  unit: z.string().optional(),
  unitPrice: z.number().min(0, "Unit price required"),
  discountType: z.string().optional(),
  discountValue: z.number().nullable().optional(),
  gstRate: z.number().nullable().optional(),
  cessRate: z.number().nullable().optional(),
  notes: z.string().optional(),
});

const invoiceSchema = z.object({
  quotationId: z.string().optional(),
  leadId: z.string().optional(),
  contactId: z.string().optional(),
  organizationId: z.string().optional(),
  billingName: z.string().min(1, "Billing name is required"),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingPincode: z.string().optional(),
  billingGstNumber: z.string().optional(),
  shippingName: z.string().optional(),
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingPincode: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  invoiceDate: z.string().optional(),
  supplyDate: z.string().optional(),
  discountType: z.string().optional(),
  discountValue: z.number().nullable().optional(),
  isInterState: z.boolean().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item"),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  internalNotes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------


const DEFAULT_LINE_ITEM = {
  productId: "",
  productName: "",
  description: "",
  hsnCode: "",
  quantity: 1,
  unit: "PIECE",
  unitPrice: 0,
  discountType: "",
  discountValue: null,
  gstRate: 18,
  cessRate: null,
  notes: "",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface InvoiceFormProps {
  invoiceId?: string;
  leadId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InvoiceForm({ invoiceId, leadId: defaultLeadId, mode = "page", panelId, onSuccess, onCancel }: InvoiceFormProps) {
  const router = useRouter();
  const isEdit = !!invoiceId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const [isInterState, setIsInterState] = useState(false);
  const [billingStateCode, setBillingStateCode] = useState("");
  const [shippingStateCode, setShippingStateCode] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showInternalNotesModal, setShowInternalNotesModal] = useState(false);

  // -- Queries & Mutations --------------------------------------------------
  const { data: invoiceData, isLoading: isLoadingInvoice } =
    useInvoiceDetail(invoiceId ?? "");
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  // -- Form Setup -----------------------------------------------------------
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      quotationId: "",
      leadId: "",
      contactId: "",
      organizationId: "",
      billingName: "",
      billingAddress: "",
      billingCity: "",
      billingState: "",
      billingPincode: "",
      billingGstNumber: "",
      shippingName: "",
      shippingAddress: "",
      shippingCity: "",
      shippingState: "",
      shippingPincode: "",
      dueDate: "",
      invoiceDate: "",
      supplyDate: "",
      discountType: "",
      discountValue: null,
      isInterState: false,
      lineItems: [DEFAULT_LINE_ITEM],
      notes: "",
      termsAndConditions: "",
      internalNotes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  // -- Pre-populate in edit mode --------------------------------------------
  useEffect(() => {
    if (!isEdit || !invoiceData?.data) return;
    const inv = invoiceData.data;

    setIsInterState(inv.isInterState ?? false);

    reset({
      quotationId: inv.quotationId ?? "",
      leadId: inv.leadId ?? "",
      contactId: inv.contactId ?? "",
      organizationId: inv.organizationId ?? "",
      billingName: inv.billingName ?? "",
      billingAddress: inv.billingAddress ?? "",
      billingCity: inv.billingCity ?? "",
      billingState: inv.billingState ?? "",
      billingPincode: inv.billingPincode ?? "",
      billingGstNumber: inv.billingGstNumber ?? "",
      shippingName: inv.shippingName ?? "",
      shippingAddress: inv.shippingAddress ?? "",
      shippingCity: inv.shippingCity ?? "",
      shippingState: inv.shippingState ?? "",
      shippingPincode: inv.shippingPincode ?? "",
      dueDate: inv.dueDate ?? "",
      invoiceDate: inv.invoiceDate ?? "",
      supplyDate: inv.supplyDate ?? "",
      discountType: inv.discountType ?? "",
      discountValue: inv.discountValue ?? null,
      isInterState: inv.isInterState ?? false,
      lineItems: (inv.lineItems ?? []).map((li: InvoiceLineItem) => ({
        productId: (li as any).productId ?? "",
        productName: li.productName,
        description: li.description ?? "",
        hsnCode: li.hsnCode ?? "",
        quantity: li.quantity,
        unit: li.unit ?? "PIECE",
        unitPrice: li.unitPrice,
        discountType: li.discountType ?? "",
        discountValue: li.discountValue ?? null,
        gstRate: li.gstRate ?? null,
        cessRate: li.cessRate ?? null,
        notes: li.notes ?? "",
      })),
      notes: inv.notes ?? "",
      termsAndConditions: inv.termsAndConditions ?? "",
      internalNotes: inv.internalNotes ?? "",
    });
  }, [isEdit, invoiceData, reset]);

  // -- Pre-fill leadId when opened from Lead Dashboard -------------------------
  useEffect(() => {
    if (isEdit || !defaultLeadId) return;
    setValue("leadId", defaultLeadId);
  }, [isEdit, defaultLeadId, setValue]);

  // -- Sync isSubmitting → panel footer button (loading / disabled / label) --
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
            const formId = `sp-form-invoice-${invoiceId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, invoiceId, updatePanelConfig]);

  // -- Live summary calculation ---------------------------------------------
  const watchedLineItems = watch("lineItems");
  const watchedDiscountType = watch("discountType");
  const watchedDiscountValue = watch("discountValue");

  const summary = useMemo(() => {
    const items = (watchedLineItems || []).map((li) => ({
      quantity: li.quantity ?? 0,
      unitPrice: li.unitPrice ?? 0,
      discountType: li.discountType,
      discountValue: li.discountValue ?? undefined,
      gstRate: li.gstRate ?? undefined,
      cessRate: li.cessRate ?? undefined,
    }));
    return calculateSummary(
      items,
      watchedDiscountType || undefined,
      watchedDiscountValue ?? undefined,
      isInterState,
    );
  }, [watchedLineItems, watchedDiscountType, watchedDiscountValue, isInterState]);

  // -- Format currency helper -----------------------------------------------
  const fmt = (n: number) =>
    `\u20B9${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  // -- Submit handler -------------------------------------------------------
  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      const payload = {
        ...values,
        discountValue: values.discountValue ?? undefined,
        isInterState,
        lineItems: values.lineItems.map((li) => ({
          ...li,
          discountValue: li.discountValue ?? undefined,
          gstRate: li.gstRate ?? undefined,
          cessRate: li.cessRate ?? undefined,
        })),
      };

      if (isEdit && invoiceId) {
        const { lineItems, quotationId, leadId, contactId, organizationId, ...rest } = payload;
        await updateInvoice.mutateAsync({ id: invoiceId, data: rest });
        toast.success("Invoice updated");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push(`/invoices/${invoiceId}`);
        }
      } else {
        await createInvoice.mutateAsync(payload as any);
        toast.success("Invoice created");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push("/invoices");
        }
      }
    } catch {
      toast.error(isEdit ? "Failed to update invoice" : "Failed to create invoice");
    }
  };

  // -- Loading state --------------------------------------------------------
  if (isEdit && isLoadingInvoice) return <LoadingSpinner fullPage />;

  const isPanel = mode === "panel";

  // -- Render ---------------------------------------------------------------
  return (
    <div className={isPanel ? "p-4" : "p-6 max-w-5xl mx-auto"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Invoice" : "New Invoice"}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
          }
        />
      )}

      <form
        id={isPanel ? `sp-form-invoice-${invoiceId ?? "new"}` : undefined}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={`${isPanel ? "mt-2" : "mt-4 max-w-5xl"} space-y-6`}
      >
        <FormErrors errors={errors} />

        {/* ----------------------------------------------------------------
            Invoice Information
        ---------------------------------------------------------------- */}
        <Fieldset label="Invoice Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Billing Name */}
            <Controller
              name="billingName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Billing Name"
                  required
                  leftIcon={<Icon name="user" size={16} />}
                  placeholder="Billing name"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={!!errors.billingName}
                  errorMessage={errors.billingName?.message}
                />
              )}
            />

            {/* Due Date */}
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <SmartDateInput
                  label="Due Date"
                  required
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? "")}
                />
              )}
            />

            {/* Invoice Date */}
            <Controller
              name="invoiceDate"
              control={control}
              render={({ field }) => (
                <SmartDateInput
                  label="Invoice Date"
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? "")}
                />
              )}
            />

            {/* Supply Date */}
            <Controller
              name="supplyDate"
              control={control}
              render={({ field }) => (
                <SmartDateInput
                  label="Supply Date"
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? "")}
                />
              )}
            />

            {/* Quotation ID */}
            <Controller
              name="quotationId"
              control={control}
              render={({ field }) => (
                <Input
                  label="Quotation ID"
                  leftIcon={<Icon name="file-text" size={16} />}
                  placeholder="Quotation ID"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />

            {/* Lead */}
            <Controller
              name="leadId"
              control={control}
              render={({ field }) => (
                <LeadSelect
                  label="Lead"
                  value={field.value || null}
                  onChange={(val) => field.onChange(String(val ?? ""))}
                  onLeadSelect={(lead: LeadSelectOption | null) => {
                    if (lead) {
                      setValue("contactId", lead.contactId);
                      setValue("organizationId", lead.organizationId ?? "");
                      setValue("billingName", `${lead.contactFirstName} ${lead.contactLastName}`.trim());
                    }
                  }}
                  error={!!errors.leadId}
                  errorMessage={errors.leadId?.message}
                />
              )}
            />

            {/* Contact */}
            <Controller
              name="contactId"
              control={control}
              render={({ field }) => (
                <ContactSelect
                  label="Contact"
                  value={field.value || null}
                  onChange={(val) => field.onChange(String(val ?? ""))}
                />
              )}
            />

            {/* Organization */}
            <Controller
              name="organizationId"
              control={control}
              render={({ field }) => (
                <OrganizationSelect
                  label="Organization"
                  value={field.value || null}
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
              control={control}
              render={({ field }) => (
                <Input
                  label="Address"
                  leftIcon={<Icon name="map-pin" size={16} />}
                  placeholder="Street address"
                  value={field.value ?? ""}
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
                  if (patch.stateCode !== undefined) setBillingStateCode(patch.stateCode);
                  if (patch.state !== undefined) setValue("billingState", patch.state);
                  if (patch.city !== undefined) setValue("billingCity", patch.city);
                  if (patch.pincode !== undefined) setValue("billingPincode", patch.pincode);
                }}
              />
            </div>

            <Controller
              name="billingGstNumber"
              control={control}
              render={({ field }) => (
                <Input
                  label="GST Number"
                  leftIcon={<Icon name="receipt" size={16} />}
                  placeholder="GST number"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* ----------------------------------------------------------------
            Shipping Address
        ---------------------------------------------------------------- */}
        <Fieldset label="Shipping Address" toggleable defaultCollapsed>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Controller
              name="shippingName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Shipping Name"
                  leftIcon={<Icon name="user" size={16} />}
                  placeholder="Shipping name"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="shippingAddress"
              control={control}
              render={({ field }) => (
                <Input
                  label="Address"
                  leftIcon={<Icon name="map-pin" size={16} />}
                  placeholder="Shipping address"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />

            <div className="sm:col-span-3">
              <AddressFields
                stateCode={shippingStateCode}
                city={String(watch("shippingCity") ?? "")}
                pincode={String(watch("shippingPincode") ?? "")}
                showCountry={false}
                columns={3}
                onChange={(patch) => {
                  if (patch.stateCode !== undefined) setShippingStateCode(patch.stateCode);
                  if (patch.state !== undefined) setValue("shippingState" as any, patch.state);
                  if (patch.city !== undefined) setValue("shippingCity", patch.city);
                  if (patch.pincode !== undefined) setValue("shippingPincode", patch.pincode);
                }}
              />
            </div>
          </div>
        </Fieldset>

        {/* ----------------------------------------------------------------
            Line Items
        ---------------------------------------------------------------- */}
        <Fieldset label="Line Items">
          {/* Tax Region toggle */}
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Tax Region:</span>
            <Button
              type="button"
              size="sm"
              variant={!isInterState ? "primary" : "outline"}
              onClick={() => setIsInterState(false)}
            >
              Same State (CGST+SGST)
            </Button>
            <Button
              type="button"
              size="sm"
              variant={isInterState ? "primary" : "outline"}
              onClick={() => setIsInterState(true)}
            >
              Inter State (IGST)
            </Button>
          </div>

          {/* Line items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                  <th className="pb-2 pr-2">Product *</th>
                  <th className="pb-2 pr-2 w-24">Qty *</th>
                  <th className="pb-2 pr-2 w-28">Unit</th>
                  <th className="pb-2 pr-2 w-32">Unit Price *</th>
                  <th className="pb-2 pr-2 w-40">Discount</th>
                  <th className="pb-2 pr-2 w-24">GST %</th>
                  <th className="pb-2 pr-2 w-28 text-right">Line Total</th>
                  <th className="pb-2 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fields.map((fieldItem, index) => {
                  const itemValues = watchedLineItems?.[index];
                  const lineCalc = calculateLineItem({
                    quantity: itemValues?.quantity ?? 0,
                    unitPrice: itemValues?.unitPrice ?? 0,
                    discountType: itemValues?.discountType,
                    discountValue: itemValues?.discountValue,
                    gstRate: itemValues?.gstRate,
                    cessRate: itemValues?.cessRate,
                  });

                  return (
                    <tr key={fieldItem.id} className="align-top">
                      {/* Product Name */}
                      <td className="py-2 pr-2">
                        <Controller
                          name={`lineItems.${index}.productId`}
                          control={control}
                          render={({ field: f }) => (
                            <ProductSelect
                              label=""
                              value={f.value ?? null}
                              onChange={(val) => f.onChange(val ?? "")}
                              onProductSelect={(product: ProductSelectOption | null) => {
                                if (product) {
                                  setValue(`lineItems.${index}.productName`, product.name);
                                  if (product.salePrice) setValue(`lineItems.${index}.unitPrice`, product.salePrice);
                                  if (product.hsnCode) setValue(`lineItems.${index}.hsnCode`, product.hsnCode);
                                  if (product.primaryUnit) setValue(`lineItems.${index}.unit`, product.primaryUnit);
                                  if (product.gstRate != null) setValue(`lineItems.${index}.gstRate`, product.gstRate);
                                  if (product.cessRate != null) setValue(`lineItems.${index}.cessRate`, product.cessRate);
                                  if (product.shortDescription) setValue(`lineItems.${index}.description`, product.shortDescription);
                                }
                              }}
                              error={!!errors.lineItems?.[index]?.productName}
                            />
                          )}
                        />
                      </td>

                      {/* Quantity */}
                      <td className="py-2 pr-2">
                        <Controller
                          name={`lineItems.${index}.quantity`}
                          control={control}
                          render={({ field: f }) => (
                            <NumberInput
                              label=""
                              value={f.value}
                              onChange={(v) => f.onChange(v)}
                              min={0.01}
                              step={1}
                              precision={2}
                            />
                          )}
                        />
                      </td>

                      {/* Unit */}
                      <td className="py-2 pr-2">
                        <Controller
                          name={`lineItems.${index}.unit`}
                          control={control}
                          render={({ field: f }) => (
                            <LookupSelect
                              masterCode="UNIT_OF_MEASURE"
                              label=""
                              value={f.value ?? ""}
                              onChange={(v) => f.onChange(String(v ?? ""))}
                            />
                          )}
                        />
                      </td>

                      {/* Unit Price */}
                      <td className="py-2 pr-2">
                        <Controller
                          name={`lineItems.${index}.unitPrice`}
                          control={control}
                          render={({ field: f }) => (
                            <CurrencyInput
                              label=""
                              value={f.value}
                              onChange={(v) => f.onChange(v)}
                              currency="₹"
                            />
                          )}
                        />
                      </td>

                      {/* Discount */}
                      <td className="py-2 pr-2">
                        <div className="flex gap-1">
                          <Controller
                            name={`lineItems.${index}.discountType`}
                            control={control}
                            render={({ field: f }) => (
                              <div className="w-20">
                                <LookupSelect
                                  masterCode="DISCOUNT_TYPE"
                                  label=""
                                  value={f.value ?? ""}
                                  onChange={(v) => f.onChange(String(v ?? ""))}
                                />
                              </div>
                            )}
                          />
                          <Controller
                            name={`lineItems.${index}.discountValue`}
                            control={control}
                            render={({ field: f }) => (
                              <div className="w-20">
                                <NumberInput
                                  label=""
                                  value={f.value ?? null}
                                  onChange={(v) => f.onChange(v)}
                                  min={0}
                                />
                              </div>
                            )}
                          />
                        </div>
                      </td>

                      {/* GST % */}
                      <td className="py-2 pr-2">
                        <Controller
                          name={`lineItems.${index}.gstRate`}
                          control={control}
                          render={({ field: f }) => (
                            <LookupSelect
                              masterCode="GST_RATE"
                              numericValue
                              label=""
                              value={f.value ?? ""}
                              onChange={(v) =>
                                f.onChange(v === "" || v === null ? null : Number(v))
                              }
                            />
                          )}
                        />
                      </td>

                      {/* Line Total */}
                      <td className="py-2 pr-2 text-right font-medium whitespace-nowrap">
                        {fmt(lineCalc.lineTotal)}
                      </td>

                      {/* Remove */}
                      <td className="py-2">
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append(DEFAULT_LINE_ITEM)}
                          >
                            <Icon name="plus" size={14} />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length <= 1}
                          >
                            <Icon name="trash" size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </Fieldset>

        {/* ----------------------------------------------------------------
            Summary
        ---------------------------------------------------------------- */}
        <Fieldset label="Summary">
          <div className="space-y-2">
            {/* Global discount row */}
            <div className="mb-3 flex items-center gap-3">
              <span className="text-sm text-gray-600">Global Discount:</span>
              <div className="w-24">
                <Controller
                  name="discountType"
                  control={control}
                  render={({ field }) => (
                    <LookupSelect
                      masterCode="DISCOUNT_TYPE"
                      label=""
                      value={field.value ?? ""}
                      onChange={(v) => field.onChange(String(v ?? ""))}
                    />
                  )}
                />
              </div>
              <div className="w-28">
                <Controller
                  name="discountValue"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      label=""
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v)}
                      min={0}
                    />
                  )}
                />
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-y-1 text-sm">
              <dt className="text-gray-500">Subtotal</dt>
              <dd className="text-right font-medium">{fmt(summary.subtotal)}</dd>

              <dt className="text-gray-500">Discount</dt>
              <dd className="text-right text-red-500">-{fmt(summary.discountAmount)}</dd>

              <dt className="text-gray-500">Taxable Amount</dt>
              <dd className="text-right font-medium">{fmt(summary.taxableAmount)}</dd>

              {!isInterState ? (
                <>
                  <dt className="text-gray-500">CGST</dt>
                  <dd className="text-right">{fmt(summary.cgstTotal)}</dd>
                  <dt className="text-gray-500">SGST</dt>
                  <dd className="text-right">{fmt(summary.sgstTotal)}</dd>
                </>
              ) : (
                <>
                  <dt className="text-gray-500">IGST</dt>
                  <dd className="text-right">{fmt(summary.igstTotal)}</dd>
                </>
              )}

              {summary.cessTotal > 0 && (
                <>
                  <dt className="text-gray-500">Cess</dt>
                  <dd className="text-right">{fmt(summary.cessTotal)}</dd>
                </>
              )}

              <dt className="text-gray-500">Round Off</dt>
              <dd className="text-right">{fmt(summary.roundOff)}</dd>

              <dt className="border-t border-gray-200 pt-2">
                <Typography variant="heading" level={4}>
                  Total
                </Typography>
              </dt>
              <dd className="border-t border-gray-200 pt-2 text-right">
                <Typography variant="heading" level={4}>
                  {fmt(summary.totalAmount)}
                </Typography>
              </dd>
            </dl>
          </div>
        </Fieldset>

        {/* ----------------------------------------------------------------
            Notes & Terms
        ---------------------------------------------------------------- */}
        {/* ────────────────────────────────────────────────────
            Additional Details — Notes, Terms, Internal Notes buttons
        ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowNotesModal(true)}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Icon name="file-text" size={16} />
            <span className="font-medium">Notes</span>
            {watch("notes") && <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Added</span>}
            {!watch("notes") && <span className="ml-auto text-xs text-gray-400">+ Add</span>}
          </button>

          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Icon name="shield" size={16} />
            <span className="font-medium">Terms & Conditions</span>
            {watch("termsAndConditions") && <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Added</span>}
            {!watch("termsAndConditions") && <span className="ml-2 text-xs text-gray-400">+ Add</span>}
          </button>

          <button
            type="button"
            onClick={() => setShowInternalNotesModal(true)}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Icon name="message-square" size={16} />
            <span className="font-medium">Internal Notes</span>
            {watch("internalNotes") && <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Added</span>}
            {!watch("internalNotes") && <span className="ml-2 text-xs text-gray-400">+ Add</span>}
          </button>
        </div>

        {/* ── Notes Modal ── */}
        <Modal
          open={showNotesModal}
          onClose={() => setShowNotesModal(false)}
          title="Notes"
          size="md"
          footer={
            <div className="flex justify-end">
              <Button type="button" variant="primary" onClick={() => setShowNotesModal(false)}>
                Done
              </Button>
            </div>
          }
        >
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextareaInput
                label="Notes"
                value={field.value ?? ""}
                onChange={field.onChange}
                rows={5}
              />
            )}
          />
        </Modal>

        {/* ── Terms & Conditions Modal ── */}
        <Modal
          open={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          title="Terms & Conditions"
          size="md"
          footer={
            <div className="flex justify-end">
              <Button type="button" variant="primary" onClick={() => setShowTermsModal(false)}>
                Done
              </Button>
            </div>
          }
        >
          <Controller
            name="termsAndConditions"
            control={control}
            render={({ field }) => (
              <TextareaInput
                label="Terms & Conditions"
                value={field.value ?? ""}
                onChange={field.onChange}
                rows={5}
              />
            )}
          />
        </Modal>

        {/* ── Internal Notes Modal ── */}
        <Modal
          open={showInternalNotesModal}
          onClose={() => setShowInternalNotesModal(false)}
          title="Internal Notes"
          size="md"
          footer={
            <div className="flex justify-end">
              <Button type="button" variant="primary" onClick={() => setShowInternalNotesModal(false)}>
                Done
              </Button>
            </div>
          }
        >
          <Controller
            name="internalNotes"
            control={control}
            render={({ field }) => (
              <TextareaInput
                label="Internal Notes"
                value={field.value ?? ""}
                onChange={field.onChange}
                rows={5}
              />
            )}
          />
        </Modal>

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
