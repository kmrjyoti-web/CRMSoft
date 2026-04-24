"use client";

import { useState } from "react";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import { Button, Icon, Input, SelectInput, DatePicker } from "@/components/ui";

export interface BulkEditField {
  key: string;
  label: string;
  type: "text" | "select" | "date";
  options?: { label: string; value: string }[];
  required?: boolean;
}

interface BulkEditPanelProps {
  isOpen: boolean;
  onClose: () => void;
  ids: string[];
  fields: BulkEditField[];
  /** Called with selected IDs and non-blank form values; should update each record */
  onSubmit: (ids: string[], values: Record<string, unknown>) => Promise<void>;
  entityName?: string;
}

/**
 * Fixed right-side panel for bulk editing selected records.
 * Renders configurable fields (text, select, date) with zod validation.
 * Only fields with a non-blank value will be applied — blank fields are skipped.
 */
export function BulkEditPanel({
  isOpen,
  onClose,
  ids,
  fields,
  onSubmit,
  entityName = "record",
}: BulkEditPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build dynamic zod schema from fields
  const schemaShape = fields.reduce<Record<string, z.ZodTypeAny>>((acc, f) => {
    acc[f.key] = f.required
      ? z.string().min(1, `${f.label} is required`)
      : z.string().optional();
    return acc;
  }, {});
  const schema = z.object(schemaShape);
  type FormValues = z.infer<typeof schema>;

  const defaultValues = fields.reduce<Record<string, string>>((acc, f) => {
    acc[f.key] = "";
    return acc;
  }, {});

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  if (!isOpen) return null;

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onFormSubmit = async (values: FormValues) => {
    // Only include fields that have a non-empty value
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== "" && v !== undefined && v !== null),
    );

    if (Object.keys(payload).length === 0) {
      toast.error("Please fill in at least one field to update");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(ids, payload);
      const count = ids.length;
      toast.success(
        `${count} ${entityName}${count !== 1 ? "s" : ""} updated successfully`,
      );
      handleClose();
    } catch {
      toast.error(`Failed to update ${entityName}s`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const errMap = errors as Record<string, { message?: string } | undefined>;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 98,
        }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          background: "#fff",
          zIndex: 99,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
              Bulk Edit
            </h3>
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
              Editing {ids.length} {entityName}{ids.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Info banner */}
        <div
          style={{
            padding: "10px 20px",
            background: "#eff6ff",
            borderBottom: "1px solid #dbeafe",
            fontSize: 12,
            color: "#1d4ed8",
          }}
        >
          <Icon name="info" size={12} /> Only filled fields will be updated. Blank fields are ignored.
        </div>

        {/* Fields + Footer together in a form that wraps both */}
        <form
          onSubmit={handleSubmit(onFormSubmit as any)}
          noValidate
          style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            {fields.map((field) => (
              <Controller
                key={field.key}
                name={field.key as keyof FormValues}
                control={control}
                render={({ field: f }) => {
                  if (field.type === "select") {
                    return (
                      <SelectInput
                        label={field.label}
                        options={[
                          { label: "— Keep existing —", value: "" },
                          ...(field.options ?? []),
                        ]}
                        value={(f.value as string) ?? ""}
                        onChange={(v) => f.onChange(String(v ?? ""))}
                        error={!!errMap[field.key]}
                        errorMessage={errMap[field.key]?.message}
                      />
                    );
                  }
                  if (field.type === "date") {
                    return (
                      <DatePicker
                        label={field.label}
                        value={(f.value as string) ?? ""}
                        onChange={(v) => f.onChange(v)}
                      />
                    );
                  }
                  return (
                    <Input
                      label={field.label}
                      placeholder={`New ${field.label.toLowerCase()} (leave blank to skip)`}
                      value={(f.value as string) ?? ""}
                      onChange={(v) => f.onChange(v)}
                      error={!!errMap[field.key]}
                      errorMessage={errMap[field.key]?.message}
                    />
                  );
                }}
              />
            ))}
          </div>

          {/* Footer inside form so submit button works */}
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              gap: 8,
              background: "#f9fafb",
            }}
          >
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              <Icon name="check" size={14} /> Apply to {ids.length}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
