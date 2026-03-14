"use client";

import { useEffect, useMemo, useState } from "react";

import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button, Card, Input, SelectInput, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { AddressFields } from "@/components/common/AddressFields";

import {
  useCreateLocation,
  useUpdateLocation,
  useBusinessLocations,
} from "../hooks/useBusinessLocations";
import type { BusinessLocation, CreateLocationDto, LocationType } from "../types/business-locations.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOCATION_TYPE_OPTIONS: { label: string; value: LocationType }[] = [
  { label: "Head Office", value: "HEAD_OFFICE" },
  { label: "Branch", value: "BRANCH" },
  { label: "Warehouse", value: "WAREHOUSE" },
  { label: "Factory", value: "FACTORY" },
  { label: "Store", value: "STORE" },
  { label: "Other", value: "OTHER" },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LocationFormProps {
  location?: BusinessLocation;
  parentId?: string;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LocationForm({ location, parentId, onClose }: LocationFormProps) {
  const isEdit = !!location;
  const createMut = useCreateLocation();
  const updateMut = useUpdateLocation();
  const saving = createMut.isPending || updateMut.isPending;
  const [locCountryCode, setLocCountryCode] = useState("IN");
  const [locStateCode, setLocStateCode] = useState("");

  const { data: locationsData } = useBusinessLocations();
  const parentOptions = useMemo(() => {
    const raw = locationsData?.data ?? locationsData ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list
      .filter((l: BusinessLocation) => l.id !== location?.id)
      .map((l: BusinessLocation) => ({ label: `${l.name} (${l.code})`, value: l.id }));
  }, [locationsData, location]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateLocationDto>({
    defaultValues: {
      name: location?.name ?? "",
      code: location?.code ?? "",
      type: location?.type ?? "BRANCH",
      addressLine1: location?.addressLine1 ?? "",
      addressLine2: location?.addressLine2 ?? "",
      city: location?.city ?? "",
      state: location?.state ?? "",
      country: location?.country ?? "",
      postalCode: location?.postalCode ?? "",
      phone: location?.phone ?? "",
      email: location?.email ?? "",
      parentId: location?.parentId ?? parentId ?? "",
      gstNumber: location?.gstNumber ?? "",
    },
  });

  useEffect(() => {
    if (location) {
      reset({
        name: location.name,
        code: location.code,
        type: location.type,
        addressLine1: location.addressLine1,
        addressLine2: location.addressLine2 ?? "",
        city: location.city,
        state: location.state,
        country: location.country,
        postalCode: location.postalCode,
        phone: location.phone ?? "",
        email: location.email ?? "",
        parentId: location.parentId ?? "",
        gstNumber: location.gstNumber ?? "",
      });
    }
  }, [location, reset]);

  const selectedType = watch("type");

  function onSubmit(values: CreateLocationDto) {
    // Clean empty strings
    const dto: CreateLocationDto = {
      ...values,
      parentId: values.parentId || undefined,
      addressLine2: values.addressLine2 || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      gstNumber: values.gstNumber || undefined,
    };

    if (isEdit && location) {
      updateMut.mutate(
        { id: location.id, dto },
        {
          onSuccess: () => {
            toast.success("Location updated");
            onClose();
          },
          onError: () => toast.error("Failed to update location"),
        }
      );
    } else {
      createMut.mutate(dto, {
        onSuccess: () => {
          toast.success("Location created");
          onClose();
        },
        onError: () => toast.error("Failed to create location"),
      });
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "700px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
          {isEdit ? "Edit Location" : "Add Location"}
        </h2>
        <Button variant="ghost" onClick={onClose}>
          <Icon name="x" size={16} />
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit as any)} style={{ padding: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Row: Name + Code */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <Input
                  label="Name"
                  leftIcon={<Icon name="building-2" size={16} />}
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.name.message}</p>
                )}
              </div>
              <div>
                <Input
                  label="Code"
                  leftIcon={<Icon name="hash" size={16} />}
                  {...register("code", { required: "Code is required" })}
                />
                {errors.code && (
                  <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.code.message}</p>
                )}
              </div>
            </div>

            {/* Type */}
            <SelectInput
              label="Type"
              leftIcon={<Icon name="layers" size={16} />}
              value={selectedType}
              onChange={(v) => setValue("type", v as LocationType)}
              options={LOCATION_TYPE_OPTIONS}
            />

            {/* Parent Location */}
            <SelectInput
              label="Parent Location (optional)"
              leftIcon={<Icon name="git-branch" size={16} />}
              value={watch("parentId") ?? ""}
              onChange={(v) => setValue("parentId", (v as string) || undefined)}
              options={[{ label: "-- None --", value: "" }, ...parentOptions]}
            />

            {/* Address */}
            <Input
              label="Address Line 1"
              leftIcon={<Icon name="map-pin" size={16} />}
              {...register("addressLine1", { required: "Address is required" })}
            />
            {errors.addressLine1 && (
              <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.addressLine1.message}</p>
            )}

            <Input
              label="Address Line 2"
              leftIcon={<Icon name="map" size={16} />}
              {...register("addressLine2")}
            />

            {/* City / State / Country / Postal */}
            <AddressFields
              countryCode={locCountryCode}
              stateCode={locStateCode}
              city={String(watch("city") ?? "")}
              pincode={String(watch("postalCode") ?? "")}
              columns={2}
              onChange={(patch) => {
                if (patch.countryCode !== undefined) setLocCountryCode(patch.countryCode);
                if (patch.country !== undefined) setValue("country", patch.country);
                if (patch.stateCode !== undefined) setLocStateCode(patch.stateCode);
                if (patch.state !== undefined) setValue("state", patch.state);
                if (patch.city !== undefined) setValue("city", patch.city);
                if (patch.pincode !== undefined) setValue("postalCode", patch.pincode);
              }}
            />

            {/* Phone / Email */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Input
                label="Phone"
                leftIcon={<Icon name="phone" size={16} />}
                {...register("phone")}
              />
              <Input
                label="Email"
                leftIcon={<Icon name="at-sign" size={16} />}
                {...register("email")}
              />
            </div>

            {/* GST Number */}
            <Input
              label="GST Number"
              leftIcon={<Icon name="receipt" size={16} />}
              {...register("gstNumber")}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? <LoadingSpinner /> : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
