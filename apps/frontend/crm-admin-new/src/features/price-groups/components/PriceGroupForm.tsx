"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, NumberInput, Icon } from "@/components/ui";
import { useCreatePriceGroup, useUpdatePriceGroup, usePriceGroups } from "../hooks/usePriceGroups";
import type { CustomerPriceGroup } from "../types/price-groups.types";

// ── Schema ───────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  priceListId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Props ────────────────────────────────────────────────

interface PriceGroupFormProps {
  priceGroupId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Section wrapper ──────────────────────────────────────

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset style={{ border: "1px solid #d1d5db", borderRadius: 10, padding: "0 16px 16px", margin: 0 }}>
      <legend style={{ fontSize: 13, fontWeight: 600, color: "#374151", padding: "0 6px", marginLeft: 4 }}>
        {title}
      </legend>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
      </div>
    </fieldset>
  );
}

// ── Component ────────────────────────────────────────────

export function PriceGroupForm({ priceGroupId, mode = "page", panelId, onSuccess, onCancel }: PriceGroupFormProps) {
  const isEdit = !!priceGroupId;
  const formId = panelId ? `sp-form-priceGroup-${panelId.replace("priceGroup-", "")}` : "price-group-form";

  const { data: listData } = usePriceGroups({});
  const groups: CustomerPriceGroup[] = (listData?.data ?? listData ?? []) as CustomerPriceGroup[];
  const existing = Array.isArray(groups) ? groups.find((g) => g.id === priceGroupId) : undefined;

  const createMut = useCreatePriceGroup();
  const updateMut = useUpdatePriceGroup();

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: "",
      code: "",
      description: "",
      discountPercent: undefined,
      priceListId: "",
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        code: existing.code,
        description: existing.description ?? "",
        discountPercent: existing.discountPercent ?? undefined,
        priceListId: existing.priceListId ?? "",
      });
    }
  }, [existing, reset]);

  const onSubmit = (handleSubmit as any)(async (values: FormValues) => {
    const payload = {
      name: values.name,
      code: values.code,
      description: values.description || undefined,
      discountPercent: values.discountPercent,
      priceListId: values.priceListId || undefined,
    };

    if (isEdit && priceGroupId) {
      await updateMut.mutateAsync({ id: priceGroupId, dto: payload });
    } else {
      await createMut.mutateAsync(payload);
    }
    onSuccess?.();
  });

  return (
    <form id={formId} onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, padding: "16px 20px 8px" }}>
      <FormSection title="Group Information">
        <Input
          label="Name *"
          value={watch("name")}
          onChange={(v) => setValue("name", v)}
          leftIcon={<Icon name="tag" size={16} />}
          error={!!errors.name}
        />
        <Input
          label="Code *"
          value={watch("code")}
          onChange={(v) => setValue("code", v)}
          leftIcon={<Icon name="hash" size={16} />}
          error={!!errors.code}
        />
        <Input
          label="Description"
          value={watch("description") ?? ""}
          onChange={(v) => setValue("description", v)}
          leftIcon={<Icon name="file-text" size={16} />}
        />
      </FormSection>

      <FormSection title="Pricing">
        <NumberInput
          label="Discount %"
          value={watch("discountPercent") ?? null}
          onChange={(v) => setValue("discountPercent", v ?? undefined)}
          leftIcon={<Icon name="percent" size={16} />}
          error={!!errors.discountPercent}
        />
        <Input
          label="Price List ID"
          value={watch("priceListId") ?? ""}
          onChange={(v) => setValue("priceListId", v)}
          leftIcon={<Icon name="list" size={16} />}
        />
      </FormSection>

      <button type="submit" style={{ display: "none" }} aria-hidden="true" />
    </form>
  );
}
