"use client";

import { useEffect } from "react";

import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button, Card, Input, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  useCreatePriceGroup,
  useUpdatePriceGroup,
} from "../hooks/usePriceGroups";
import type { CustomerPriceGroup, CreatePriceGroupDto } from "../types/price-groups.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PriceGroupFormProps {
  group?: CustomerPriceGroup;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PriceGroupForm({ group, onClose }: PriceGroupFormProps) {
  const isEdit = !!group;
  const createMut = useCreatePriceGroup();
  const updateMut = useUpdatePriceGroup();
  const saving = createMut.isPending || updateMut.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePriceGroupDto>({
    defaultValues: {
      name: group?.name ?? "",
      code: group?.code ?? "",
      description: group?.description ?? "",
      discountPercent: group?.discountPercent ?? 0,
      priceListId: group?.priceListId ?? "",
    },
  });

  useEffect(() => {
    if (group) {
      reset({
        name: group.name,
        code: group.code,
        description: group.description ?? "",
        discountPercent: group.discountPercent ?? 0,
        priceListId: group.priceListId ?? "",
      });
    }
  }, [group, reset]);

  function onSubmit(values: CreatePriceGroupDto) {
    if (isEdit && group) {
      updateMut.mutate(
        { id: group.id, dto: values },
        {
          onSuccess: () => {
            toast.success("Price group updated");
            onClose();
          },
          onError: () => toast.error("Failed to update price group"),
        }
      );
    } else {
      createMut.mutate(values, {
        onSuccess: () => {
          toast.success("Price group created");
          onClose();
        },
        onError: () => toast.error("Failed to create price group"),
      });
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "600px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
          {isEdit ? "Edit Price Group" : "Create Price Group"}
        </h2>
        <Button variant="ghost" onClick={onClose}>
          <Icon name="x" size={16} />
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit as any)} style={{ padding: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Name */}
            <div>
              <Input
                label="Name"
                leftIcon={<Icon name="tag" size={16} />}
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Code */}
            <div>
              <Input
                label="Code"
                leftIcon={<Icon name="hash" size={16} />}
                {...register("code", { required: "Code is required" })}
              />
              {errors.code && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Input
                label="Description"
                leftIcon={<Icon name="file-text" size={16} />}
                {...register("description")}
              />
            </div>

            {/* Discount Percent */}
            <div>
              <Input
                label="Discount %"
                leftIcon={<Icon name="percent" size={16} />}
                type="number"
                {...register("discountPercent", { valueAsNumber: true })}
              />
            </div>

            {/* Price List ID */}
            <div>
              <Input
                label="Price List ID"
                leftIcon={<Icon name="list" size={16} />}
                {...register("priceListId")}
              />
            </div>
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
