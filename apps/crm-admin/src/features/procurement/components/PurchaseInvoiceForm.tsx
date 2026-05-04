"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, NumberInput, CurrencyInput, Fieldset, Typography, Modal } from "@/components/ui";
import { SmartDateInput } from "@/components/common/SmartDateInput";
import { LookupSelect } from "@/components/common/LookupSelect";
import { ProductSelect } from "@/components/common/ProductSelect";
import type { ProductSelectOption } from "@/components/common/ProductSelect";
import { ContactSelect } from "@/components/common/ContactSelect";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { useSidePanelStore } from "@/stores/side-panel.store";
import { calculateLineItem, calculateSummary } from "@/features/quotations/utils/gst";

import { useInvoiceDetail, useCreateInvoice, useUpdateInvoice } from "../hooks/useProcurement";

// ─── Schema ──────────────────────────────────────────────────────────────────

const lineItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, "Product required"),
  quantity: z.number().min(0.01, "Qty required"),
  unit: z.string().optional(),
  unitPrice: z.number().min(0, "Price required"),
  discountType: z.string().optional(),
  discountValue: z.number().nullable().optional(),
  gstRate: z.number().nullable().optional(),
  hsnCode: z.string().optional(),
});

const invoiceSchema = z.object({
  vendorInvoiceNo: z.string().min(1, "Vendor invoice # required"),
  vendorId: z.string().min(1, "Vendor required"),
  poId: z.string().optional(),
  goodsReceiptId: z.string().optional(),
  invoiceDate: z.string().min(1, "Date required"),
  dueDate: z.string().optional(),
  paymentTerms: z.string().optional(),
  internalNotes: z.string().optional(),
  discountType: z.string().optional(),
  discountValue: z.number().nullable().optional(),
  items: z.array(lineItemSchema).min(1, "Add at least one item"),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface PurchaseInvoiceFormProps {
  invoiceId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PurchaseInvoiceForm({ invoiceId, mode = "page", panelId, onSuccess }: PurchaseInvoiceFormProps) {
  const router = useRouter();
  const isEdit = !!invoiceId;
  const isPanel = mode === "panel";
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const [isInterState, setIsInterState] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  const { data: invoiceData, isLoading } = useInvoiceDetail(invoiceId ?? "");
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();

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
      vendorInvoiceNo: "",
      vendorId: "",
      poId: "",
      goodsReceiptId: "",
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: "",
      paymentTerms: "",
      internalNotes: "",
      discountType: "",
      discountValue: null,
      items: [{ productId: "", productName: "", quantity: 1, unit: "PIECE", unitPrice: 0, discountType: "", discountValue: null, gstRate: 18, hsnCode: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (!isEdit || !invoiceData?.data) return;
    const inv = invoiceData.data;
    reset({
      vendorInvoiceNo: inv.vendorInvoiceNo,
      vendorId: inv.vendorId,
      poId: inv.poId ?? "",
      goodsReceiptId: inv.goodsReceiptId ?? "",
      invoiceDate: inv.invoiceDate.slice(0, 10),
      dueDate: inv.dueDate ? inv.dueDate.slice(0, 10) : "",
      paymentTerms: "",
      internalNotes: "",
      discountType: "",
      discountValue: null,
      items: inv.items?.length
        ? inv.items.map((item) => ({
            productId: item.productId ?? "",
            productName: item.productId ?? "",
            quantity: item.quantity,
            unit: item.unitId ?? "PIECE",
            unitPrice: item.unitPrice,
            discountType: "",
            discountValue: item.discount ?? null,
            gstRate: 18,
            hsnCode: item.hsnCode ?? "",
          }))
        : [{ productId: "", productName: "", quantity: 1, unit: "PIECE", unitPrice: 0, discountType: "", discountValue: null, gstRate: 18, hsnCode: "" }],
    });
  }, [isEdit, invoiceData, reset]);

  useEffect(() => {
    if (!panelId) return;
    updatePanelConfig(panelId, {
      footerButtons: [
        { id: "cancel", label: "Cancel", showAs: "text", variant: "secondary", disabled: isSubmitting, onClick: () => {} },
        {
          id: "save",
          label: isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Save Changes" : "Save",
          icon: "check", showAs: "both", variant: "primary", loading: isSubmitting, disabled: isSubmitting,
          onClick: () => {
            const formEl = document.getElementById(`sp-form-purchase-invoice-${invoiceId ?? "new"}`) as HTMLFormElement | null;
            formEl?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, invoiceId, updatePanelConfig]);

  const watchedItems = watch("items") ?? [];
  const watchedDiscountType = watch("discountType");
  const watchedDiscountValue = watch("discountValue");

  const summary = useMemo(
    () => calculateSummary(
      (watchedItems ?? []).map((item) => ({
        quantity: item.quantity ?? 0,
        unitPrice: item.unitPrice ?? 0,
        discountType: item.discountType,
        discountValue: item.discountValue,
        gstRate: item.gstRate,
      })),
      watchedDiscountType, watchedDiscountValue, isInterState,
    ),
    [watchedItems, watchedDiscountType, watchedDiscountValue, isInterState],
  );

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      const payload = {
        vendorInvoiceNo: values.vendorInvoiceNo,
        vendorId: values.vendorId,
        poId: values.poId || undefined,
        goodsReceiptId: values.goodsReceiptId || undefined,
        invoiceDate: values.invoiceDate,
        dueDate: values.dueDate || undefined,
        items: values.items.map((item) => ({
          productId: item.productId || item.productName,
          quantity: item.quantity,
          unitId: item.unit || undefined,
          unitPrice: item.unitPrice,
          discount: item.discountValue ?? undefined,
          hsnCode: item.hsnCode || undefined,
        })),
      };

      if (isEdit && invoiceId) {
        await updateMutation.mutateAsync({ id: invoiceId, data: payload });
        toast.success("Invoice updated");
        if (isPanel && onSuccess) onSuccess();
        else router.push(`/procurement/invoices/${invoiceId}`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Invoice created");
        if (isPanel && onSuccess) onSuccess();
        else router.push("/procurement/invoices");
      }
    } catch {
      toast.error(isEdit ? "Failed to update invoice" : "Failed to create invoice");
    }
  };

  if (isEdit && isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className={isPanel ? "p-4" : "p-6 max-w-5xl mx-auto"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Purchase Invoice" : "New Purchase Invoice"}
          actions={<Button variant="outline" onClick={() => router.back()}><Icon name="arrow-left" size={16} /> Back</Button>}
        />
      )}

      <form
        id={isPanel ? `sp-form-purchase-invoice-${invoiceId ?? "new"}` : undefined}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={`mt-4 space-y-6${isPanel ? "" : " max-w-5xl"}`}
      >
        <FormErrors errors={errors} />

        {/* ── Invoice Information ── */}
        <Fieldset label="Invoice Information">
          <div className="grid grid-cols-3 gap-4">
            <Controller name="vendorInvoiceNo" control={control} render={({ field }) => (
              <Input label="Vendor Invoice # *" leftIcon={<Icon name="file-text" size={16} />}
                value={field.value ?? ""} onChange={field.onChange} error={errors.vendorInvoiceNo?.message} />
            )} />
            <Controller name="vendorId" control={control} render={({ field }) => (
              <ContactSelect label="Vendor *" value={field.value || null} onChange={(val) => field.onChange(String(val ?? ""))}
                error={!!errors.vendorId} errorMessage={errors.vendorId?.message} />
            )} />
            <Controller name="invoiceDate" control={control} render={({ field }) => (
              <SmartDateInput label="Invoice Date" required value={field.value || null} onChange={(v) => field.onChange(v ?? "")} />
            )} />
            <Controller name="dueDate" control={control} render={({ field }) => (
              <SmartDateInput label="Due Date" value={field.value || null} onChange={(v) => field.onChange(v ?? "")} />
            )} />
            <Controller name="poId" control={control} render={({ field }) => (
              <Input label="PO Reference" leftIcon={<Icon name="clipboard-list" size={16} />}
                placeholder="PO ID (optional)" value={field.value ?? ""} onChange={field.onChange} />
            )} />
            <Controller name="goodsReceiptId" control={control} render={({ field }) => (
              <Input label="GRN Reference" leftIcon={<Icon name="package-check" size={16} />}
                placeholder="GRN ID (optional)" value={field.value ?? ""} onChange={field.onChange} />
            )} />
          </div>
        </Fieldset>

        {/* ── Line Items ── */}
        <Fieldset label="Line Items">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Tax Region:</span>
            <Button type="button" size="sm" variant={!isInterState ? "primary" : "outline"} onClick={() => setIsInterState(false)}>
              Same State (CGST+SGST)
            </Button>
            <Button type="button" size="sm" variant={isInterState ? "primary" : "outline"} onClick={() => setIsInterState(true)}>
              Inter State (IGST)
            </Button>
          </div>

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
                  <th className="pb-2 pr-2 w-24">HSN</th>
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
                        <Controller name={`items.${index}.productId`} control={control} render={({ field: f }) => (
                          <ProductSelect label="" value={f.value ?? null} onChange={(val) => f.onChange(val ?? "")}
                            onProductSelect={(product: ProductSelectOption | null) => {
                              if (product) {
                                setValue(`items.${index}.productName`, product.name);
                                if (product.salePrice) setValue(`items.${index}.unitPrice`, product.salePrice);
                                if (product.primaryUnit) setValue(`items.${index}.unit`, product.primaryUnit);
                                if (product.gstRate != null) setValue(`items.${index}.gstRate`, product.gstRate);
                                if (product.hsnCode) setValue(`items.${index}.hsnCode`, product.hsnCode);
                              }
                            }}
                            error={!!errors.items?.[index]?.productName} />
                        )} />
                      </td>
                      <td className="py-2 pr-2">
                        <Controller name={`items.${index}.quantity`} control={control}
                          render={({ field: f }) => <NumberInput label="" value={f.value} onChange={f.onChange} min={0.01} step={1} precision={2} />} />
                      </td>
                      <td className="py-2 pr-2">
                        <Controller name={`items.${index}.unit`} control={control}
                          render={({ field: f }) => <LookupSelect masterCode="UNIT_OF_MEASURE" value={f.value ?? ""} onChange={(v) => f.onChange(String(v ?? ""))} />} />
                      </td>
                      <td className="py-2 pr-2">
                        <Controller name={`items.${index}.unitPrice`} control={control}
                          render={({ field: f }) => <CurrencyInput label="" value={f.value} onChange={f.onChange} currency="₹" decimals={2} />} />
                      </td>
                      <td className="py-2 pr-2">
                        <div className="flex gap-1">
                          <Controller name={`items.${index}.discountType`} control={control}
                            render={({ field: f }) => <div className="w-20"><LookupSelect masterCode="DISCOUNT_TYPE" value={f.value ?? ""} onChange={(v) => f.onChange(String(v ?? ""))} /></div>} />
                          <Controller name={`items.${index}.discountValue`} control={control}
                            render={({ field: f }) => <div className="w-20"><NumberInput label="" value={f.value ?? null} onChange={f.onChange} min={0} precision={2} /></div>} />
                        </div>
                      </td>
                      <td className="py-2 pr-2">
                        <Controller name={`items.${index}.gstRate`} control={control}
                          render={({ field: f }) => <LookupSelect masterCode="GST_RATE" numericValue value={f.value ?? ""}
                            onChange={(v) => f.onChange(v === "" || v === null ? null : Number(v))} />} />
                      </td>
                      <td className="py-2 pr-2">
                        <Controller name={`items.${index}.hsnCode`} control={control}
                          render={({ field: f }) => <Input label="" placeholder="HSN" value={f.value ?? ""} onChange={f.onChange} />} />
                      </td>
                      <td className="py-2 pr-2 text-right font-medium whitespace-nowrap">{fmt(calc.lineTotal)}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <Button type="button" variant="outline" size="sm"
                            onClick={() => append({ productId: "", productName: "", quantity: 1, unit: "PIECE", unitPrice: 0, discountType: "", discountValue: null, gstRate: 18, hsnCode: "" })}>
                            <Icon name="plus" size={14} />
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => remove(index)} disabled={fields.length <= 1}>
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

        {/* ── Summary ── */}
        <Fieldset label="Summary">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm text-gray-600">Global Discount:</span>
              <div className="w-24">
                <Controller name="discountType" control={control}
                  render={({ field }) => <LookupSelect masterCode="DISCOUNT_TYPE" value={field.value ?? ""} onChange={(v) => field.onChange(String(v ?? ""))} />} />
              </div>
              <div className="w-28">
                <Controller name="discountValue" control={control}
                  render={({ field }) => <NumberInput label="" value={field.value ?? null} onChange={field.onChange} min={0} precision={2} />} />
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-y-1 text-sm">
              <dt className="text-gray-500">Subtotal</dt><dd className="text-right font-medium">{fmt(summary.subtotal)}</dd>
              <dt className="text-gray-500">Discount</dt><dd className="text-right text-red-500">-{fmt(summary.discountAmount)}</dd>
              <dt className="text-gray-500">Taxable Amount</dt><dd className="text-right font-medium">{fmt(summary.taxableAmount)}</dd>
              {!isInterState ? (
                <><dt className="text-gray-500">CGST</dt><dd className="text-right">{fmt(summary.cgstTotal)}</dd>
                  <dt className="text-gray-500">SGST</dt><dd className="text-right">{fmt(summary.sgstTotal)}</dd></>
              ) : (
                <><dt className="text-gray-500">IGST</dt><dd className="text-right">{fmt(summary.igstTotal)}</dd></>
              )}
              <dt className="text-gray-500">Round Off</dt><dd className="text-right">{fmt(summary.roundOff)}</dd>
              <dt className="border-t border-gray-200 pt-2"><Typography variant="heading" level={4}>Total</Typography></dt>
              <dd className="border-t border-gray-200 pt-2 text-right"><Typography variant="heading" level={4}>{fmt(summary.totalAmount)}</Typography></dd>
            </dl>
          </div>
        </Fieldset>

        {/* ── Additional Sections ── */}
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setShowTermsModal(true)}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
            <Icon name="shield" size={16} />
            <span className="font-medium">Payment Terms</span>
            {watch("paymentTerms") ? <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Added</span> : <span className="ml-2 text-xs text-gray-400">+ Add</span>}
          </button>
          <button type="button" onClick={() => setShowNotesModal(true)}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
            <Icon name="message-square" size={16} />
            <span className="font-medium">Internal Notes</span>
            {watch("internalNotes") ? <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Added</span> : <span className="ml-2 text-xs text-gray-400">+ Add</span>}
          </button>
        </div>

        <Modal open={showTermsModal} onClose={() => setShowTermsModal(false)} title="Payment Terms" size="md"
          footer={<div className="flex justify-end"><Button type="button" variant="primary" onClick={() => setShowTermsModal(false)}>Done</Button></div>}>
          <Controller name="paymentTerms" control={control} render={({ field }) => (
            <textarea className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
              value={field.value ?? ""} onChange={field.onChange} rows={4} placeholder="Payment terms..." />
          )} />
        </Modal>

        <Modal open={showNotesModal} onClose={() => setShowNotesModal(false)} title="Internal Notes" size="md"
          footer={<div className="flex justify-end"><Button type="button" variant="primary" onClick={() => setShowNotesModal(false)}>Done</Button></div>}>
          <Controller name="internalNotes" control={control} render={({ field }) => (
            <textarea className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
              value={field.value ?? ""} onChange={field.onChange} rows={5} placeholder="Internal notes..." />
          )} />
        </Modal>

        {!isPanel && (
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Update" : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        )}
      </form>
    </div>
  );
}
