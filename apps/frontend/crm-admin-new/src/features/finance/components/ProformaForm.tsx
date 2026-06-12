"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Fieldset } from "@/components/ui";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { useSidePanelStore } from "@/stores/side-panel.store";

import {
  useProformaDetail,
  useCreateProforma,
  useUpdateProforma,
} from "../hooks/useProforma";
import { calculateSummary } from "@/features/quotations/utils/gst";
import type { ProformaLineItem } from "../types/proforma.types";

import { ProformaHeaderFields } from "./ProformaHeaderFields";
import { ProformaLineItemsGrid } from "./ProformaLineItemsGrid";
import { ProformaInvoiceSummary } from "./ProformaInvoiceSummary";
import { ProformaModals } from "./ProformaModals";

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
  unitPrice: z.number().min(0, "Unit price required"),
  discountType: z.string().optional(),
  discountValue: z.number().nullable().optional(),
  gstRate: z.number().nullable().optional(),
  cessRate: z.number().nullable().optional(),
  notes: z.string().optional(),
});

const proformaSchema = z.object({
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
  proformaDate: z.string().optional(),
  validUntil: z.string().optional(),
  discountType: z.string().optional(),
  discountValue: z.number().nullable().optional(),
  isInterState: z.boolean().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item"),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  internalNotes: z.string().optional(),
});

type ProformaFormValues = z.infer<typeof proformaSchema>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_LINE_ITEM = {
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

interface ProformaFormProps {
  proformaId?: string;
  leadId?: string;
  quotationId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProformaForm({
  proformaId,
  leadId: defaultLeadId,
  quotationId: defaultQuotationId,
  mode = "page",
  panelId,
  onSuccess,
  onCancel,
}: ProformaFormProps) {
  const router = useRouter();
  const isEdit = !!proformaId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const [isInterState, setIsInterState] = useState(false);
  const [billingStateCode, setBillingStateCode] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showInternalNotesModal, setShowInternalNotesModal] = useState(false);

  // -- Queries & Mutations --------------------------------------------------
  const { data: proformaData, isLoading: isLoadingProforma } =
    useProformaDetail(proformaId ?? "");
  const createProforma = useCreateProforma();
  const updateProforma = useUpdateProforma();

  // -- Form Setup -----------------------------------------------------------
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProformaFormValues>({
    resolver: zodResolver(proformaSchema) as any,
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
      proformaDate: "",
      validUntil: "",
      discountType: "",
      discountValue: null,
      isInterState: false,
      lineItems: [DEFAULT_LINE_ITEM],
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
    if (!isEdit || !proformaData?.data) return;
    const pi = proformaData.data;

    setIsInterState(pi.isInterState ?? false);

    reset({
      quotationId: pi.quotationId ?? "",
      leadId: pi.leadId ?? "",
      contactId: pi.contactId ?? "",
      organizationId: pi.organizationId ?? "",
      billingName: pi.billingName ?? "",
      billingAddress: pi.billingAddress ?? "",
      billingCity: pi.billingCity ?? "",
      billingState: pi.billingState ?? "",
      billingPincode: pi.billingPincode ?? "",
      billingGstNumber: pi.billingGstNumber ?? "",
      proformaDate: pi.proformaDate ?? "",
      validUntil: pi.validUntil ?? "",
      discountType: pi.discountType ?? "",
      discountValue: pi.discountValue ?? null,
      isInterState: pi.isInterState ?? false,
      lineItems: (pi.lineItems ?? []).map((li: ProformaLineItem) => ({
        productId: li.productId ?? "",
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
      notes: pi.notes ?? "",
      termsAndConditions: pi.termsAndConditions ?? "",
      internalNotes: pi.internalNotes ?? "",
    });
  }, [isEdit, proformaData, reset]);

  // -- Pre-fill leadId when opened from Lead Dashboard ----------------------
  useEffect(() => {
    if (isEdit || !defaultLeadId) return;
    setValue("leadId", defaultLeadId);
  }, [isEdit, defaultLeadId, setValue]);

  // -- Pre-fill quotationId when opened from Quotation Detail ---------------
  useEffect(() => {
    if (isEdit || !defaultQuotationId) return;
    setValue("quotationId", defaultQuotationId);
  }, [isEdit, defaultQuotationId, setValue]);

  // -- Sync isSubmitting → panel footer button ------------------------------
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
          label: isSubmitting
            ? isEdit
              ? "Updating..."
              : "Saving..."
            : isEdit
              ? "Save Changes"
              : "Save",
          icon: "check",
          showAs: "both",
          variant: "primary",
          loading: isSubmitting,
          disabled: isSubmitting,
          onClick: () => {
            const formId = `sp-form-proforma-${proformaId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, proformaId, updatePanelConfig]);

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
  const onSubmit = async (values: ProformaFormValues) => {
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

      if (isEdit && proformaId) {
        const { lineItems, quotationId, leadId, contactId, organizationId, ...rest } = payload;
        await updateProforma.mutateAsync({ id: proformaId, data: rest });
        toast.success("Proforma invoice updated");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push(`/finance/proforma-invoices/${proformaId}`);
        }
      } else {
        await createProforma.mutateAsync(payload as any);
        toast.success("Proforma invoice created");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push("/finance/proforma-invoices");
        }
      }
    } catch {
      toast.error(
        isEdit
          ? "Failed to update proforma invoice"
          : "Failed to create proforma invoice",
      );
    }
  };

  // -- Loading state --------------------------------------------------------
  if (isEdit && isLoadingProforma) return <LoadingSpinner fullPage />;

  const isPanel = mode === "panel";

  // -- Render ---------------------------------------------------------------
  return (
    <div className={isPanel ? "p-4" : "p-6 max-w-5xl mx-auto"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Proforma Invoice" : "New Proforma Invoice"}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
          }
        />
      )}

      <form
        id={isPanel ? `sp-form-proforma-${proformaId ?? "new"}` : undefined}
        onSubmit={(handleSubmit as any)(onSubmit)}
        noValidate
        className={`${isPanel ? "mt-2" : "mt-4 max-w-5xl"} space-y-6`}
      >
        <FormErrors errors={errors} />

        {/* ----------------------------------------------------------------
            Proforma Information + Billing Address
        ---------------------------------------------------------------- */}
        <ProformaHeaderFields
          control={control as any}
          errors={errors as any}
          watch={watch as any}
          setValue={setValue as any}
          billingStateCode={billingStateCode}
          onBillingStateCodeChange={setBillingStateCode}
        />

        {/* ----------------------------------------------------------------
            Line Items
        ---------------------------------------------------------------- */}
        <Fieldset label="Line Items">
          <ProformaLineItemsGrid
            fields={fields as any}
            watchedItems={watchedLineItems}
            control={control as any}
            errors={errors as any}
            setValue={setValue as any}
            isInterState={isInterState}
            onSetIsInterState={setIsInterState}
            append={append as any}
            remove={remove}
            defaultLineItem={DEFAULT_LINE_ITEM}
          />
        </Fieldset>

        {/* ----------------------------------------------------------------
            Summary
        ---------------------------------------------------------------- */}
        <Fieldset label="Summary">
          <ProformaInvoiceSummary
            control={control as any}
            summary={summary}
            isInterState={isInterState}
            fmt={fmt}
          />
        </Fieldset>

        {/* ----------------------------------------------------------------
            Notes, Terms & Conditions, Internal Notes — modal-based
        ---------------------------------------------------------------- */}
        <ProformaModals
          control={control as any}
          watch={watch as any}
          showNotesModal={showNotesModal}
          showTermsModal={showTermsModal}
          showInternalNotesModal={showInternalNotesModal}
          onShowNotesModal={setShowNotesModal}
          onShowTermsModal={setShowTermsModal}
          onShowInternalNotesModal={setShowInternalNotesModal}
        />

        {/* ----------------------------------------------------------------
            Actions — hidden in panel mode (footer handles it)
        ---------------------------------------------------------------- */}
        {!isPanel && (
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                  ? "Update"
                  : "Save"}
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
