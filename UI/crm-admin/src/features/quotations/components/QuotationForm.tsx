'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, SelectInput, DatePicker, NumberInput, CurrencyInput, Fieldset, Typography } from "@/components/ui";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import { useQuotationDetail, useCreateQuotation, useUpdateQuotation } from "../hooks/useQuotations";
import { calculateLineItem, calculateSummary } from "../utils/gst";
import type { LineItem } from "../types/quotations.types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const lineItemSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  hsnCode: z.string().optional(),
  quantity: z.number().min(0.01, "Quantity required"),
  unit: z.string().optional(),
  unitPrice: z.number().min(0, "Price required"),
  discountType: z.string().optional(),
  discountValue: z.number().nullable().optional(),
  gstRate: z.number().nullable().optional(),
  cessRate: z.number().nullable().optional(),
  isOptional: z.boolean().optional(),
  notes: z.string().optional(),
});

const quotationSchema = z.object({
  title: z.string().optional(),
  summary: z.string().optional(),
  leadId: z.string().min(1, "Lead is required"),
  contactPersonId: z.string().optional(),
  organizationId: z.string().optional(),
  priceType: z.string().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  warrantyTerms: z.string().optional(),
  termsConditions: z.string().optional(),
  discountType: z.string().optional(),
  discountValue: z.number().nullable().optional(),
  internalNotes: z.string().optional(),
  items: z.array(lineItemSchema).optional(),
});

type QuotationFormValues = z.infer<typeof quotationSchema>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRICE_TYPE_OPTIONS = [
  { label: "Fixed", value: "FIXED" },
  { label: "Range", value: "RANGE" },
  { label: "Negotiable", value: "NEGOTIABLE" },
];

const UNIT_OPTIONS = [
  { label: "Piece", value: "PIECE" },
  { label: "Box", value: "BOX" },
  { label: "Pack", value: "PACK" },
  { label: "Kg", value: "KG" },
  { label: "Gram", value: "GRAM" },
  { label: "Litre", value: "LITRE" },
  { label: "Meter", value: "METER" },
  { label: "Set", value: "SET" },
  { label: "Dozen", value: "DOZEN" },
  { label: "Roll", value: "ROLL" },
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

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface QuotationFormProps {
  quotationId?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuotationForm({ quotationId }: QuotationFormProps) {
  const router = useRouter();
  const isEdit = !!quotationId;

  const [isInterState, setIsInterState] = useState(false);

  // ── Queries & Mutations ───────────────────────────────────
  const { data: quotationData, isLoading: isLoadingQuotation } =
    useQuotationDetail(quotationId ?? "");
  const createMutation = useCreateQuotation();
  const updateMutation = useUpdateQuotation();

  // ── Form Setup ────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      title: "",
      summary: "",
      leadId: "",
      contactPersonId: "",
      organizationId: "",
      priceType: "",
      validFrom: "",
      validUntil: "",
      paymentTerms: "",
      deliveryTerms: "",
      warrantyTerms: "",
      termsConditions: "",
      discountType: "",
      discountValue: null,
      internalNotes: "",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // ── Pre-populate in edit mode ─────────────────────────────
  useEffect(() => {
    if (!isEdit || !quotationData?.data) return;
    const q = quotationData.data;
    reset({
      title: q.title ?? "",
      summary: q.summary ?? "",
      leadId: q.leadId,
      contactPersonId: q.contactPersonId ?? "",
      organizationId: q.organizationId ?? "",
      priceType: q.priceType ?? "",
      validFrom: q.validFrom ?? "",
      validUntil: q.validUntil ?? "",
      paymentTerms: q.paymentTerms ?? "",
      deliveryTerms: q.deliveryTerms ?? "",
      warrantyTerms: q.warrantyTerms ?? "",
      termsConditions: q.termsConditions ?? "",
      discountType: q.discountType ?? "",
      discountValue: q.discountValue ?? null,
      internalNotes: q.internalNotes ?? "",
      items: (q.lineItems ?? []).map((li: LineItem) => ({
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
        isOptional: li.isOptional ?? false,
        notes: li.notes ?? "",
      })),
    });
  }, [isEdit, quotationData, reset]);

  // ── Live summary calculation ──────────────────────────────
  const watchedItems = watch("items") ?? [];
  const watchedDiscountType = watch("discountType");
  const watchedDiscountValue = watch("discountValue");

  const summary = useMemo(() => {
    const items = (watchedItems ?? []).map((item) => ({
      quantity: item.quantity ?? 0,
      unitPrice: item.unitPrice ?? 0,
      discountType: item.discountType,
      discountValue: item.discountValue,
      gstRate: item.gstRate,
      cessRate: item.cessRate,
      isOptional: item.isOptional,
    }));
    return calculateSummary(items, watchedDiscountType, watchedDiscountValue, isInterState);
  }, [watchedItems, watchedDiscountType, watchedDiscountValue, isInterState]);

  // ── Format currency helper ────────────────────────────────
  const fmt = (n: number) =>
    `\u20B9${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  // ── Submit handler ────────────────────────────────────────
  const onSubmit = async (values: QuotationFormValues) => {
    try {
      if (isEdit && quotationId) {
        const { items, leadId, contactPersonId, organizationId, discountValue, ...rest } = values;
        const updateData = { ...rest, discountValue: discountValue ?? undefined };
        await updateMutation.mutateAsync({ id: quotationId, data: updateData });
        toast.success("Quotation updated");
        router.push(`/quotations/${quotationId}`);
      } else {
        await createMutation.mutateAsync(values as any);
        toast.success("Quotation created");
        router.push("/quotations");
      }
    } catch {
      toast.error(isEdit ? "Failed to update quotation" : "Failed to create quotation");
    }
  };

  // ── Loading state ─────────────────────────────────────────
  if (isEdit && isLoadingQuotation) return <LoadingSpinner fullPage />;

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="p-6" style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      <PageHeader
        title={isEdit ? "Edit Quotation" : "New Quotation"}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <Icon name="arrow-left" size={16} /> Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 max-w-5xl space-y-6">
        <FormErrors errors={errors} />

        {/* ────────────────────────────────────────────────────
            Quotation Information
        ──────────────────────────────────────────────────── */}
        <Fieldset label="Quotation Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <Input
                    placeholder="Quotation title"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              name="priceType"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Price Type"
                  options={PRICE_TYPE_OPTIONS}
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(String(v ?? ""))}
                />
              )}
            />

            <Controller
              name="leadId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Lead ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Lead ID"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.leadId}
                    errorMessage={errors.leadId?.message}
                  />
                </div>
              )}
            />

            <Controller
              name="contactPersonId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Contact Person ID
                  </label>
                  <Input
                    placeholder="Contact person ID"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

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

          <Controller
            name="summary"
            control={control}
            render={({ field }) => (
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Summary
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  rows={3}
                  placeholder="Brief summary..."
                />
              </div>
            )}
          />
        </Fieldset>

        {/* ────────────────────────────────────────────────────
            Line Items
        ──────────────────────────────────────────────────── */}
        <Fieldset label="Line Items">
          {/* GST toggle */}
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
                  const itemValues = watchedItems?.[index];
                  const calc = calculateLineItem({
                    quantity: itemValues?.quantity ?? 0,
                    unitPrice: itemValues?.unitPrice ?? 0,
                    discountType: itemValues?.discountType,
                    discountValue: itemValues?.discountValue,
                    gstRate: itemValues?.gstRate,
                  });

                  return (
                    <tr key={fieldItem.id} className="align-top">
                      <td className="py-2 pr-2">
                        <Controller
                          name={`items.${index}.productName`}
                          control={control}
                          render={({ field: f }) => (
                            <Input
                              placeholder="Product name"
                              value={f.value}
                              onChange={f.onChange}
                              error={!!errors.items?.[index]?.productName}
                            />
                          )}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Controller
                          name={`items.${index}.quantity`}
                          control={control}
                          render={({ field: f }) => (
                            <NumberInput
                              value={f.value}
                              onChange={f.onChange}
                              min={0.01}
                              step={1}
                              precision={2}
                            />
                          )}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Controller
                          name={`items.${index}.unit`}
                          control={control}
                          render={({ field: f }) => (
                            <SelectInput
                              options={UNIT_OPTIONS}
                              value={f.value ?? ""}
                              onChange={(v) => f.onChange(String(v ?? ""))}
                            />
                          )}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Controller
                          name={`items.${index}.unitPrice`}
                          control={control}
                          render={({ field: f }) => (
                            <CurrencyInput
                              value={f.value}
                              onChange={f.onChange}
                              currency="\u20B9"
                              decimals={2}
                            />
                          )}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <div className="flex gap-1">
                          <Controller
                            name={`items.${index}.discountType`}
                            control={control}
                            render={({ field: f }) => (
                              <div className="w-20">
                                <SelectInput
                                  options={DISCOUNT_TYPE_OPTIONS}
                                  value={f.value ?? ""}
                                  onChange={(v) => f.onChange(String(v ?? ""))}
                                />
                              </div>
                            )}
                          />
                          <Controller
                            name={`items.${index}.discountValue`}
                            control={control}
                            render={({ field: f }) => (
                              <div className="w-20">
                                <NumberInput
                                  value={f.value ?? null}
                                  onChange={f.onChange}
                                  min={0}
                                  precision={2}
                                />
                              </div>
                            )}
                          />
                        </div>
                      </td>
                      <td className="py-2 pr-2">
                        <Controller
                          name={`items.${index}.gstRate`}
                          control={control}
                          render={({ field: f }) => (
                            <SelectInput
                              options={GST_RATE_OPTIONS}
                              value={f.value ?? ""}
                              onChange={(v) =>
                                f.onChange(v === "" || v === null ? null : Number(v))
                              }
                            />
                          )}
                        />
                      </td>
                      <td className="py-2 pr-2 text-right font-medium whitespace-nowrap">
                        {fmt(calc.lineTotal)}
                      </td>
                      <td className="py-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Icon name="trash-2" size={14} />
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
            onClick={() =>
              append({
                productName: "",
                quantity: 1,
                unit: "PIECE",
                unitPrice: 0,
                discountType: "",
                discountValue: null,
                gstRate: 18,
                cessRate: null,
                isOptional: false,
                notes: "",
              })
            }
          >
            <Icon name="plus" size={16} className="mr-1" /> Add Item
          </Button>
        </Fieldset>

        {/* ────────────────────────────────────────────────────
            Summary
        ──────────────────────────────────────────────────── */}
        <Fieldset label="Summary">
          <div className="space-y-2">
            {/* Global discount row */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm text-gray-600">Global Discount:</span>
              <div className="w-24">
                <Controller
                  name="discountType"
                  control={control}
                  render={({ field }) => (
                    <SelectInput
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
                      value={field.value ?? null}
                      onChange={field.onChange}
                      min={0}
                      precision={2}
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
                <Typography variant="heading" level={4}>Total</Typography>
              </dt>
              <dd className="border-t border-gray-200 pt-2 text-right">
                <Typography variant="heading" level={4}>{fmt(summary.totalAmount)}</Typography>
              </dd>
            </dl>
          </div>
        </Fieldset>

        {/* ────────────────────────────────────────────────────
            Validity & Terms
        ──────────────────────────────────────────────────── */}
        <Fieldset label="Validity & Terms" toggleable defaultCollapsed>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="validFrom"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Valid From"
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
            <Controller
              name="validUntil"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Valid Until"
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
          </div>

          <div className="mt-4 space-y-4">
            <Controller
              name="paymentTerms"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Payment Terms
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    rows={2}
                  />
                </div>
              )}
            />

            <Controller
              name="deliveryTerms"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Delivery Terms
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    rows={2}
                  />
                </div>
              )}
            />

            <Controller
              name="warrantyTerms"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Warranty Terms
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    rows={2}
                  />
                </div>
              )}
            />

            <Controller
              name="termsConditions"
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
                  />
                </div>
              )}
            />
          </div>
        </Fieldset>

        {/* ────────────────────────────────────────────────────
            Internal Notes
        ──────────────────────────────────────────────────── */}
        <Fieldset label="Internal Notes" toggleable defaultCollapsed>
          <Controller
            name="internalNotes"
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
                  placeholder="Internal notes (not visible to customer)..."
                />
              </div>
            )}
          />
        </Fieldset>

        {/* ────────────────────────────────────────────────────
            Actions
        ──────────────────────────────────────────────────── */}
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
