'use client';

import { Control, Controller, FieldArrayWithId, FieldErrors, UseFormSetValue } from "react-hook-form";

import { NumberInput, CurrencyInput } from "@/components/ui";
import { LookupSelect } from "@/components/common/LookupSelect";
import { ProductSelect } from "@/components/common/ProductSelect";
import type { ProductSelectOption } from "@/components/common/ProductSelect";
import { DiscountInput } from "@/components/common/DiscountInput";
import { ROW_HEIGHT_PX } from "@/stores/quotation-layout.store";
import { calculateLineItem } from "../utils/gst";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// Mirrors the shape of QuotationFormValues used in QuotationForm
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyControl = Control<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySetValue = UseFormSetValue<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFieldErrors = FieldErrors<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFieldArrayItem = FieldArrayWithId<any, any, "id">;

type RowHeight = "compact" | "normal" | "comfortable";

interface WatchedItem {
  quantity?: number;
  unitPrice?: number;
  discountType?: string;
  discountValue?: number | null;
  gstRate?: number | null;
  cessRate?: number | null;
  isOptional?: boolean;
  [key: string]: unknown;
}

interface ColWidths {
  qty: string | number;
  unit: string | number;
  unitPrice: string | number;
  discount: string | number;
  gst: string | number;
  lineTotal: string | number;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface QuotationLineItemsGridProps {
  fields: AnyFieldArrayItem[];
  watchedItems: WatchedItem[];
  colWidths: ColWidths;
  rowHeight: RowHeight;
  blankRowCount: number;
  control: AnyControl;
  errors: AnyFieldErrors;
  productSelectMode: "autocomplete" | "modal";
  makeTabHandler: (colName: string, rowIndex: number, totalRows: number) => (e: React.KeyboardEvent) => void;
  setValue: AnySetValue;
  calculateLineItem: typeof calculateLineItem;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuotationLineItemsGrid({
  fields,
  watchedItems,
  colWidths,
  rowHeight,
  blankRowCount,
  control,
  errors,
  productSelectMode,
  makeTabHandler,
  setValue,
  calculateLineItem: calcLineItem,
}: QuotationLineItemsGridProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Scrollable grid area */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        {/* Grid wrapper — strips all input borders so controls look flat inside cells */}
        <div className="quotation-grid border border-[var(--color-primary-100)]">
          <table className="w-full text-sm table-fixed border-collapse">
            <colgroup>
              <col />{/* Product — fills remaining space */}
              <col style={{ width: colWidths.qty }} />
              <col style={{ width: colWidths.unit }} />
              <col style={{ width: colWidths.unitPrice }} />
              <col style={{ width: colWidths.discount }} />
              <col style={{ width: colWidths.gst }} />
              <col style={{ width: colWidths.lineTotal }} />
            </colgroup>
            <thead>
              <tr className="bg-[var(--color-primary)] text-white text-xs font-semibold uppercase">
                <th className="py-1.5 px-2 text-left border-r border-[var(--color-primary-700)]">Product</th>
                <th className="py-1.5 px-2 text-right border-r border-[var(--color-primary-700)]">Qty</th>
                <th className="py-1.5 px-2 text-left border-r border-[var(--color-primary-700)]">Unit</th>
                <th className="py-1.5 px-2 text-right border-r border-[var(--color-primary-700)]">Rate</th>
                <th className="py-1.5 px-2 text-right border-r border-[var(--color-primary-700)]">Disc 1.%</th>
                <th className="py-1.5 px-2 text-right border-r border-[var(--color-primary-700)]">GST %</th>
                <th className="py-1.5 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((fieldItem, index) => {
                const itemValues = watchedItems?.[index];
                const calc = calcLineItem({
                  quantity: itemValues?.quantity ?? 0,
                  unitPrice: itemValues?.unitPrice ?? 0,
                  discountType: itemValues?.discountType,
                  discountValue: itemValues?.discountValue,
                  gstRate: itemValues?.gstRate,
                });
                return (
                  <tr
                    key={fieldItem.id}
                    data-row-index={index}
                    className="align-middle border-b border-[var(--color-primary-100)] hover:bg-[var(--color-primary-50)] transition-colors"
                    style={{ height: ROW_HEIGHT_PX[rowHeight] }}
                  >
                    <td className="p-0 border-r border-[var(--color-primary-100)]" onKeyDown={makeTabHandler("product", index, fields.length)}>
                      <Controller
                        name={`items.${index}.productId`}
                        control={control}
                        render={({ field: f }) => (
                          <ProductSelect
                            label=""
                            inputMode={productSelectMode}
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
                    <td className="p-0 border-r border-[var(--color-primary-100)]" onKeyDown={makeTabHandler("qty", index, fields.length)}>
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
                    <td className="p-0 border-r border-[var(--color-primary-100)]" onKeyDown={makeTabHandler("unit", index, fields.length)}>
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
                    <td className="p-0 border-r border-[var(--color-primary-100)]" onKeyDown={makeTabHandler("unitPrice", index, fields.length)}>
                      <Controller
                        name={`items.${index}.unitPrice`}
                        control={control}
                        render={({ field: f }) => (
                          <CurrencyInput
                            label=""
                            value={f.value ?? undefined}
                            onChange={f.onChange}
                            currency="₹"
                            decimals={2}
                          />
                        )}
                      />
                    </td>
                    <td className="p-0 border-r border-[var(--color-primary-100)]" onKeyDown={makeTabHandler("discount", index, fields.length)}>
                      <Controller
                        name={`items.${index}.discountValue`}
                        control={control}
                        render={({ field: f }) => (
                          <DiscountInput
                            value={f.value ?? null}
                            discountType={watchedItems?.[index]?.discountType ?? "PERCENTAGE"}
                            onChange={f.onChange}
                            onTypeChange={(type) => setValue(`items.${index}.discountType`, type)}
                          />
                        )}
                      />
                    </td>
                    <td className="p-0 border-r border-[var(--color-primary-100)]" onKeyDown={makeTabHandler("gst", index, fields.length)}>
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
                    <td className="p-0" onKeyDown={makeTabHandler("lineTotal", index, fields.length)}>
                      <NumberInput
                        label=""
                        value={calc.lineTotal}
                        onChange={() => {}}
                        disabled
                        precision={2}
                      />
                    </td>
                  </tr>
                );
              })}
              {/* Blank rows — full controls, empty values, non-interactive */}
              {Array.from({ length: blankRowCount }).map((_, i) => (
                <tr
                  key={`blank-${i}`}
                  className="border-b border-[var(--color-primary-100)]"
                  style={{ height: ROW_HEIGHT_PX[rowHeight] }}
                >
                  <td className="p-0 border-r border-[var(--color-primary-100)]">
                    <ProductSelect label="" inputMode={productSelectMode} value={null} onChange={() => {}} disabled />
                  </td>
                  <td className="p-0 border-r border-[var(--color-primary-100)]">
                    <NumberInput label="" value={null} onChange={() => {}} disabled precision={2} />
                  </td>
                  <td className="p-0 border-r border-[var(--color-primary-100)]">
                    <LookupSelect masterCode="UNIT_OF_MEASURE" value="" onChange={() => {}} disabled />
                  </td>
                  <td className="p-0 border-r border-[var(--color-primary-100)]">
                    <CurrencyInput label="" value={null} onChange={() => {}} currency="₹" decimals={2} disabled />
                  </td>
                  <td className="p-0 border-r border-[var(--color-primary-100)]">
                    <DiscountInput value={null} discountType="PERCENTAGE" onChange={() => {}} onTypeChange={() => {}} disabled />
                  </td>
                  <td className="p-0 border-r border-[var(--color-primary-100)]">
                    <LookupSelect masterCode="GST_RATE" value="" onChange={() => {}} disabled />
                  </td>
                  <td className="p-0">
                    <NumberInput label="" value={null} onChange={() => {}} disabled precision={2} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
