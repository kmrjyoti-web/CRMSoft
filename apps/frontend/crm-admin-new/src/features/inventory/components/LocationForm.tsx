"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, SelectInput, Switch, Icon } from "@/components/ui";
import { AddressFields } from "@/components/common/AddressFields";
import { useCreateLocation, useUpdateLocation, useLocationList } from "../hooks/useInventory";
import type { StockLocation } from "../types/inventory.types";

// ── Schema ───────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  type: z.string().min(1, "Type is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

const LOCATION_TYPES = [
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "STORE", label: "Store" },
  { value: "SHOP", label: "Shop" },
  { value: "TRANSIT", label: "Transit" },
  { value: "VIRTUAL", label: "Virtual" },
];

// ── Props ────────────────────────────────────────────────

interface LocationFormProps {
  locationId?: string;
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

export function LocationForm({ locationId, mode = "page", panelId, onSuccess, onCancel }: LocationFormProps) {
  const isEdit = !!locationId;
  const formId = panelId ? `sp-form-location-${panelId.replace("location-", "")}` : "location-form";
  const [locStateCode, setLocStateCode] = useState("");

  const { data: listData } = useLocationList();
  const locations: StockLocation[] = (listData?.data ?? []) as StockLocation[];
  const existing = locations.find((l) => l.id === locationId);

  const createLoc = useCreateLocation();
  const updateLoc = useUpdateLocation();

  const {
    register,
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
      type: "WAREHOUSE",
      address: "",
      city: "",
      state: "",
      pincode: "",
      contactPerson: "",
      phone: "",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        code: existing.code,
        type: existing.type,
        address: existing.address ?? "",
        city: existing.city ?? "",
        state: existing.state ?? "",
        pincode: existing.pincode ?? "",
        contactPerson: existing.contactPerson ?? "",
        phone: existing.phone ?? "",
        isDefault: existing.isDefault,
      });
    }
  }, [existing, reset]);

  const onSubmit = (handleSubmit as any)(async (values: FormValues) => {
    const payload = {
      name: values.name,
      code: values.code,
      type: values.type,
      address: values.address || undefined,
      city: values.city || undefined,
      state: values.state || undefined,
      pincode: values.pincode || undefined,
      contactPerson: values.contactPerson || undefined,
      phone: values.phone || undefined,
      isDefault: values.isDefault,
    };

    if (isEdit && locationId) {
      await updateLoc.mutateAsync({ id: locationId, payload });
    } else {
      await createLoc.mutateAsync(payload);
    }
    onSuccess?.();
  });

  const isPending = createLoc.isPending || updateLoc.isPending;

  return (
    <form id={formId} onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, padding: "16px 20px 8px" }}>
      <FormSection title="Basic Information">
        <Input
          label="Location Name *"
          value={watch("name")}
          onChange={(v) => setValue("name", v)}
          leftIcon={<Icon name="building" size={16} />}
          error={!!errors.name}
        />
        <Input
          label="Code *"
          value={watch("code")}
          onChange={(v) => setValue("code", v)}
          leftIcon={<Icon name="hash" size={16} />}
          error={!!errors.code}
        />
        <SelectInput
          label="Type *"
          value={watch("type")}
          onChange={(v) => setValue("type", String(v ?? "WAREHOUSE"))}
          options={LOCATION_TYPES}
          leftIcon={<Icon name="layers" size={16} />}
          error={!!errors.type}
        />
      </FormSection>

      <FormSection title="Address">
        <Input
          label="Address"
          value={watch("address") ?? ""}
          onChange={(v) => setValue("address", v)}
          leftIcon={<Icon name="map-pin" size={16} />}
        />
        <AddressFields
          stateCode={locStateCode}
          city={String(watch("city") ?? "")}
          pincode={String(watch("pincode") ?? "")}
          showCountry={false}
          columns={2}
          onChange={(patch) => {
            if (patch.stateCode !== undefined) setLocStateCode(patch.stateCode);
            if (patch.state !== undefined) setValue("state", patch.state);
            if (patch.city !== undefined) setValue("city", patch.city);
            if (patch.pincode !== undefined) setValue("pincode", patch.pincode);
          }}
        />
      </FormSection>

      <FormSection title="Contact">
        <Input
          label="Contact Person"
          value={watch("contactPerson") ?? ""}
          onChange={(v) => setValue("contactPerson", v)}
          leftIcon={<Icon name="user" size={16} />}
        />
        <Input
          label="Phone"
          value={watch("phone") ?? ""}
          onChange={(v) => setValue("phone", v)}
          leftIcon={<Icon name="phone" size={16} />}
        />
      </FormSection>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
        <Switch
          checked={watch("isDefault") ?? false}
          onChange={(v: boolean) => setValue("isDefault", v)}
        />
        <span style={{ fontSize: 14, color: "#374151" }}>Set as Default Location</span>
      </div>

      <button type="submit" style={{ display: "none" }} aria-hidden="true" />
    </form>
  );
}
