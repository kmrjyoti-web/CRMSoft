"use client";

import { useState, useCallback, useEffect } from "react";

import toast from "react-hot-toast";

import { Modal, Button, Icon, Input, Switch } from "@/components/ui";

import { useCreateBrand, useUpdateBrand } from "../hooks/useBrands";

import type { Brand } from "../types/brands.types";

// ── Props ────────────────────────────────────────────────

interface BrandFormProps {
  brand?: Brand;
  open: boolean;
  onClose: () => void;
}

// ── Component ────────────────────────────────────────────

export function BrandForm({ brand, open, onClose }: BrandFormProps) {
  const isEdit = !!brand;
  const createMut = useCreateBrand();
  const updateMut = useUpdateBrand();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Sync form when brand changes or modal opens
  useEffect(() => {
    if (open) {
      setName(brand?.name ?? "");
      setCode(brand?.code ?? "");
      setDescription(brand?.description ?? "");
      setWebsite(brand?.website ?? "");
      setIsActive(brand?.isActive ?? true);
    }
  }, [brand, open]);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value.toUpperCase());
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!code.trim()) {
      toast.error("Code is required");
      return;
    }

    const payload = {
      name: name.trim(),
      code: code.trim(),
      description: description.trim() || undefined,
      website: website.trim() || undefined,
      isActive,
    };

    try {
      if (isEdit && brand) {
        await updateMut.mutateAsync({ id: brand.id, dto: payload });
        toast.success("Brand updated successfully");
      } else {
        await createMut.mutateAsync(payload);
        toast.success("Brand created successfully");
      }
      onClose();
    } catch {
      toast.error(isEdit ? "Failed to update brand" : "Failed to create brand");
    }
  }, [name, code, description, website, isActive, isEdit, brand, createMut, updateMut, onClose]);

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Brand" : "New Brand"}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 8 }}>
        <Input
          label="Name"
          value={name}
          onChange={setName}
          required
          leftIcon={<Icon name="tag" size={16} />}
        />

        <Input
          label="Code"
          value={code}
          onChange={handleCodeChange}
          required
          leftIcon={<Icon name="hash" size={16} />}
        />

        <Input
          label="Description"
          value={description}
          onChange={setDescription}
          leftIcon={<Icon name="file-text" size={16} />}
        />

        <Input
          label="Website"
          value={website}
          onChange={setWebsite}
          leftIcon={<Icon name="globe" size={16} />}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Switch
            checked={isActive}
            onChange={() => setIsActive(!isActive)}
            label="Active"
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isPending}>
            <Icon name="check" size={16} />
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
