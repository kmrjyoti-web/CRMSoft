"use client";

import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { Icon, Input, Switch } from "@/components/ui";
import { AddressFields } from "@/components/common/AddressFields";
import { useCreateManufacturer, useUpdateManufacturer, useManufacturers } from "../hooks/useManufacturers";
import type { Manufacturer } from "../types/manufacturers.types";

// ── Props ────────────────────────────────────────────────

interface ManufacturerFormProps {
  manufacturerId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  manufacturer?: Manufacturer;
  open?: boolean;
  onClose?: () => void;
}

// ── Section wrapper ──────────────────────────────────────

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset style={{
      border: "1px solid #d1d5db",
      borderRadius: 10,
      padding: "0 16px 16px",
      margin: 0,
    }}>
      <legend style={{
        fontSize: 13,
        fontWeight: 600,
        color: "#374151",
        padding: "0 6px",
        marginLeft: 4,
      }}>
        {title}
      </legend>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
      </div>
    </fieldset>
  );
}

// ── Component ────────────────────────────────────────────

export function ManufacturerForm({ manufacturerId, mode = "page", panelId, onSuccess, onCancel, manufacturer: mfrProp, open, onClose }: ManufacturerFormProps) {
  const isEdit = !!(manufacturerId || mfrProp);
  const formId = panelId ? `sp-form-manufacturer-${panelId.replace("manufacturer-", "")}` : "manufacturer-form";

  const createMut = useCreateManufacturer();
  const updateMut = useUpdateManufacturer();

  const { data: listData } = useManufacturers({});
  const manufacturers: Manufacturer[] = (() => {
    const raw = listData?.data;
    if (Array.isArray(raw)) return raw;
    return (raw as any)?.data ?? [];
  })();
  const existing = manufacturerId ? manufacturers.find((m) => m.id === manufacturerId) : mfrProp;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("IN");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (existing) {
      setName(existing.name ?? "");
      setCode(existing.code ?? "");
      setDescription(existing.description ?? "");
      setWebsite(existing.website ?? "");
      setCountry(existing.country ?? "");
      setCountryCode((existing as any).countryCode ?? "IN");
      setIsActive(existing.isActive ?? true);
    } else if (!isEdit) {
      setName(""); setCode(""); setDescription(""); setWebsite(""); setCountry(""); setCountryCode("IN"); setIsActive(true);
    }
  }, [existing, isEdit]);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value.toUpperCase());
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!code.trim()) { toast.error("Code is required"); return; }

    const payload = {
      name: name.trim(),
      code: code.trim(),
      description: description.trim() || undefined,
      website: website.trim() || undefined,
      country: country.trim() || undefined,
      countryCode: countryCode || undefined,
      isActive,
    };

    try {
      const id = manufacturerId ?? mfrProp?.id;
      if (isEdit && id) {
        await updateMut.mutateAsync({ id, dto: payload });
        toast.success("Manufacturer updated successfully");
      } else {
        await createMut.mutateAsync(payload);
        toast.success("Manufacturer created successfully");
      }
      onSuccess?.();
      onClose?.();
    } catch {
      toast.error(isEdit ? "Failed to update manufacturer" : "Failed to create manufacturer");
    }
  }, [name, code, description, website, country, countryCode, isActive, isEdit, manufacturerId, mfrProp, createMut, updateMut, onSuccess, onClose]);

  return (
    <form id={formId} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, padding: "16px 20px 8px" }}>
      <FormSection title="Manufacturer Information">
        <Input
          label="Name *"
          value={name}
          onChange={setName}
          leftIcon={<Icon name="factory" size={16} />}
        />
        <Input
          label="Code *"
          value={code}
          onChange={handleCodeChange}
          leftIcon={<Icon name="hash" size={16} />}
        />
        <Input
          label="Description"
          value={description}
          onChange={setDescription}
          leftIcon={<Icon name="file-text" size={16} />}
        />
      </FormSection>

      <FormSection title="Contact & Location">
        <Input
          label="Website"
          value={website}
          onChange={setWebsite}
          leftIcon={<Icon name="globe" size={16} />}
        />
        <AddressFields
          countryCode={countryCode}
          showCountry={true}
          columns={2}
          onChange={(patch) => {
            if (patch.countryCode !== undefined) setCountryCode(patch.countryCode);
            if (patch.country !== undefined) setCountry(patch.country);
          }}
        />
      </FormSection>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
        <Switch checked={isActive} onChange={(v: boolean) => setIsActive(v)} />
        <span style={{ fontSize: 14, color: "#374151" }}>Active</span>
      </div>

      <button type="submit" style={{ display: "none" }} aria-hidden="true" />
    </form>
  );
}
