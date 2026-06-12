"use client";

import { Controller } from "react-hook-form";
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import type { FieldArrayWithId } from "react-hook-form";

import {
  Button,
  Icon,
  NumberInput,
  CurrencyInput,
} from "@/components/ui";
import { LookupSelect } from "@/components/common/LookupSelect";
import { ProductSelect } from "@/components/common/ProductSelect";
import type { ProductSelectOption } from "@/components/common/ProductSelect";
import { calculateLineItem } from "@/features/quotations/utils/gst";

// ---------------------------------------------------------------------------
// Types — mirrored from InvoiceForm to avoid circular imports
// ---------------------------------------------------------------------------

interface LineItemFormValues {
  productId?: string;
  productName: string;
  description?: string;
  hsnCode?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discountType?: string;
  discountValue?: number | null;
  gstRate?: number | null;
  cessRate?: number | null;
  notes?: string;
}

interface InvoiceFormValues {
  quotationId?: string;
  leadId?: string;
  contactId?: string;
  organizationId?: string;
  billingName: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingPincode?: string;
  billingGstNumber?: string;
  shippingName?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
  dueDate: string;
  invoiceDate?: string;
  supplyDate?: string;
  discountType?: string;
  discountValue?: number | null;
  isInterState?: boolean;
  lineItems: LineItemFormValues[];
  notes?: string;
  termsAndConditions?: string;
  internalNotes?: string;
}

// ---------------------------------------------------------------------------
// Default line item constant (shared with parent via prop)
// ---------------------------------------------------------------------------

const DEFAULT_LINE_ITEM: LineItemFormValues = {
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

export interface InvoiceLineItemsGridProps {
  fields: FieldArrayWithId<InvoiceFormValues, "lineItems", "id">[];
  watchedItems: LineItemFormValues[] | undefined;
  control: Control<InvoiceFormValues>;
  errors: FieldErrors<InvoiceFormValues>;
  setValue: UseFormSetValue<InvoiceFormValues>;
  append: (item: LineItemFormValues) => void;
  remove: (index: number) => void;
  fmt: (n: number) => string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InvoiceLineItemsGrid({
  fields,
  watchedItems,
  control,
  errors,
  setValue,
  append,
  remove,
  fmt,
}: InvoiceLineItemsGridProps) {
  return (
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
            const itemValues = watchedItems?.[index];
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

                {/* Add / Remove */}
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
  );
}
