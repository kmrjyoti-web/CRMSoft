"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, NumberInput, CurrencyInput, Fieldset, Typography, Modal, SelectInput, TextareaInput } from "@/components/ui";
import { SmartDateInput } from "@/components/common/SmartDateInput";
import { LookupSelect } from "@/components/common/LookupSelect";
import { ProductSelect } from "@/components/common/ProductSelect";
import type { ProductSelectOption } from "@/components/common/ProductSelect";
import { ContactSelect } from "@/components/common/ContactSelect";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { QuantityInput } from "@/components/common/QuantityInput";
import { DiscountInput } from "@/components/common/DiscountInput";
import { useSidePanelStore } from "@/stores/side-panel.store";
import { calculateLineItem, calculateSummary } from "@/features/quotations/utils/gst";
import { useContactsList } from "@/features/contacts/hooks/useContacts";
import { useOrganizationDetail } from "@/features/organizations/hooks/useOrganizations";
import { useCompanyProfile } from "@/features/company-profile/hooks/useCompanyProfile";

import { useSaleOrderDetail, useCreateSaleOrder, useUpdateSaleOrder } from "../hooks/useSales";

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

const soSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  customerType: z.string().min(1, "Customer type is required"),
  quotationId: z.string().optional(),
  orderDate: z.string().min(1, "Order date required"),
  expectedDeliveryDate: z.string().optional(),
  creditDays: z.number().nullable().optional(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  internalNotes: z.string().optional(),
  discountType: z.string().optional(),
  discountValue: z.number().nullable().optional(),
  items: z.array(lineItemSchema).min(1, "Add at least one item"),
});

type SOFormValues = z.infer<typeof soSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface SaleOrderFormProps {
  soId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CUSTOMER_TYPE_OPTIONS = [
  { label: "Organization", value: "ORGANIZATION" },
  { label: "Contact", value: "CONTACT" },
  { label: "B2C", value: "B2C" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function SaleOrderForm({ soId, mode = "page", panelId, onSuccess }: SaleOrderFormProps) {
  const router = useRouter();
  const isEdit = !!soId;
  const isPanel = mode === "panel";
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  const { data: soData, isLoading: isLoadingSO } = useSaleOrderDetail(soId);
  const createMutation = useCreateSaleOrder();
  const updateMutation = useUpdateSaleOrder();

  // Auto-detect inter-state from customer org state vs company state
  const { data: contactsData } = useContactsList();
  const { data: companyProfile } = useCompanyProfile();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SOFormValues>({
    resolver: zodResolver(soSchema) as any,
    defaultValues: {
      customerId: "",
      customerType: "",
      quotationId: "",
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: "",
      creditDays: null,
      paymentTerms: "",
      deliveryTerms: "",
      internalNotes: "",
      discountType: "",
      discountValue: null,
      items: [{ productId: "", productName: "", quantity: 1, unit: "PIECE", unitPrice: 0, discountType: "", discountValue: null, gstRate: 18, hsnCode: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // Derive customer org ID from selected customer
  const watchedCustomerId = watch("customerId");
  const customerOrgId = useMemo(() => {
    if (!watchedCustomerId || !contactsData) return "";
    const raw = contactsData?.data;
    const list = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
    const customer = list.find((c: any) => c.id === watchedCustomerId);
    return customer?.organizationId ?? "";
  }, [watchedCustomerId, contactsData]);

  const { data: customerOrgData } = useOrganizationDetail(customerOrgId);
  const customerState = (customerOrgData?.data as any)?.state ?? "";
  const companyState = (companyProfile as any)?.data?.state ?? (companyProfile as any)?.state ?? "";
  const isInterState = !!(customerState && companyState && customerState.toLowerCase() !== companyState.toLowerCase());

  useEffect(() => {
    if (!isEdit || !soData?.data) return;
    const s = soData.data;
    reset({
      customerId: s.customerId,
      customerType: s.customerType,
      quotationId: s.quotationId ?? "",
      orderDate: s.orderDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: s.expectedDeliveryDate ? s.expectedDeliveryDate.slice(0, 10) : "",
      creditDays: s.creditDays ?? null,
      paymentTerms: s.paymentTerms ?? "",
      deliveryTerms: "",
      internalNotes: s.remarks ?? "",
      discountType: "",
      discountValue: null,
      items: s.items?.length
        ? s.items.map((item: any) => ({
            productId: item.productId ?? "",
            productName: item.productId ?? "",
            quantity: item.orderedQty,
            unit: item.unitId ?? "PIECE",
            unitPrice: item.unitPrice,
            discountType: "",
            discountValue: item.discount ?? null,
            gstRate: item.taxRate ?? 18,
            hsnCode: item.hsnCode ?? "",
          }))
        : [{ productId: "", productName: "", quantity: 1, unit: "PIECE", unitPrice: 0, discountType: "", discountValue: null, gstRate: 18, hsnCode: "" }],
    });
  }, [isEdit, soData, reset]);

  useEffect(() => {
    if (!panelId) return;
    updatePanelConfig(panelId, {
      footerButtons: [
        {
          id: "cancel", label: "Cancel", showAs: "text", variant: "secondary", disabled: isSubmitting, onClick: () => {},
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
            const formEl = document.getElementById(`sp-form-so-${soId ?? "new"}`) as HTMLFormElement | null;
            formEl?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, soId, updatePanelConfig]);

  // Live summary
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
      watchedDiscountType,
      watchedDiscountValue,
      isInterState,
    ),
    [watchedItems, watchedDiscountType, watchedDiscountValue, isInterState],
  );

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const onSubmit = async (values: SOFormValues) => {
    try {
      const payload = {
        customerId: values.customerId,
        customerType: values.customerType,
        quotationId: values.quotationId || undefined,
        expectedDeliveryDate: values.expectedDeliveryDate || undefined,
        creditDays: values.creditDays ?? undefined,
        paymentTerms: values.paymentTerms || undefined,
        remarks: values.internalNotes || undefined,
        items: values.items.map((item) => ({
          productId: item.productId || item.productName,
          orderedQty: item.quantity,
          unitId: item.unit || undefined,
          unitPrice: item.unitPrice,
          discount: item.discountValue ?? undefined,
          taxRate: item.gstRate ?? undefined,
          hsnCode: item.hsnCode || undefined,
        })),
      };

      if (isEdit && soId) {
        await updateMutation.mutateAsync({ id: soId, data: payload });
        toast.success("Sale order updated");
        if (isPanel && onSuccess) onSuccess();
        else router.push(`/sales/orders/${soId}`);
      } else {
        await createMutation.mutateAsync(payload as any);
        toast.success("Sale order created");
        if (isPanel && onSuccess) onSuccess();
        else router.push("/sales/orders");
      }
    } catch {
      toast.error(isEdit ? "Failed to update sale order" : "Failed to create sale order");
    }
  };

  if (isEdit && isLoadingSO) return <LoadingSpinner fullPage />;

  return (
    <div className={isPanel ? "p-4" : "p-6 max-w-5xl mx-auto"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Sale Order" : "New Sale Order"}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
          }
        />
      )}

      <form
        id={isPanel ? `sp-form-so-${soId ?? "new"}` : undefined}
        onSubmit={handleSubmit(onSubmit as any)}
        noValidate
        className={`mt-4 space-y-6${isPanel ? "" : " max-w-5xl"}`}
      >
        <FormErrors errors={errors} />

        {/* ── Order Information ── */}
        <Fieldset label="Order Information">
          <div className="grid grid-cols-3 gap-4">
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <ContactSelect
                  label="Customer *"
                  value={field.value || null}
                  onChange={(val) => field.onChange(String(val ?? ""))}
                  error={!!errors.customerId}
                  errorMessage={errors.customerId?.message}
                />
              )}
            />
            <Controller
              name="customerType"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Customer Type *"
                  leftIcon={<Icon name="users" size={16} />}
                  options={CUSTOMER_TYPE_OPTIONS}
                  value={field.value}
                  onChange={(v) => field.onChange(String(v ?? ""))}
                />
              )}
            />
            <Controller
              name="orderDate"
              control={control}
              render={({ field }) => (
                <SmartDateInput label="Order Date" required value={field.value || null} onChange={(v) => field.onChange(v ?? "")} />
              )}
            />
            <Controller
              name="expectedDeliveryDate"
              control={control}
              render={({ field }) => (
                <SmartDateInput label="Expected Delivery" value={field.value || null} onChange={(v) => field.onChange(v ?? "")} />
              )}
            />
            <Controller
              name="creditDays"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Credit Days"
                  value={field.value ?? null}
                  onChange={field.onChange}
                  min={0}
                  precision={0}
                />
              )}
            />
            <Controller
              name="quotationId"
              control={control}
              render={({ field }) => (
                <Input
                  label="Quotation ID (optional)"
                  leftIcon={<Icon name="file-text" size={16} />}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* ── Line Items ── */}
        <Fieldset label="Line Items">
          {/* Auto-detected: IGST if customer state ≠ company state */}
          {customerState && (
            <div className="mb-3 text-xs text-gray-500">
              Tax: {isInterState ? "Inter State (IGST)" : "Same State (CGST+SGST)"}
            </div>
          )}

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
                                  if (product.primaryUnit) setValue(`items.${index}.unit`, product.primaryUnit);
                                  if (product.gstRate != null) setValue(`items.${index}.gstRate`, product.gstRate);
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
                            <QuantityInput value={f.value} onChange={(v) => f.onChange(v ?? 0)} min={0.01} />
                          )}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Controller
                          name={`items.${index}.unit`}
                          control={control}
                          render={({ field: f }) => (
                            <LookupSelect masterCode="UNIT_OF_MEASURE" value={f.value ?? ""} onChange={(v) => f.onChange(String(v ?? ""))} />
                          )}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Controller
                          name={`items.${index}.unitPrice`}
                          control={control}
                          render={({ field: f }) => (
                            <CurrencyInput label="" value={f.value} onChange={f.onChange} currency="₹" decimals={2} />
                          )}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Controller
                          name={`items.${index}.discountValue`}
                          control={control}
                          render={({ field: f }) => (
                            <DiscountInput
                              value={f.value ?? null}
                              discountType={watchedItems?.[index]?.discountType || "PERCENT"}
                              onChange={f.onChange}
                              onTypeChange={(type) => setValue(`items.${index}.discountType`, type)}
                            />
                          )}
                        />
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
                              onChange={(v) => f.onChange(v === "" || v === null ? null : Number(v))}
                            />
                          )}
                        />
                      </td>
                      <td className="py-2 pr-2 text-right font-medium whitespace-nowrap">{fmt(calc.lineTotal)}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <Button
                            type="button" variant="outline" size="sm"
                            onClick={() => append({ productId: "", productName: "", quantity: 1, unit: "PIECE", unitPrice: 0, discountType: "", discountValue: null, gstRate: 18, hsnCode: "" })}
                          >
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
              <div className="w-48">
                <Controller
                  name="discountValue"
                  control={control}
                  render={({ field }) => (
                    <DiscountInput
                      value={field.value ?? null}
                      discountType={watchedDiscountType || "PERCENT"}
                      onChange={field.onChange}
                      onTypeChange={(type) => setValue("discountType", type)}
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

        {/* ── Additional Sections ── */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Icon name="shield" size={16} />
            <span className="font-medium">Payment & Delivery Terms</span>
            {(watch("paymentTerms") || watch("deliveryTerms")) ? (
              <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Added</span>
            ) : (
              <span className="ml-2 text-xs text-gray-400">+ Add</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowNotesModal(true)}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Icon name="message-square" size={16} />
            <span className="font-medium">Internal Notes</span>
            {watch("internalNotes") ? (
              <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Added</span>
            ) : (
              <span className="ml-2 text-xs text-gray-400">+ Add</span>
            )}
          </button>
        </div>

        <Modal open={showTermsModal} onClose={() => setShowTermsModal(false)} title="Payment & Delivery Terms" size="md"
          footer={<div className="flex justify-end"><Button type="button" variant="primary" onClick={() => setShowTermsModal(false)}>Done</Button></div>}
        >
          <div className="space-y-4">
            <Controller name="paymentTerms" control={control} render={({ field }) => (
              <TextareaInput label="Payment Terms" value={field.value ?? ""} onChange={field.onChange} rows={3} />
            )} />
            <Controller name="deliveryTerms" control={control} render={({ field }) => (
              <TextareaInput label="Delivery Terms" value={field.value ?? ""} onChange={field.onChange} rows={3} />
            )} />
          </div>
        </Modal>

        <Modal open={showNotesModal} onClose={() => setShowNotesModal(false)} title="Internal Notes" size="md"
          footer={<div className="flex justify-end"><Button type="button" variant="primary" onClick={() => setShowNotesModal(false)}>Done</Button></div>}
        >
          <Controller name="internalNotes" control={control} render={({ field }) => (
            <TextareaInput label="Internal Notes" value={field.value ?? ""} onChange={field.onChange} rows={5} />
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
