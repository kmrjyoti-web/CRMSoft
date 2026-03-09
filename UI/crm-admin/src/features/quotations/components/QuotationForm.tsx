'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, DatePicker, NumberInput, CurrencyInput, Fieldset, Typography, Modal } from "@/components/ui";
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
import { useSidePanelStore } from "@/stores/side-panel.store";

import { useQuotationDetail, useCreateQuotation, useUpdateQuotation } from "../hooks/useQuotations";
import { calculateLineItem, calculateSummary } from "../utils/gst";
import type { LineItem } from "../types/quotations.types";

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
// Props
// ---------------------------------------------------------------------------

interface QuotationFormProps {
  quotationId?: string;
  leadId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuotationForm({ quotationId, leadId: defaultLeadId, mode = "page", panelId, onSuccess, onCancel }: QuotationFormProps) {
  const router = useRouter();
  const isEdit = !!quotationId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const [isInterState, setIsInterState] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

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
    setValue,
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
      items: [{
        productId: "",
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
      }],
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
        isOptional: li.isOptional ?? false,
        notes: li.notes ?? "",
      })),
    });
  }, [isEdit, quotationData, reset]);

  // ── Pre-fill leadId when opened from Lead Dashboard ──────
  useEffect(() => {
    if (isEdit || !defaultLeadId) return;
    setValue("leadId", defaultLeadId);
  }, [isEdit, defaultLeadId, setValue]);

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
            const formId = `sp-form-quotation-${quotationId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, quotationId, updatePanelConfig]);

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
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push(`/quotations/${quotationId}`);
        }
      } else {
        await createMutation.mutateAsync(values as any);
        toast.success("Quotation created");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push("/quotations");
        }
      }
    } catch {
      toast.error(isEdit ? "Failed to update quotation" : "Failed to create quotation");
    }
  };

  // ── Loading state ─────────────────────────────────────────
  if (isEdit && isLoadingQuotation) return <LoadingSpinner fullPage />;

  const isPanel = mode === "panel";

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={isPanel ? "p-4" : "p-6 max-w-5xl mx-auto"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Quotation" : "New Quotation"}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
          }
        />
      )}

      <form id={isPanel ? `sp-form-quotation-${quotationId ?? "new"}` : undefined} onSubmit={handleSubmit(onSubmit)} noValidate className={`mt-4 space-y-6${isPanel ? "" : " max-w-5xl"}`}>
        <FormErrors errors={errors} />

        {/* ────────────────────────────────────────────────────
            Quotation Information
        ──────────────────────────────────────────────────── */}
        <Fieldset label="Quotation Information">
          <div className="grid grid-cols-3 gap-4">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  label="Title"
                  placeholder="Quotation title"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="priceType"
              control={control}
              render={({ field }) => (
                <LookupSelect
                  masterCode="QUOTATION_PRICE_TYPE"
                  label="Price Type"
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(String(v ?? ""))}
                />
              )}
            />

            <Controller
              name="leadId"
              control={control}
              render={({ field }) => (
                <LeadSelect
                  label="Lead"
                  required
                  value={field.value || null}
                  onChange={(val) => field.onChange(String(val ?? ""))}
                  onLeadSelect={(lead: LeadSelectOption | null) => {
                    if (lead) {
                      setValue("contactPersonId", lead.contactId);
                      setValue("organizationId", lead.organizationId ?? "");
                    }
                  }}
                  error={!!errors.leadId}
                  errorMessage={errors.leadId?.message}
                />
              )}
            />

            <Controller
              name="contactPersonId"
              control={control}
              render={({ field }) => (
                <ContactSelect
                  label="Contact Person"
                  value={field.value || null}
                  onChange={(val) => field.onChange(String(val ?? ""))}
                />
              )}
            />

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
          <div className="overflow-visible">
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
                          name={`items.${index}.productId`}
                          control={control}
                          render={({ field: f }) => (
                            <ProductSelect
                              label=""
                              value={f.value ?? null}
                              onChange={(val) => f.onChange(val ?? "")}
                              onProductSelect={(product: ProductSelectOption | null) => {
                                if (product) {
                                  setValue(`items.${index}.productName`, product.name);
                                  if (product.salePrice) setValue(`items.${index}.unitPrice`, product.salePrice);
                                  if (product.hsnCode) setValue(`items.${index}.hsnCode`, product.hsnCode);
                                  if (product.primaryUnit) setValue(`items.${index}.unit`, product.primaryUnit);
                                  if (product.gstRate != null) setValue(`items.${index}.gstRate`, product.gstRate);
                                  if (product.cessRate != null) setValue(`items.${index}.cessRate`, product.cessRate);
                                  if (product.shortDescription) setValue(`items.${index}.description`, product.shortDescription);
                                }
                              }}
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
                              label=""
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
                            <LookupSelect
                              masterCode="UNIT_OF_MEASURE"
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
                              label=""
                              value={f.value}
                              onChange={f.onChange}
                              currency="₹"
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
                                <LookupSelect
                                  masterCode="DISCOUNT_TYPE"
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
                                  label=""
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
                            <LookupSelect
                              masterCode="GST_RATE"
                              numericValue
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
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              append({
                                productId: "",
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
                            <Icon name="plus" size={14} />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length <= 1}
                          >
                            <Icon name="trash-2" size={14} />
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
                    <LookupSelect
                      masterCode="DISCOUNT_TYPE"
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
            Additional Details — Summary, Terms, Notes buttons
        ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          <div className="w-1/2 min-w-[280px]">
            <button
              type="button"
              onClick={() => setShowSummaryModal(true)}
              className="flex items-center gap-2 w-full rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <Icon name="file-text" size={16} />
              <span className="font-medium">Summary</span>
              {watch("summary") && <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Added</span>}
              {!watch("summary") && <span className="ml-auto text-xs text-gray-400">+ Add</span>}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Icon name="shield" size={16} />
            <span className="font-medium">Validity & Terms</span>
            {(watch("validFrom") || watch("paymentTerms") || watch("termsConditions")) && <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Added</span>}
            {!(watch("validFrom") || watch("paymentTerms") || watch("termsConditions")) && <span className="ml-2 text-xs text-gray-400">+ Add</span>}
          </button>

          <button
            type="button"
            onClick={() => setShowNotesModal(true)}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Icon name="message-square" size={16} />
            <span className="font-medium">Internal Notes</span>
            {watch("internalNotes") && <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Added</span>}
            {!watch("internalNotes") && <span className="ml-2 text-xs text-gray-400">+ Add</span>}
          </button>
        </div>

        {/* ── Summary Modal ── */}
        <Modal
          open={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          title="Summary"
          size="md"
          footer={
            <div className="flex justify-end">
              <Button type="button" variant="primary" onClick={() => setShowSummaryModal(false)}>
                Done
              </Button>
            </div>
          }
        >
          <Controller
            name="summary"
            control={control}
            render={({ field }) => (
              <textarea
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                value={field.value ?? ""}
                onChange={field.onChange}
                rows={5}
                placeholder="Brief summary of the quotation..."
              />
            )}
          />
        </Modal>

        {/* ── Validity & Terms Modal ── */}
        <Modal
          open={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          title="Validity & Terms"
          size="lg"
          footer={
            <div className="flex justify-end">
              <Button type="button" variant="primary" onClick={() => setShowTermsModal(false)}>
                Done
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

            <Controller
              name="paymentTerms"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Payment Terms</label>
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">Delivery Terms</label>
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">Warranty Terms</label>
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">Terms & Conditions</label>
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
        </Modal>

        {/* ── Internal Notes Modal ── */}
        <Modal
          open={showNotesModal}
          onClose={() => setShowNotesModal(false)}
          title="Internal Notes"
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
            name="internalNotes"
            control={control}
            render={({ field }) => (
              <textarea
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                value={field.value ?? ""}
                onChange={field.onChange}
                rows={5}
                placeholder="Internal notes (not visible to customer)..."
              />
            )}
          />
        </Modal>

        {/* ────────────────────────────────────────────────────
            Actions — hidden in panel mode (footer handles it)
        ──────────────────────────────────────────────────── */}
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
