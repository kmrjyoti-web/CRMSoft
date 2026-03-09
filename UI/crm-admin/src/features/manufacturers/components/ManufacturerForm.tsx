"use client";

import { useState, useCallback, useEffect } from "react";

import toast from "react-hot-toast";

import { Modal, Button, Icon, Input, Switch } from "@/components/ui";

import {
  useCreateManufacturer,
  useUpdateManufacturer,
} from "../hooks/useManufacturers";

import type { Manufacturer } from "../types/manufacturers.types";

// ── Props ────────────────────────────────────────────────

interface ManufacturerFormProps {
  manufacturer?: Manufacturer;
  open: boolean;
  onClose: () => void;
}

// ── Component ────────────────────────────────────────────

export function ManufacturerForm({
  manufacturer,
  open,
  onClose,
}: ManufacturerFormProps) {
  const isEdit = !!manufacturer;
  const createMut = useCreateManufacturer();
  const updateMut = useUpdateManufacturer();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Sync form when manufacturer changes or modal opens
  useEffect(() => {
    if (open) {
      setName(manufacturer?.name ?? "");
      setCode(manufacturer?.code ?? "");
      setDescription(manufacturer?.description ?? "");
      setWebsite(manufacturer?.website ?? "");
      setCountry(manufacturer?.country ?? "");
      setIsActive(manufacturer?.isActive ?? true);
    }
  }, [manufacturer, open]);

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
      country: country.trim() || undefined,
      isActive,
    };

    try {
      if (isEdit && manufacturer) {
        await updateMut.mutateAsync({ id: manufacturer.id, dto: payload });
        toast.success("Manufacturer updated successfully");
      } else {
        await createMut.mutateAsync(payload);
        toast.success("Manufacturer created successfully");
      }
      onClose();
    } catch {
      toast.error(
        isEdit
          ? "Failed to update manufacturer"
          : "Failed to create manufacturer"
      );
    }
  }, [
    name,
    code,
    description,
    website,
    country,
    isActive,
    isEdit,
    manufacturer,
    createMut,
    updateMut,
    onClose,
  ]);

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Manufacturer" : "New Manufacturer"}
    >
      <div
        style={{ display: "flex", flexDirection: "column", gap: 16, padding: 8 }}
      >
        <Input
          label="Name"
          value={name}
          onChange={setName}
          required
          leftIcon={<Icon name="factory" size={16} />}
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

        <Input
          label="Country"
          value={country}
          onChange={setCountry}
          leftIcon={<Icon name="map-pin" size={16} />}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Switch
            checked={isActive}
            onChange={() => setIsActive(!isActive)}
            label="Active"
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 8,
          }}
        >
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
