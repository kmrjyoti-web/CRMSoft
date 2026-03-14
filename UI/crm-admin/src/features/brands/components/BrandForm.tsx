"use client";

import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { Icon, Input, Switch } from "@/components/ui";
import { useCreateBrand, useUpdateBrand, useBrands } from "../hooks/useBrands";
import type { Brand } from "../types/brands.types";

// ── Props ────────────────────────────────────────────────

interface BrandFormProps {
  brandId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  brand?: Brand;
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

export function BrandForm({ brandId, mode = "page", panelId, onSuccess, onCancel, brand: brandProp, open, onClose }: BrandFormProps) {
  const isEdit = !!(brandId || brandProp);
  const formId = panelId ? `sp-form-brand-${panelId.replace("brand-", "")}` : "brand-form";

  const createMut = useCreateBrand();
  const updateMut = useUpdateBrand();

  const { data: listData } = useBrands({});
  const brands: Brand[] = (() => {
    const raw = listData?.data;
    if (Array.isArray(raw)) return raw;
    return (raw as any)?.data ?? [];
  })();
  const existing = brandId ? brands.find((b) => b.id === brandId) : brandProp;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (existing) {
      setName(existing.name ?? "");
      setCode(existing.code ?? "");
      setDescription(existing.description ?? "");
      setWebsite(existing.website ?? "");
      setIsActive(existing.isActive ?? true);
    } else if (!isEdit) {
      setName(""); setCode(""); setDescription(""); setWebsite(""); setIsActive(true);
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
      isActive,
    };

    try {
      const id = brandId ?? brandProp?.id;
      if (isEdit && id) {
        await updateMut.mutateAsync({ id, dto: payload });
        toast.success("Brand updated successfully");
      } else {
        await createMut.mutateAsync(payload);
        toast.success("Brand created successfully");
      }
      onSuccess?.();
      onClose?.();
    } catch {
      toast.error(isEdit ? "Failed to update brand" : "Failed to create brand");
    }
  }, [name, code, description, website, isActive, isEdit, brandId, brandProp, createMut, updateMut, onSuccess, onClose]);

  return (
    <form id={formId} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, padding: "16px 20px 8px" }}>
      <FormSection title="Brand Information">
        <Input
          label="Name *"
          value={name}
          onChange={setName}
          leftIcon={<Icon name="tag" size={16} />}
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

      <FormSection title="Contact & Web">
        <Input
          label="Website"
          value={website}
          onChange={setWebsite}
          leftIcon={<Icon name="globe" size={16} />}
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
