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
  SelectInput,
  DatePicker,
  NumberInput,
  CurrencyInput,
  Fieldset,
  Typography,
} from "@/components/ui";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

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

const UNIT_OPTIONS = [
  { label: "Piece", value: "PIECE" },
  { label: "Box", value: "BOX" },
  { label: "Kg", value: "KG" },
  { label: "Metre", value: "METRE" },
  { label: "Litre", value: "LITRE" },
  { label: "Set", value: "SET" },
  { label: "Pair", value: "PAIR" },
  { label: "Other", value: "OTHER" },
];

const GST_RATE_OPTIONS = [
  { label: "0%", value: 0 },
  { label: "5%", value: 5 },
  { label: "12%", value: 12 },
  { label: "18%", value: 18 },
  { label: "28%", value: 28 },
];

const DISCOUNT_TYPE_OPTIONS = [
  { label: "%", value: "PERCENTAGE" },
  { label: "Flat", value: "FLAT" },
];

const DEFAULT_LINE_ITEM = {
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
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InvoiceForm({ invoiceId }: InvoiceFormProps) {
  const router = useRouter();
  const isEdit = !!invoiceId;

  const [isInterState, setIsInterState] = useState(false);

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
      lineItems: [],
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
        router.push(`/invoices/${invoiceId}`);
      } else {
        await createInvoice.mutateAsync(payload as any);
        toast.success("Invoice created");
        router.push("/invoices");
      }
    } catch {
      toast.error(isEdit ? "Failed to update invoice" : "Failed to create invoice");
    }
  };

  // -- Loading state --------------------------------------------------------
  if (isEdit && isLoadingInvoice) return <LoadingSpinner fullPage />;

  // -- Render ---------------------------------------------------------------
  return (
    <div className="p-6" style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      <PageHeader
        title={isEdit ? "Edit Invoice" : "New Invoice"}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <Icon name="arrow-left" size={16} /> Back
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-4 max-w-5xl space-y-6"
      >
        <FormErrors errors={errors} />

        {/* ----------------------------------------------------------------
            Invoice Information
        ---------------------------------------------------------------- */}
        <Fieldset label="Invoice Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Billing Name */}
            <Controller
              name="billingName"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Billing Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Billing name"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    error={!!errors.billingName}
                    errorMessage={errors.billingName?.message}
                  />
                </div>
              )}
            />

            {/* Due Date */}
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Due Date *"
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />

            {/* Invoice Date */}
            <Controller
              name="invoiceDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Invoice Date"
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />

            {/* Supply Date */}
            <Controller
              name="supplyDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Supply Date"
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />

            {/* Quotation ID */}
            <Controller
              name="quotationId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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

            {/* Lead ID */}
            <Controller
              name="leadId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
          </div>
        </Fieldset>

        {/* ----------------------------------------------------------------
            Billing Address
        ---------------------------------------------------------------- */}
        <Fieldset label="Billing Address">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="billingAddress"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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

            <Controller
              name="billingCity"
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
              name="billingState"
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
              name="billingPincode"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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

            <Controller
              name="billingGstNumber"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    GST Number
                  </label>
                  <Input
                    placeholder="GST number"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>
        </Fieldset>

        {/* ----------------------------------------------------------------
            Shipping Address
        ---------------------------------------------------------------- */}
        <Fieldset label="Shipping Address" toggleable defaultCollapsed>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="shippingName"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Shipping Name
                  </label>
                  <Input
                    placeholder="Shipping name"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              name="shippingAddress"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <Input
                    placeholder="Shipping address"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              name="shippingCity"
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
              name="shippingState"
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
              name="shippingPincode"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
                  <th className="pb-2 w-10"></th>
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
                          name={`lineItems.${index}.productName`}
                          control={control}
                          render={({ field: f }) => (
                            <Input
                              placeholder="Product name"
                              value={f.value}
                              onChange={f.onChange}
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
                            <SelectInput
                              label=""
                              options={UNIT_OPTIONS}
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
                              currency={"\u20B9"}
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
                                <SelectInput
                                  label=""
                                  options={DISCOUNT_TYPE_OPTIONS}
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
                            <SelectInput
                              label=""
                              options={GST_RATE_OPTIONS}
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {fields.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-400">
              No line items yet. Add one below.
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => append(DEFAULT_LINE_ITEM)}
          >
            + Add Item
          </Button>
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
                    <SelectInput
                      label=""
                      options={DISCOUNT_TYPE_OPTIONS}
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
        <Fieldset label="Notes & Terms" toggleable defaultCollapsed>
          <div className="space-y-4">
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
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    rows={3}
                    placeholder="Notes visible on invoice..."
                  />
                </div>
              )}
            />

            <Controller
              name="termsAndConditions"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Terms & Conditions
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    rows={3}
                    placeholder="Payment terms, late fees, etc..."
                  />
                </div>
              )}
            />

            <Controller
              name="internalNotes"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Internal Notes
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    rows={3}
                    placeholder="Internal notes (not visible to customer)..."
                  />
                </div>
              )}
            />
          </div>
        </Fieldset>

        {/* ----------------------------------------------------------------
            Actions
        ---------------------------------------------------------------- */}
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
      </form>
    </div>
  );
}
