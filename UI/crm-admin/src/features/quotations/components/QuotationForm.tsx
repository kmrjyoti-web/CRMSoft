'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { LeadSelect } from "@/components/common/LeadSelect";
import type { LeadSelectOption } from "@/components/common/LeadSelect";
import { ContactSelect } from "@/components/common/ContactSelect";
import { OrganizationSelect } from "@/components/common/OrganizationSelect";
import { FormErrors } from "@/components/common/FormErrors";
import { DiscountInput } from "@/components/common/DiscountInput";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { useSidePanelStore } from "@/stores/side-panel.store";
import { useContentPanel } from "@/hooks/useEntityPanel";
import { useQuotationLayoutStore, ROW_HEIGHT_PX, DEFAULT_COL_WIDTHS } from "@/stores/quotation-layout.store";
import { QuotationConfigPanel } from "./QuotationConfigPanel";

import { useQuotationDetail, useCreateQuotation, useUpdateQuotation } from "../hooks/useQuotations";
import { calculateLineItem, calculateSummary } from "../utils/gst";
import type { LineItem } from "../types/quotations.types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

// Coerce string/null → number | undefined (handles CurrencyInput/NumberInput returning strings)
const numCoerce = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().min(0).optional(),
);
const numCoerceNullable = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
  z.number().nullable().optional(),
);

const lineItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().optional(),
  description: z.string().optional(),
  hsnCode: z.string().optional(),
  quantity: numCoerce,
  unit: z.string().optional(),
  unitPrice: numCoerce,
  discountType: z.string().optional(),
  discountValue: numCoerceNullable,
  gstRate: numCoerceNullable,
  cessRate: numCoerceNullable,
  isOptional: z.boolean().optional(),
  notes: z.string().optional(),
});

const quotationSchema = z.object({
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
  discountValue: numCoerceNullable,
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

// Stable module-level default — never recreated, so Zustand selectors stay referentially equal
const DEFAULT_SECTION_CFG = { mode: "auto" as const, fixedPx: 56, detectedPx: null };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuotationForm({ quotationId, leadId: defaultLeadId, mode = "page", panelId, onSuccess, onCancel }: QuotationFormProps) {
  const router = useRouter();
  const isEdit = !!quotationId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);
  const { openContent } = useContentPanel();

  const configKey    = quotationId ?? "new";
  const setHeaderCfg = useQuotationLayoutStore((s) => s.setHeaderConfig);
  const setFooterCfg = useQuotationLayoutStore((s) => s.setFooterConfig);
  const colWidths         = useQuotationLayoutStore((s) => s.configs[configKey]?.colWidths          ?? DEFAULT_COL_WIDTHS);
  const rowHeight         = useQuotationLayoutStore((s) => s.configs[configKey]?.rowHeight          ?? "normal");
  const autoDetect        = useQuotationLayoutStore((s) => s.configs[configKey]?.autoDetectGridSize ?? true);
  const productSelectMode  = useQuotationLayoutStore((s) => s.configs[configKey]?.productSelectMode  ?? "autocomplete");
  const newRowTriggerCol   = useQuotationLayoutStore((s) => s.configs[configKey]?.newRowTriggerCol   ?? "lineTotal");
  const headerCfg         = useQuotationLayoutStore((s) => s.configs[configKey]?.header             ?? DEFAULT_SECTION_CFG);
  const footerCfg         = useQuotationLayoutStore((s) => s.configs[configKey]?.footer             ?? DEFAULT_SECTION_CFG);

  // Refs for ResizeObserver auto-detect
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Blank row auto-size state
  const [blankRowCount, setBlankRowCount] = useState(0);

  const [isInterState] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Unsaved changes confirm dialog
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const pendingCloseRef = useRef<(() => void) | null>(null);

  // Error modal state
  const [errorModal, setErrorModal] = useState<{
    open: boolean;
    title: string;
    summary: string;
    details: { field: string; message: string }[];
    rawError?: string;
  }>({ open: false, title: "", summary: "", details: [], rawError: undefined });
  const [showErrorRaw, setShowErrorRaw] = useState(false);

  // Open config panel
  const handleOpenConfig = useCallback(() => {
    openContent({
      id: `quotation-config-${configKey}`,
      title: "Quotation Layout",
      icon: "settings",
      width: 400,
      content: <QuotationConfigPanel configKey={configKey} />,
    });
  }, [openContent, configKey]);

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
    formState: { errors, isSubmitting, isDirty },
  } = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema) as any,
    defaultValues: {
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
      discountType: "PERCENTAGE",
      discountValue: null,
      internalNotes: "",
      items: [{
        productId: "",
        productName: "",
        quantity: undefined,
        unit: "PIECE",
        unitPrice: undefined,
        discountType: "PERCENTAGE",
        discountValue: null,
        gstRate: null,
        cessRate: null,
        isOptional: false,
        notes: "",
      }],
    },
  });

  const { fields, append } = useFieldArray({ control, name: "items" });

  // ── Pre-populate in edit mode ─────────────────────────────
  useEffect(() => {
    if (!isEdit || !quotationData?.data) return;
    const q = quotationData.data;
    reset({
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

  // ── ResizeObserver — auto-detect header/footer heights ────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        if (entry.target === headerRef.current) setHeaderCfg(configKey, { detectedPx: h });
        if (entry.target === footerRef.current) setFooterCfg(configKey, { detectedPx: h });
      }
    });
    if (headerRef.current) obs.observe(headerRef.current);
    if (footerRef.current) obs.observe(footerRef.current);
    return () => obs.disconnect();
  }, [configKey, setHeaderCfg, setFooterCfg]);

  // ── Blank row auto-size ────────────────────────────────────
  useEffect(() => {
    if (!autoDetect) { setBlankRowCount(0); return; }
    const CHROME_PX = 240;
    const rowPx = ROW_HEIGHT_PX[rowHeight];
    const headerPx = headerCfg.mode === "auto" && headerCfg.detectedPx != null
      ? headerCfg.detectedPx : headerCfg.fixedPx;
    const footerPx = footerCfg.mode === "auto" && footerCfg.detectedPx != null
      ? footerCfg.detectedPx : footerCfg.fixedPx;

    const calc = () => {
      const avail = Math.max(0, window.innerHeight - headerPx - footerPx - CHROME_PX);
      const total = Math.max(0, Math.floor(avail / rowPx));
      setBlankRowCount(Math.max(0, total - fields.length));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [autoDetect, rowHeight, headerCfg, footerCfg, fields.length]);

  // Register Configure button in panel header
  useEffect(() => {
    if (!panelId) return;
    updatePanelConfig(panelId, {
      headerButtons: [
        {
          id: "configure-layout",
          label: "Configure",
          icon: "settings",
          showAs: "icon",
          variant: "ghost",
          onClick: handleOpenConfig,
        },
      ],
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelId, updatePanelConfig, handleOpenConfig]);

  // Register unsaved-changes guard on the panel
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;
  useEffect(() => {
    if (!panelId) return;
    updatePanelConfig(panelId, {
      onBeforeClose: () => {
        if (!isDirtyRef.current) return true;
        // Show styled confirm dialog instead of window.confirm
        setShowUnsavedDialog(true);
        return false; // block close — dialog will handle it
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelId, updatePanelConfig]);

  const submitRef = useRef<(() => void) | null>(null);
  const formId = `sp-form-quotation-${quotationId ?? "new"}`;

  // Sync isSubmitting + footer-left buttons → panel footer
  const closePanel = useSidePanelStore((s) => s.closePanel);
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
          onClick: () => closePanel(panelId),
        },
        {
          id: "save",
          label: isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Save Changes" : "Save",
          icon: "check",
          showAs: "both",
          variant: "primary",
          loading: isSubmitting,
          disabled: isSubmitting,
          onClick: () => { void handleSubmit(onSubmit, onInvalid)(); },
        },
      ],
      footerLeft: (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSummaryModal(true)}
            className="flex items-center gap-1 rounded border border-dashed border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <span>📄</span>
            <span>Summary</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="flex items-center gap-1 rounded border border-dashed border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <span>🛡</span>
            <span>Validity & Terms</span>
          </button>
          <button
            type="button"
            onClick={() => setShowNotesModal(true)}
            className="flex items-center gap-1 rounded border border-dashed border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <span>💬</span>
            <span>Internal Notes</span>
          </button>
        </div>
      ),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting, panelId, isEdit, quotationId, formId, updatePanelConfig, closePanel, setShowSummaryModal, setShowTermsModal, setShowNotesModal]);

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
  const toNum = (v: unknown): number | undefined => v === "" || v === null || v === undefined ? undefined : Number(v);
  const toNumNull = (v: unknown): number | null => v === "" || v === null || v === undefined ? null : Number(v);
  // Strip empty strings — API only accepts "PERCENTAGE" | "FLAT" or omitted
  const normalizeDiscountType = (t: string | undefined): string | undefined => t || undefined;

  // Human-readable labels for form fields (top-level + line-item fields)
  const FIELD_LABELS: Record<string, string> = {
    leadId: "Lead",
    contactPersonId: "Contact Person",
    organizationId: "Organization",
    priceType: "Price Type",
    summary: "Summary",
    validFrom: "Valid From",
    validUntil: "Valid Until",
    paymentTerms: "Payment Terms",
    deliveryTerms: "Delivery Terms",
    warrantyTerms: "Warranty Terms",
    termsConditions: "Terms & Conditions",
    // Line item fields
    productId: "Product",
    productName: "Product Name",
    quantity: "Qty",
    unit: "Unit",
    unitPrice: "Rate",
    discountType: "Discount Type",
    discountValue: "Discount",
    gstRate: "GST %",
    cessRate: "Cess %",
    items: "Line Items",
  };

  // Called when form validation fails — show toast + populate error modal
  const onInvalid = (fieldErrors: Record<string, unknown>) => {
    const details: { field: string; message: string }[] = [];

    for (const [key, err] of Object.entries(fieldErrors)) {
      const label = FIELD_LABELS[key] || key;

      if (key === "items" && Array.isArray(err)) {
        // Line-item level errors — e.g. items[0].quantity
        err.forEach((itemErr: Record<string, unknown> | undefined, idx: number) => {
          if (!itemErr) return;
          for (const [field, fieldErr] of Object.entries(itemErr)) {
            const fieldLabel = FIELD_LABELS[field] || field;
            details.push({
              field: `Row ${idx + 1} — ${fieldLabel}`,
              message: (fieldErr as any)?.message || `${fieldLabel} is invalid`,
            });
          }
        });
      } else if (err?.message) {
        details.push({ field: label, message: err.message });
      } else if (key === "items" && err?.root?.message) {
        details.push({ field: label, message: err.root.message });
      } else {
        details.push({ field: label, message: `${label} is required` });
      }
    }

    const count = details.length;
    const firstMsg = details[0]?.message ?? "Validation failed";
    toast.error(`${firstMsg}${count > 1 ? ` (+${count - 1} more)` : ""}`, {
      duration: 4000,
    });

    setErrorModal({
      open: true,
      title: "Validation Errors",
      summary: `${count} field${count > 1 ? "s" : ""} need${count === 1 ? "s" : ""} attention`,
      details,
    });
    setShowErrorRaw(false);

    // Scroll to header so user sees highlighted fields
    headerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (values: QuotationFormValues) => {
    try {
      // Coerce all numeric fields — CurrencyInput/NumberInput may pass strings
      const filledItems = (values.items ?? [])
        .filter((item) => item.productName?.trim())
        .map((item) => ({
          productId:     item.productId || undefined,
          productName:   item.productName!,
          description:   item.description || undefined,
          quantity:      toNum(item.quantity) ?? 0,
          unit:          item.unit || undefined,
          unitPrice:     toNum(item.unitPrice) ?? 0,
          discountType:  normalizeDiscountType(item.discountType),
          discountValue: toNumNull(item.discountValue) ?? undefined,
          gstRate:       toNumNull(item.gstRate) ?? undefined,
          cessRate:      toNumNull(item.cessRate) ?? undefined,
          isOptional:    item.isOptional ?? false,
          notes:         item.notes || undefined,
        }));
      if (!isEdit && filledItems.length === 0) {
        toast.error("Please add at least one product");
        setErrorModal({
          open: true,
          title: "Validation Errors",
          summary: "1 field needs attention",
          details: [{ field: "Line Items", message: "Please add at least one product with a name before saving." }],
        });
        setShowErrorRaw(false);
        return;
      }

      const payload = {
        leadId: values.leadId,
        contactPersonId: values.contactPersonId || undefined,
        organizationId: values.organizationId || undefined,
        summary: values.summary || undefined,
        priceType: values.priceType || undefined,
        validFrom: values.validFrom || undefined,
        validUntil: values.validUntil || undefined,
        paymentTerms: values.paymentTerms || undefined,
        deliveryTerms: values.deliveryTerms || undefined,
        warrantyTerms: values.warrantyTerms || undefined,
        termsConditions: values.termsConditions || undefined,
        discountType: normalizeDiscountType(values.discountType),
        discountValue: toNumNull(values.discountValue) ?? undefined,
        internalNotes: values.internalNotes || undefined,
        items: filledItems,
      };

      if (isEdit && quotationId) {
        const { items, leadId, contactPersonId, organizationId, discountValue, ...rest } = payload;
        const updateData = { ...rest, discountValue: discountValue ?? undefined };
        await updateMutation.mutateAsync({ id: quotationId, data: updateData });
        // Mark form as clean so dirty guard doesn't fire
        reset(undefined, { keepValues: true });
        isDirtyRef.current = false;
        toast.success("Quotation updated successfully");
        if (mode === "panel" && onSuccess) onSuccess();
        router.push(`/quotations/${quotationId}`);
      } else {
        const result = await createMutation.mutateAsync(payload as any);
        const newId = (result as any)?.data?.id ?? (result as any)?.id;
        // Mark form as clean so dirty guard doesn't fire
        reset(undefined, { keepValues: true });
        isDirtyRef.current = false;
        toast.success("Quotation created successfully");
        if (mode === "panel" && onSuccess) onSuccess();
        router.push(newId ? `/quotations/${newId}` : "/quotations");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: any } };
      const apiData = axiosErr?.response?.data;
      const status = axiosErr?.response?.status;

      const details: { field: string; message: string }[] = [];
      let summary = isEdit ? "Failed to update quotation" : "Failed to create quotation";

      // NestJS structured error: { error: { details: [{ field, message }] } }
      const errorDetails: { field?: string; message?: string }[] = apiData?.error?.details ?? [];
      if (errorDetails.length > 0) {
        for (const d of errorDetails) {
          const rawField = d.field ?? "unknown";
          // Parse "items.0.property hsnCode ..." → "Row 1 — HSN Code"
          const match = rawField.match(/items\.(\d+)\.(\w+)/);
          let fieldLabel = rawField;
          if (match) {
            const rowNum = Number(match[1]) + 1;
            const fld = match[2];
            fieldLabel = `Row ${rowNum} — ${FIELD_LABELS[fld] || fld}`;
          } else if (FIELD_LABELS[rawField]) {
            fieldLabel = FIELD_LABELS[rawField];
          }
          details.push({ field: fieldLabel, message: d.message ?? "Invalid value" });
        }
        summary = apiData?.message ?? "Server validation failed";
      }
      // Flat errors: { errors: { field: [...msgs] } }
      else if (apiData?.errors && typeof apiData.errors === "object") {
        for (const [field, msgs] of Object.entries(apiData.errors)) {
          const label = FIELD_LABELS[field] || field;
          const msg = Array.isArray(msgs) ? msgs.join(", ") : String(msgs);
          details.push({ field: label, message: msg });
        }
        summary = "Server validation failed";
      }
      // Simple message
      else if (apiData?.message) {
        summary = apiData.message;
        details.push({ field: "Server", message: apiData.message });
      }
      // Network error
      else if (!status) {
        summary = "Network error — check your connection";
        details.push({ field: "Network", message: "Could not reach the server. Please check your internet connection and try again." });
      }

      // Also parse suggestion if available
      const suggestion = apiData?.error?.suggestion;
      if (suggestion) {
        details.push({ field: "Suggestion", message: suggestion });
      }

      toast.error(`${summary}${details.length > 1 ? ` (${details.length} issues)` : ""}`, { duration: 4000 });

      setErrorModal({
        open: true,
        title: status ? `Server Error (${status})` : "Connection Error",
        summary,
        details,
        rawError: JSON.stringify({ status, data: apiData, message: (err as Error)?.message }, null, 2),
      });
      setShowErrorRaw(false);
      console.error("Quotation submit error:", err);
    }
  };

  // Fallback: keep submitRef pointing to latest submit handler in case DOM lookup fails
  submitRef.current = () => { void handleSubmit(onSubmit, onInvalid)(); };

  // Append new row and focus first input of the new row
  const appendNewRow = useCallback(() => {
    const nextIndex = fields.length;
    append({ productId: "", productName: "", quantity: undefined, unit: "PIECE", unitPrice: undefined, discountType: "PERCENTAGE", discountValue: null, gstRate: null, cessRate: null, isOptional: false, notes: "" });
    setTimeout(() => {
      const newRow = document.querySelector<HTMLElement>(`tr[data-row-index="${nextIndex}"]`);
      const input = newRow?.querySelector<HTMLElement>("input, [role='combobox'], [tabindex]");
      input?.focus();
    }, 50);
  }, [append, fields.length]);

  // Returns an onKeyDown handler for a given column cell.
  // Triggers new-row append when: Tab (no Shift), correct trigger column, and it's the last data row.
  const newRowTriggerColRef = useRef(newRowTriggerCol);
  newRowTriggerColRef.current = newRowTriggerCol;

  const makeTabHandler = useCallback(
    (colName: string, rowIndex: number, totalRows: number) =>
      (e: React.KeyboardEvent) => {
        if (e.key !== "Tab" || e.shiftKey) return;
        if (colName !== newRowTriggerColRef.current) return;
        if (rowIndex !== totalRows - 1) return;
        e.preventDefault();
        appendNewRow();
      },
    [appendNewRow],
  );

  // ── Loading state ─────────────────────────────────────────
  if (isEdit && isLoadingQuotation) return <LoadingSpinner fullPage />;

  const isPanel = mode === "panel";

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full" style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />

      <form
        id={isPanel ? formId : undefined}
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
        className="flex flex-col h-full"
      >
        {/* ── HEADER — fixed, no scroll ── */}
        <div ref={headerRef} className="flex-none px-3 pt-2 pb-1 border-b border-gray-200 bg-white">
          {!isPanel && (
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
                  <Icon name="arrow-left" size={16} />
                </button>
                <span className="text-sm font-semibold text-gray-700">
                  {isEdit ? "Edit Quotation" : "New Quotation"}
                </span>
                <span className="mx-2 text-gray-300">|</span>
                <span className="text-xs font-semibold uppercase text-gray-500 tracking-wide">Line Items</span>
              </div>
              <button
                type="button"
                onClick={handleOpenConfig}
                className="flex items-center gap-1 rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                title="Configure layout"
              >
                <Icon name="settings" size={12} />
                <span>Configure</span>
              </button>
            </div>
          )}
          <FormErrors errors={errors} fieldLabels={FIELD_LABELS} />
          <div className="grid grid-cols-4 gap-1.5">
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
          </div>
        </div>

        {/* ── GRID — scrollable, fills remaining height ── */}
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
                  const calc = calculateLineItem({
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

        {/* ── FOOTER — fixed, no scroll ── */}
        <div ref={footerRef} className="flex-none border-t border-gray-200 bg-white px-3 py-2">
          {/* Summary totals row */}
          <div className="flex items-start justify-between gap-4">
            {/* Global discount */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">Global Discount:</span>
              <Controller
                name="discountValue"
                control={control}
                render={({ field }) => (
                  <DiscountInput
                    value={field.value ?? null}
                    discountType={watchedDiscountType ?? "PERCENTAGE"}
                    onChange={field.onChange}
                    onTypeChange={(type) => setValue("discountType", type)}
                  />
                )}
              />
            </div>

            {/* Totals */}
            <div className="flex gap-6 text-sm">
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs text-gray-400">Subtotal</span>
                <span className="font-medium">{fmt(summary.subtotal)}</span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs text-gray-400">Discount</span>
                <span className="text-red-500">-{fmt(summary.discountAmount)}</span>
              </div>
              {!isInterState ? (
                <>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-xs text-gray-400">CGST</span>
                    <span>{fmt(summary.cgstTotal)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-xs text-gray-400">SGST</span>
                    <span>{fmt(summary.sgstTotal)}</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs text-gray-400">IGST</span>
                  <span>{fmt(summary.igstTotal)}</span>
                </div>
              )}
              {summary.cessTotal > 0 && (
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs text-gray-400">Cess</span>
                  <span>{fmt(summary.cessTotal)}</span>
                </div>
              )}
              <div className="flex flex-col items-end gap-0.5 border-l border-gray-200 pl-4">
                <span className="text-xs text-gray-400">Total</span>
                <Typography variant="heading" level={4}>{fmt(summary.totalAmount)}</Typography>
              </div>
            </div>
          </div>

          {/* Action buttons (page mode only) */}
          {!isPanel && (
            <div className="flex gap-2 mt-2">
              <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Update" : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          )}
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
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Controller
                name="validFrom"
                control={control}
                render={({ field }) => (
                  <SmartDateInput
                    label="Valid From"
                    value={field.value || null}
                    onChange={(v) => field.onChange(v ?? "")}
                  />
                )}
              />
              <Controller
                name="validUntil"
                control={control}
                render={({ field }) => (
                  <SmartDateInput
                    label="Valid Until"
                    value={field.value || null}
                    onChange={(v) => field.onChange(v ?? "")}
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

        {/* ── Error Detail Modal ── */}
        <Modal
          open={errorModal.open}
          onClose={() => setErrorModal((prev) => ({ ...prev, open: false }))}
          title={errorModal.title}
          size="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => {
                  const body = [
                    `Error: ${errorModal.title}`,
                    `Summary: ${errorModal.summary}`,
                    "",
                    "Details:",
                    ...errorModal.details.map((d) => `  - ${d.field}: ${d.message}`),
                    "",
                    errorModal.rawError ? `Raw:\n${errorModal.rawError}` : "",
                    "",
                    `URL: ${window.location.href}`,
                    `Time: ${new Date().toISOString()}`,
                  ].join("\n");
                  navigator.clipboard.writeText(body);
                  toast.success("Error details copied to clipboard");
                }}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Icon name="copy" size={14} />
                Copy for Report
              </button>
              <Button type="button" variant="primary" onClick={() => setErrorModal((prev) => ({ ...prev, open: false }))}>
                OK
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            {/* Summary */}
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
              <Icon name="alert-circle" size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700">{errorModal.summary}</p>
                <p className="text-xs text-red-500 mt-0.5">
                  Fix the issues below and try saving again.
                </p>
              </div>
            </div>

            {/* Field-level details */}
            {errorModal.details.length > 0 && (
              <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
                {errorModal.details.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-700">{d.field}</p>
                      <p className="text-xs text-gray-500">{d.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Raw error toggle (for technical details / reporting) */}
            {errorModal.rawError && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowErrorRaw((v) => !v)}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Icon name={showErrorRaw ? "chevron-down" : "chevron-right"} size={12} />
                  Technical Details
                </button>
                {showErrorRaw && (
                  <pre className="mt-1.5 rounded bg-gray-50 border border-gray-200 p-2 text-[11px] text-gray-600 overflow-x-auto max-h-40">
                    {errorModal.rawError}
                  </pre>
                )}
              </div>
            )}
          </div>
        </Modal>

        {/* ── Unsaved Changes Dialog ── */}
        <Modal
          open={showUnsavedDialog}
          onClose={() => setShowUnsavedDialog(false)}
          title=""
          size="sm"
        >
          <div className="text-center py-2">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <Icon name="alert-triangle" size={28} className="text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Unsaved Changes</h3>
            <p className="text-sm text-gray-500 mb-6">
              You have unsaved changes that will be lost.<br />
              Do you want to discard them?
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowUnsavedDialog(false)}
              >
                Keep Editing
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowUnsavedDialog(false);
                  isDirtyRef.current = false;
                  if (panelId) closePanel(panelId);
                  if (onCancel) onCancel();
                }}
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </Modal>

      </form>

    </div>
  );
}
