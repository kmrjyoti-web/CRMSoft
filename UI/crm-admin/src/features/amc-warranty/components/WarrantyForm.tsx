"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Input,
  SelectInput,
  DatePicker,
  Button,
  Icon,
  TextareaInput,
} from "@/components/ui";
import {
  useCreateWarrantyRecord,
  useUpdateWarrantyRecord,
  useWarrantyRecord,
  useWarrantyTemplates,
} from "../hooks/useAmcWarranty";
import type { WarrantyRecord } from "../types/amc-warranty.types";

const schema = z.object({
  warrantyTemplateId: z.string().min(1, "Template is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  customerType: z.string().min(1, "Customer type is required"),
  productId: z.string().min(1, "Product is required"),
  serialMasterId: z.string().optional(),
  invoiceId: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface WarrantyFormProps {
  warrantyId?: string;
  /** "panel" = embedded in side panel; "page" = full page */
  mode?: "panel" | "page";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function WarrantyForm({
  warrantyId,
  mode = "page",
  panelId,
  onSuccess,
  onCancel,
}: WarrantyFormProps) {
  const router = useRouter();
  const isEdit = !!warrantyId;
  const isPanel = mode === "panel";

  const { data: existingData } = useWarrantyRecord(warrantyId ?? "");
  const existing = existingData?.data as WarrantyRecord | undefined;

  const { data: templatesData } = useWarrantyTemplates({ limit: 100 });
  const templates = Array.isArray(templatesData?.data)
    ? (templatesData!.data as any[])
    : ((templatesData?.data as any)?.data ?? []);

  const templateOptions = templates.map((t: any) => ({
    label: `${t.name} (${t.durationValue} ${t.durationType.toLowerCase()})`,
    value: t.id,
  }));

  const createMutation = useCreateWarrantyRecord();
  const updateMutation = useUpdateWarrantyRecord();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // useEntityPanel sets formId = `sp-form-${entityKey}-${id}` for edit, `sp-form-${entityKey}-new` for create
  const formId = panelId
    ? `sp-form-warranty-${warrantyId ?? "new"}`
    : "warranty-form-page";

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      warrantyTemplateId: "",
      customerId: "",
      customerType: "CONTACT",
      productId: "",
      serialMasterId: "",
      invoiceId: "",
      startDate: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        warrantyTemplateId: existing.warrantyTemplateId,
        customerId: existing.customerId,
        customerType: existing.customerType,
        productId: existing.productId,
        serialMasterId: existing.serialMasterId ?? "",
        invoiceId: existing.invoiceId ?? "",
        startDate: existing.startDate?.slice(0, 10) ?? "",
        notes: existing.notes ?? "",
      });
    }
  }, [existing, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const dto = {
        ...values,
        serialMasterId: values.serialMasterId || undefined,
        invoiceId: values.invoiceId || undefined,
        notes: values.notes || undefined,
      };
      if (isEdit) {
        await updateMutation.mutateAsync({ id: warrantyId!, dto });
      } else {
        await createMutation.mutateAsync(dto);
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/post-sales/warranty");
      }
    } catch {
      // error handled by mutation
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/post-sales/warranty");
    }
  };

  const customerTypeOptions = [
    { label: "Contact", value: "CONTACT" },
    { label: "Organization", value: "ORGANIZATION" },
  ];

  const formContent = (
    <form id={formId} onSubmit={handleSubmit(onSubmit as any)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Warranty Template */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
          padding: isPanel ? 16 : 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Warranty Template
          </div>
          <SelectInput
            label="Warranty Template"
            required
            leftIcon={<Icon name="shield-check" size={16} />}
            options={templateOptions}
            value={watch("warrantyTemplateId")}
            onChange={(v) => setValue("warrantyTemplateId", String(v ?? ""))}
            error={errors.warrantyTemplateId?.message}
          />
        </div>

        {/* Customer & Product */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
          padding: isPanel ? 16 : 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Customer &amp; Product
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <SelectInput
              label="Customer Type"
              required
              leftIcon={<Icon name="user" size={16} />}
              options={customerTypeOptions}
              value={watch("customerType")}
              onChange={(v) => setValue("customerType", String(v ?? "CONTACT"))}
              error={errors.customerType?.message}
            />
            <Input
              label="Customer ID"
              required
              leftIcon={<Icon name="user-check" size={16} />}
              value={watch("customerId")}
              onChange={(v: string) => setValue("customerId", v)}
              error={errors.customerId?.message}
            />
            <Input
              label="Product ID"
              required
              leftIcon={<Icon name="package" size={16} />}
              value={watch("productId")}
              onChange={(v: string) => setValue("productId", v)}
              error={errors.productId?.message}
            />
            <Input
              label="Serial / Key (optional)"
              leftIcon={<Icon name="hash" size={16} />}
              value={watch("serialMasterId") ?? ""}
              onChange={(v: string) => setValue("serialMasterId", v)}
            />
          </div>
        </div>

        {/* Dates & Reference */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
          padding: isPanel ? 16 : 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Dates &amp; Reference
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <DatePicker
              label="Start Date"
              required
              value={watch("startDate")}
              onChange={(v) => setValue("startDate", v ? String(v).slice(0, 10) : "")}
              error={errors.startDate?.message}
            />
            <Input
              label="Invoice ID (optional)"
              leftIcon={<Icon name="receipt" size={16} />}
              value={watch("invoiceId") ?? ""}
              onChange={(v: string) => setValue("invoiceId", v)}
            />
          </div>
        </div>

        {/* Notes */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
          padding: isPanel ? 16 : 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Notes
          </div>
          <TextareaInput
            label="Notes"
            value={watch("notes") ?? ""}
            onChange={(e) => setValue("notes", e.target.value)}
            rows={3}
          />
        </div>

        {/* Actions — only shown in page mode */}
        {!isPanel && (
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? (
                <><Icon name="loader" size={14} /> Saving...</>
              ) : (
                <><Icon name="save" size={14} /> {isEdit ? "Update" : "Create"} Warranty</>
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  );

  if (isPanel) return formContent;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button
          type="button"
          onClick={handleCancel}
          style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b", padding: 4, borderRadius: 6 }}
        >
          <Icon name="arrow-left" size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            {isEdit ? "Edit Warranty Record" : "Create Warranty Record"}
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>
            {isEdit ? "Update warranty details" : "Register a new product warranty"}
          </p>
        </div>
      </div>
      {formContent}
    </div>
  );
}
