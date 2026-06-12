"use client";

import { Control, Controller, FieldErrors, UseFieldArrayReturn } from "react-hook-form";

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
// Types (mirrored from ProformaForm to avoid circular deps)
// ---------------------------------------------------------------------------

interface LineItemValues {
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

interface ProformaFormValues {
  lineItems: LineItemValues[];
  [key: string]: unknown;
}

interface DefaultLineItem {
  productId: string;
  productName: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountType: string;
  discountValue: null;
  gstRate: number;
  cessRate: null;
  notes: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProformaLineItemsGridProps {
  fields: UseFieldArrayReturn<ProformaFormValues, "lineItems">["fields"];
  watchedItems: LineItemValues[] | undefined;
  control: Control<ProformaFormValues>;
  errors: FieldErrors<ProformaFormValues>;
  setValue: (name: string, value: unknown) => void;
  isInterState: boolean;
  onSetIsInterState: (value: boolean) => void;
  append: (item: DefaultLineItem) => void;
  remove: (index: number) => void;
  defaultLineItem: DefaultLineItem;
}

// ---------------------------------------------------------------------------
// Format helper
// ---------------------------------------------------------------------------

const fmt = (n: number) =>
  `\u20B9${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProformaLineItemsGrid({
  fields,
  watchedItems,
  control,
  errors,
  setValue,
  isInterState,
  onSetIsInterState,
  append,
  remove,
  defaultLineItem,
}: ProformaLineItemsGridProps) {
  return (
    <>
      {/* Tax Region toggle */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Tax Region:</span>
        <Button
          type="button"
          size="sm"
          variant={!isInterState ? "primary" : "outline"}
          onClick={() => onSetIsInterState(false)}
        >
          Same State (CGST+SGST)
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isInterState ? "primary" : "outline"}
          onClick={() => onSetIsInterState(true)}
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
                      name={`lineItems.${index}.productId` as any}
                      control={control as any}
                      render={({ field: f }) => (
                        <ProductSelect
                          label=""
                          value={(f.value as string) ?? null}
                          onChange={(val) => f.onChange(val ?? "")}
                          onProductSelect={(product: ProductSelectOption | null) => {
                            if (product) {
                              setValue(`lineItems.${index}.productName`, product.name);
                              if (product.salePrice)
                                setValue(`lineItems.${index}.unitPrice`, product.salePrice);
                              if (product.hsnCode)
                                setValue(`lineItems.${index}.hsnCode`, product.hsnCode);
                              if (product.primaryUnit)
                                setValue(`lineItems.${index}.unit`, product.primaryUnit);
                              if (product.gstRate != null)
                                setValue(`lineItems.${index}.gstRate`, product.gstRate);
                              if (product.cessRate != null)
                                setValue(`lineItems.${index}.cessRate`, product.cessRate);
                              if (product.shortDescription)
                                setValue(
                                  `lineItems.${index}.description`,
                                  product.shortDescription,
                                );
                            }
                          }}
                          error={
                            !!(errors as any).lineItems?.[index]?.productName
                          }
                        />
                      )}
                    />
                  </td>

                  {/* Quantity */}
                  <td className="py-2 pr-2">
                    <Controller
                      name={`lineItems.${index}.quantity` as any}
                      control={control as any}
                      render={({ field: f }) => (
                        <NumberInput
                          label=""
                          value={f.value as number}
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
                      name={`lineItems.${index}.unit` as any}
                      control={control as any}
                      render={({ field: f }) => (
                        <LookupSelect
                          masterCode="UNIT_OF_MEASURE"
                          label=""
                          value={(f.value as string) ?? ""}
                          onChange={(v) => f.onChange(String(v ?? ""))}
                        />
                      )}
                    />
                  </td>

                  {/* Unit Price */}
                  <td className="py-2 pr-2">
                    <Controller
                      name={`lineItems.${index}.unitPrice` as any}
                      control={control as any}
                      render={({ field: f }) => (
                        <CurrencyInput
                          label=""
                          value={f.value as number}
                          onChange={(v) => f.onChange(v)}
                          currency="\u20B9"
                        />
                      )}
                    />
                  </td>

                  {/* Discount */}
                  <td className="py-2 pr-2">
                    <div className="flex gap-1">
                      <Controller
                        name={`lineItems.${index}.discountType` as any}
                        control={control as any}
                        render={({ field: f }) => (
                          <div className="w-20">
                            <LookupSelect
                              masterCode="DISCOUNT_TYPE"
                              label=""
                              value={(f.value as string) ?? ""}
                              onChange={(v) => f.onChange(String(v ?? ""))}
                            />
                          </div>
                        )}
                      />
                      <Controller
                        name={`lineItems.${index}.discountValue` as any}
                        control={control as any}
                        render={({ field: f }) => (
                          <div className="w-20">
                            <NumberInput
                              label=""
                              value={(f.value as number | null) ?? null}
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
                      name={`lineItems.${index}.gstRate` as any}
                      control={control as any}
                      render={({ field: f }) => (
                        <LookupSelect
                          masterCode="GST_RATE"
                          numericValue
                          label=""
                          value={(f.value as number | null) ?? ""}
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
                        onClick={() => append(defaultLineItem)}
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
    </>
  );
}
