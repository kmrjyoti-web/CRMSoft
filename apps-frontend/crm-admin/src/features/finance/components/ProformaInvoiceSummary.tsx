"use client";

import { Control, Controller } from "react-hook-form";

import { NumberInput, Typography } from "@/components/ui";
import { LookupSelect } from "@/components/common/LookupSelect";

// ---------------------------------------------------------------------------
// Types (minimal slice consumed by this component)
// ---------------------------------------------------------------------------

interface SummaryValues {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  cessTotal: number;
  roundOff: number;
  totalAmount: number;
}

interface ProformaFormValues {
  discountType?: string;
  discountValue?: number | null;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProformaInvoiceSummaryProps {
  control: Control<ProformaFormValues>;
  summary: SummaryValues;
  isInterState: boolean;
  fmt: (n: number) => string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProformaInvoiceSummary({
  control,
  summary,
  isInterState,
  fmt,
}: ProformaInvoiceSummaryProps) {
  return (
    <div className="space-y-2">
      {/* Global discount row */}
      <div className="mb-3 flex items-center gap-3">
        <span className="text-sm text-gray-600">Global Discount:</span>
        <div className="w-24">
          <Controller
            name="discountType"
            control={control as any}
            render={({ field }) => (
              <LookupSelect
                masterCode="DISCOUNT_TYPE"
                label=""
                value={(field.value as string) ?? ""}
                onChange={(v) => field.onChange(String(v ?? ""))}
              />
            )}
          />
        </div>
        <div className="w-28">
          <Controller
            name="discountValue"
            control={control as any}
            render={({ field }) => (
              <NumberInput
                label=""
                value={(field.value as number | null) ?? null}
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
  );
}
