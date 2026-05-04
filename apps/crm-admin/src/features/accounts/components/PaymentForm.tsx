"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import { Input, SelectInput, Button, DatePicker, Fieldset } from "@/components/ui";
import { Icon } from "@/components/ui";
import { useCreatePayment, useBankList } from "../hooks/useAccounts";
import { useSidePanelStore } from "@/stores/side-panel.store";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { PageHeader } from "@/components/common/PageHeader";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const paymentSchema = z.object({
  paymentType: z.enum(["PAYMENT_OUT", "RECEIPT_IN"]),
  entityType: z.string().min(1, "Entity type is required"),
  entityId: z.string().min(1, "Entity is required"),
  entityName: z.string().min(1, "Entity name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentMode: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "UPI", "NEFT", "RTGS"]),
  bankAccountId: z.string().optional(),
  chequeNumber: z.string().optional(),
  chequeDate: z.string().optional(),
  transactionRef: z.string().optional(),
  upiId: z.string().optional(),
  tdsApplicable: z.boolean().default(false),
  tdsRate: z.number().min(0).max(100).optional(),
  tdsSection: z.string().optional(),
  paymentDate: z.string().min(1, "Payment date is required"),
  narration: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAYMENT_TYPE_OPTIONS = [
  { label: "Payment Out", value: "PAYMENT_OUT" },
  { label: "Receipt In", value: "RECEIPT_IN" },
];

const PAYMENT_MODE_OPTIONS = [
  { label: "Cash", value: "CASH" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Cheque", value: "CHEQUE" },
  { label: "UPI", value: "UPI" },
  { label: "NEFT", value: "NEFT" },
  { label: "RTGS", value: "RTGS" },
];

const ENTITY_TYPE_OPTIONS = [
  { label: "Contact", value: "CONTACT" },
  { label: "Organization", value: "ORGANIZATION" },
  { label: "Vendor", value: "VENDOR" },
];

const TDS_SECTION_OPTIONS = [
  { label: "194C - Contractor", value: "194C" },
  { label: "194J - Professional", value: "194J" },
  { label: "194H - Commission", value: "194H" },
  { label: "194I - Rent", value: "194I" },
  { label: "194A - Interest", value: "194A" },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PaymentFormProps {
  paymentId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentForm({ paymentId, mode = "page", panelId, onSuccess }: PaymentFormProps) {
  const router = useRouter();
  const isPanel = mode === "panel";
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const createPayment = useCreatePayment();
  const { data: bankData } = useBankList();

  const bankOptions = (bankData?.data ?? []).map((b: any) => ({
    label: b.accountName || b.bankName,
    value: b.id,
  }));

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      paymentType: "PAYMENT_OUT",
      entityType: "",
      entityId: "",
      entityName: "",
      amount: 0,
      paymentMode: "CASH",
      bankAccountId: "",
      chequeNumber: "",
      chequeDate: "",
      transactionRef: "",
      upiId: "",
      tdsApplicable: false,
      tdsRate: 0,
      tdsSection: "",
      paymentDate: new Date().toISOString().split("T")[0],
      narration: "",
    },
  });

  const paymentMode = watch("paymentMode");
  const tdsApplicable = watch("tdsApplicable");
  const amount = watch("amount") || 0;
  const tdsRate = watch("tdsRate") || 0;

  const tdsAmount = tdsApplicable ? (amount * tdsRate) / 100 : 0;
  const netAmount = amount - tdsAmount;

  const showChequeFields = paymentMode === "CHEQUE";
  const showTransactionRef = ["BANK_TRANSFER", "NEFT", "RTGS"].includes(paymentMode);
  const showUpiField = paymentMode === "UPI";

  // Sync panel footer buttons
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
          label: isSubmitting ? "Saving..." : "Save Payment",
          icon: "check",
          showAs: "both",
          variant: "primary",
          loading: isSubmitting,
          disabled: isSubmitting,
          onClick: () => {
            const formEl = document.getElementById(`sp-form-payment-${paymentId ?? "new"}`) as HTMLFormElement | null;
            formEl?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, paymentId, updatePanelConfig]);

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      await createPayment.mutateAsync(values as any);
      toast.success("Payment saved");
      if (isPanel && onSuccess) {
        onSuccess();
      } else {
        router.push("/accounts/payments");
      }
    } catch {
      toast.error("Failed to save payment");
    }
  };

  return (
    <div className={isPanel ? "p-4" : "p-6 max-w-3xl mx-auto"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={false} />
      {!isPanel && (
        <PageHeader
          title="New Payment"
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
          }
        />
      )}

      <form
        id={isPanel ? `sp-form-payment-${paymentId ?? "new"}` : undefined}
        onSubmit={handleSubmit(onSubmit as any)}
        noValidate
        className="mt-4 space-y-6"
      >
        <FormErrors errors={errors} />

        {/* ── Payment Info ── */}
        <Fieldset label="Payment Info">
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="paymentType"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Payment Type"
                  leftIcon={<Icon name="repeat" size={16} />}
                  options={PAYMENT_TYPE_OPTIONS}
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  error={!!(errors.paymentType)}
                />
              )}
            />
            <Controller
              name="paymentDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Payment Date *"
                  value={field.value || undefined}
                  onChange={(v) => field.onChange(v ?? "")}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* ── Entity Info ── */}
        <Fieldset label="Entity Info">
          <div className="grid grid-cols-3 gap-4">
            <Controller
              name="entityType"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Entity Type"
                  leftIcon={<Icon name="building" size={16} />}
                  options={ENTITY_TYPE_OPTIONS}
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  error={!!(errors.entityType)}
                />
              )}
            />
            <Controller
              name="entityId"
              control={control}
              render={({ field }) => (
                <Input
                  label="Entity ID"
                  leftIcon={<Icon name="hash" size={16} />}
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  error={!!(errors.entityId)}
                />
              )}
            />
            <Controller
              name="entityName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Entity Name"
                  leftIcon={<Icon name="user" size={16} />}
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  error={!!(errors.entityName)}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* ── Payment Details ── */}
        <Fieldset label="Payment Details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Amount *"
                    type="number"
                    leftIcon={<Icon name="indian-rupee" size={16} />}
                    value={String(field.value)}
                    onChange={(v) => field.onChange(Number(v) || 0)}
                    error={!!(errors.amount)}
                  />
                )}
              />
              <Controller
                name="paymentMode"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    label="Payment Mode"
                    leftIcon={<Icon name="credit-card" size={16} />}
                    options={PAYMENT_MODE_OPTIONS}
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    error={!!(errors.paymentMode)}
                  />
                )}
              />
            </div>

            <Controller
              name="bankAccountId"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Bank Account"
                  leftIcon={<Icon name="landmark" size={16} />}
                  options={bankOptions}
                  value={field.value || ""}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />

            {showChequeFields && (
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="chequeNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Cheque Number"
                      leftIcon={<Icon name="file-text" size={16} />}
                      value={field.value || ""}
                      onChange={(v) => field.onChange(v)}
                    />
                  )}
                />
                <Controller
                  name="chequeDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Cheque Date"
                      value={field.value || undefined}
                      onChange={(v) => field.onChange(v ?? "")}
                    />
                  )}
                />
              </div>
            )}

            {showTransactionRef && (
              <Controller
                name="transactionRef"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Transaction Reference"
                    leftIcon={<Icon name="hash" size={16} />}
                    value={field.value || ""}
                    onChange={(v) => field.onChange(v)}
                  />
                )}
              />
            )}

            {showUpiField && (
              <Controller
                name="upiId"
                control={control}
                render={({ field }) => (
                  <Input
                    label="UPI ID"
                    leftIcon={<Icon name="at-sign" size={16} />}
                    value={field.value || ""}
                    onChange={(v) => field.onChange(v)}
                  />
                )}
              />
            )}
          </div>
        </Fieldset>

        {/* ── TDS Details ── */}
        <Fieldset label="TDS Details">
          <div className="space-y-4">
            <Controller
              name="tdsApplicable"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-medium">TDS Applicable</span>
                </label>
              )}
            />

            {tdsApplicable && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="tdsSection"
                    control={control}
                    render={({ field }) => (
                      <SelectInput
                        label="TDS Section"
                        leftIcon={<Icon name="book-open" size={16} />}
                        options={TDS_SECTION_OPTIONS}
                        value={field.value || ""}
                        onChange={(v) => field.onChange(v)}
                      />
                    )}
                  />
                  <Controller
                    name="tdsRate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="TDS Rate (%)"
                        type="number"
                        leftIcon={<Icon name="percent" size={16} />}
                        value={String(field.value || 0)}
                        onChange={(v) => field.onChange(Number(v) || 0)}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100 text-sm">
                  <div>
                    <p className="text-gray-500">Amount</p>
                    <p className="font-semibold">₹{amount.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">TDS ({tdsRate}%)</p>
                    <p className="font-semibold text-red-600">-₹{tdsAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Net Amount</p>
                    <p className="font-bold text-green-600">₹{netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Fieldset>

        {/* ── Narration ── */}
        <Fieldset label="Narration">
          <Controller
            name="narration"
            control={control}
            render={({ field }) => (
              <Input
                label="Narration / Notes"
                leftIcon={<Icon name="message-square" size={16} />}
                value={field.value || ""}
                onChange={(v) => field.onChange(v)}
              />
            )}
          />
        </Fieldset>

        {!isPanel && (
          <div className="flex items-center gap-3 justify-end pt-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              <Icon name="check" size={16} />
              {isSubmitting ? "Saving..." : "Save Payment"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
