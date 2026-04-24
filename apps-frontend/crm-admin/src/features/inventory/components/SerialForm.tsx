"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon, Button, Card, Input, SelectInput } from "@/components/ui";
import { ProductSelect } from "@/components/common/ProductSelect";
import type { ProductSelectOption } from "@/components/common/ProductSelect";
import { useSidePanelStore } from "@/stores/side-panel.store";
import { useProductDetail } from "@/features/products/hooks/useProducts";
import { useCreateSerial, useUpdateSerial, useSerialDetail } from "../hooks/useInventory";

const EXPIRY_TYPE_OPTIONS = [
  { value: "NEVER", label: "Never Expires" },
  { value: "FIXED_DATE", label: "Fixed Date" },
  { value: "DAYS", label: "Days" },
  { value: "MONTHS", label: "Months" },
  { value: "YEARS", label: "Years" },
];

interface SerialFormProps {
  serialId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SerialForm({ serialId, mode = "page", panelId, onSuccess, onCancel }: SerialFormProps) {
  const router = useRouter();
  const isEdit = !!serialId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const createSerial = useCreateSerial();
  const updateSerial = useUpdateSerial();
  const { data: serialData } = useSerialDetail(serialId ?? "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    serialNo: "",
    code1: "",
    code2: "",
    batchNo: "",
    expiryType: "NEVER",
    expiryValue: "",
    expiryDate: "",
    mrp: "",
    purchaseRate: "",
    saleRate: "",
    costPrice: "",
    hsnCode: "",
    locationId: "",
  });

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !serialData) return;
    const s = (serialData as any)?.data ?? serialData;
    setForm({
      productId: s.productId ?? "",
      serialNo: s.serialNo ?? "",
      code1: s.code1 ?? "",
      code2: s.code2 ?? "",
      batchNo: s.batchNo ?? "",
      expiryType: s.expiryType ?? "NEVER",
      expiryValue: s.expiryValue != null ? String(s.expiryValue) : "",
      expiryDate: s.expiryDate ?? "",
      mrp: s.mrp != null ? String(s.mrp) : "",
      purchaseRate: s.purchaseRate != null ? String(s.purchaseRate) : "",
      saleRate: s.saleRate != null ? String(s.saleRate) : "",
      costPrice: s.costPrice != null ? String(s.costPrice) : "",
      hsnCode: s.hsnCode ?? "",
      locationId: s.locationId ?? "",
    });
  }, [isEdit, serialData]);

  // Fetch full product detail for purchasePrice + costPrice
  const { data: productDetail } = useProductDetail(form.productId);

  useEffect(() => {
    if (!productDetail) return;
    const p = productDetail as any;
    setForm((prev) => ({
      ...prev,
      hsnCode: p.hsnCode ?? prev.hsnCode,
      mrp: p.mrp != null ? String(p.mrp) : prev.mrp,
      saleRate: p.salePrice != null ? String(p.salePrice) : prev.saleRate,
      purchaseRate: p.purchasePrice != null ? String(p.purchasePrice) : prev.purchaseRate,
      costPrice: p.costPrice != null ? String(p.costPrice) : prev.costPrice,
    }));
  }, [productDetail]);

  // Sync isSubmitting → panel footer button
  const formId = `sp-form-serial-${serialId ?? "new"}`;
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
            ? isEdit ? "Updating..." : "Saving..."
            : isEdit ? "Save Changes" : "Create Serial",
          icon: "check",
          showAs: "both",
          variant: "primary",
          loading: isSubmitting,
          disabled: isSubmitting,
          onClick: () => {
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, serialId, formId, updatePanelConfig]);

  function handleProductSelect(product: ProductSelectOption | null) {
    if (!product) {
      setForm((prev) => ({
        ...prev,
        productId: "",
        hsnCode: "",
        mrp: "",
        saleRate: "",
        purchaseRate: "",
        costPrice: "",
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      productId: product.id,
      hsnCode: product.hsnCode ?? prev.hsnCode,
      mrp: product.mrp != null ? String(product.mrp) : prev.mrp,
      saleRate: product.salePrice != null ? String(product.salePrice) : prev.saleRate,
      purchaseRate: product.purchasePrice != null ? String(product.purchasePrice) : prev.purchaseRate,
      costPrice: product.costPrice != null ? String(product.costPrice) : prev.costPrice,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productId || !form.serialNo) return;

    setIsSubmitting(true);
    try {
      const payload = {
        productId: form.productId,
        serialNo: form.serialNo,
        code1: form.code1 || undefined,
        code2: form.code2 || undefined,
        batchNo: form.batchNo || undefined,
        expiryType: form.expiryType,
        expiryValue: form.expiryValue ? parseInt(form.expiryValue) : undefined,
        expiryDate: form.expiryDate || undefined,
        mrp: form.mrp ? parseFloat(form.mrp) : undefined,
        purchaseRate: form.purchaseRate ? parseFloat(form.purchaseRate) : undefined,
        saleRate: form.saleRate ? parseFloat(form.saleRate) : undefined,
        costPrice: form.costPrice ? parseFloat(form.costPrice) : undefined,
        hsnCode: form.hsnCode || undefined,
        locationId: form.locationId || undefined,
      };

      if (isEdit && serialId) {
        await updateSerial.mutateAsync({ id: serialId, payload });
      } else {
        await createSerial.mutateAsync(payload);
      }

      if (mode === "panel" && onSuccess) {
        onSuccess();
      } else {
        router.push("/inventory/serials");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const pricingAutoFilled = !!form.productId;

  const formBody = (
    <form id={formId} onSubmit={handleSubmit}>
      <Card>
        <div className="p-4">
          <h6 className="mb-3" style={{ fontWeight: 600 }}>Basic Info</h6>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <ProductSelect
              value={form.productId}
              onChange={(v) => { if (!v) handleProductSelect(null); }}
              onProductSelect={handleProductSelect}
              label="Product"
            />
            <Input
              label="Serial Number"
              value={form.serialNo}
              onChange={(v) => set("serialNo", v)}
              leftIcon={<Icon name="hash" size={16} />}
            />
            <Input
              label="Code 1 (Activation Key)"
              value={form.code1}
              onChange={(v) => set("code1", v)}
              leftIcon={<Icon name="key" size={16} />}
            />
            <Input
              label="Code 2 (License ID)"
              value={form.code2}
              onChange={(v) => set("code2", v)}
              leftIcon={<Icon name="key" size={16} />}
            />
            <Input
              label="Batch No"
              value={form.batchNo}
              onChange={(v) => set("batchNo", v)}
              leftIcon={<Icon name="layers" size={16} />}
            />
            <Input
              label="HSN Code"
              value={form.hsnCode}
              onChange={(v) => set("hsnCode", v)}
              leftIcon={<Icon name="file-text" size={16} />}
            />
          </div>
        </div>
      </Card>

      <Card className="mt-3">
        <div className="p-4">
          <h6 className="mb-3" style={{ fontWeight: 600 }}>Expiry</h6>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <SelectInput
              label="Expiry Type"
              value={form.expiryType}
              options={EXPIRY_TYPE_OPTIONS}
              onChange={(v) => set("expiryType", String(v ?? "NEVER"))}
            />
            {form.expiryType === "FIXED_DATE" && (
              <Input
                label="Expiry Date"
                value={form.expiryDate}
                onChange={(v) => set("expiryDate", v)}
                leftIcon={<Icon name="calendar" size={16} />}
              />
            )}
            {["DAYS", "MONTHS", "YEARS"].includes(form.expiryType) && (
              <Input
                label={`Value (${form.expiryType.toLowerCase()})`}
                value={form.expiryValue}
                onChange={(v) => set("expiryValue", v)}
                leftIcon={<Icon name="clock" size={16} />}
              />
            )}
          </div>
        </div>
      </Card>

      <Card className="mt-3">
        <div className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="mb-0" style={{ fontWeight: 600 }}>Pricing</h6>
            {pricingAutoFilled && (
              <span style={{ fontSize: 12, color: "var(--cui-success)" }}>
                <Icon name="check-circle" size={13} /> Auto-filled from product master
              </span>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
            <Input
              label="MRP"
              value={form.mrp}
              onChange={(v) => set("mrp", v)}
              leftIcon={<Icon name="indian-rupee" size={16} />}
            />
            <Input
              label="Purchase Rate"
              value={form.purchaseRate}
              onChange={(v) => set("purchaseRate", v)}
              leftIcon={<Icon name="indian-rupee" size={16} />}
            />
            <Input
              label="Sale Rate"
              value={form.saleRate}
              onChange={(v) => set("saleRate", v)}
              leftIcon={<Icon name="indian-rupee" size={16} />}
            />
            <Input
              label="Cost Price"
              value={form.costPrice}
              onChange={(v) => set("costPrice", v)}
              leftIcon={<Icon name="indian-rupee" size={16} />}
            />
          </div>
        </div>
      </Card>

      {mode === "page" && (
        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button variant="outline" type="button" onClick={() => onCancel ? onCancel() : router.back()}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEdit ? "Updating..." : "Creating..."
              : isEdit ? "Save Changes" : "Create Serial"}
          </Button>
        </div>
      )}
    </form>
  );

  if (mode === "panel") return <div className="p-4">{formBody}</div>;

  return (
    <div className="p-6">
      <div className="d-flex align-items-center gap-2 mb-4">
        <Button variant="ghost" type="button" onClick={() => router.back()}>
          <Icon name="arrow-left" size={18} />
        </Button>
        <h4 className="mb-0" style={{ fontWeight: 600 }}>
          {isEdit ? "Edit Serial Number" : "Add Serial Number"}
        </h4>
      </div>
      {formBody}
    </div>
  );
}
