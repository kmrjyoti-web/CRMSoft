"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, RichTextEditor, Switch, Icon } from "@/components/ui";
import { useSignaturesList, useCreateSignature, useUpdateSignature } from "../hooks/useCommunication";
import type { EmailSignatureItem } from "../types/communication.types";

// ── Schema ───────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  bodyHtml: z.string().min(1, "Signature content is required"),
  isDefault: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Props ────────────────────────────────────────────────

interface SignatureFormProps {
  signatureId?: string;
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

export function SignatureForm({ signatureId, mode = "page", panelId, onSuccess, onCancel }: SignatureFormProps) {
  const isEdit = !!signatureId;
  const formId = panelId ? `sp-form-signature-${panelId.replace("signature-", "")}` : "signature-form";

  const { data: listData } = useSignaturesList();
  const signatures: EmailSignatureItem[] = (listData?.data ?? []) as EmailSignatureItem[];
  const existing = signatures.find((s) => s.id === signatureId);

  const createMut = useCreateSignature();
  const updateMut = useUpdateSignature();

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
      bodyHtml: "",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        bodyHtml: existing.bodyHtml,
        isDefault: existing.isDefault,
      });
    }
  }, [existing, reset]);

  const onSubmit = (handleSubmit as any)(async (values: FormValues) => {
    const payload = {
      name: values.name,
      bodyHtml: values.bodyHtml,
      isDefault: values.isDefault,
    };

    if (isEdit && signatureId) {
      await updateMut.mutateAsync({ id: signatureId, data: payload });
    } else {
      await createMut.mutateAsync(payload);
    }
    onSuccess?.();
  });

  return (
    <form id={formId} onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, padding: "16px 20px 8px" }}>
      <FormSection title="Signature Details">
        <Input
          label="Name *"
          value={watch("name")}
          onChange={(v) => setValue("name", v)}
          leftIcon={<Icon name="edit" size={16} />}
          error={!!errors.name}
        />
        <RichTextEditor
          label="Signature Content *"
          value={watch("bodyHtml")}
          onChange={(html) => setValue("bodyHtml", html)}
        />
      </FormSection>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
        <Switch
          checked={watch("isDefault") ?? false}
          onChange={(v: boolean) => setValue("isDefault", v)}
        />
        <span style={{ fontSize: 14, color: "#374151" }}>Set as Default Signature</span>
      </div>

      <button type="submit" style={{ display: "none" }} aria-hidden="true" />
    </form>
  );
}
