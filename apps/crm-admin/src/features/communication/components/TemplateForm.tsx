"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import {
  Button,
  Icon,
  Input,
  Switch,
  Fieldset,
  RichTextEditor,
  TagsInput,
} from "@/components/ui";
import { LookupSelect } from "@/components/common/LookupSelect";

import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useTemplateDetail,
  useCreateTemplate,
  useUpdateTemplate,
} from "../hooks/useCommunication";

// ── Validation Schema ────────────────────────────────────

const templateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional().default(""),
  subject: z.string().min(1, "Subject is required"),
  bodyHtml: z.string().min(1, "Email body is required"),
  bodyText: z.string().optional().default(""),
  variables: z.array(z.string()).optional().default([]),
  isShared: z.boolean().optional().default(false),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

// ── Helpers ──────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "#475569",
  display: "block",
  marginBottom: 4,
};

// ── Component ────────────────────────────────────────────

export function TemplateForm({ templateId }: { templateId?: string }) {
  const router = useRouter();
  const isEdit = !!templateId;

  const { data: templateData, isLoading: isLoadingTemplate } =
    useTemplateDetail(templateId ?? "");
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema) as any,
    defaultValues: {
      name: "",
      category: "",
      description: "",
      subject: "",
      bodyHtml: "",
      bodyText: "",
      variables: [],
      isShared: false,
    },
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !templateData?.data) return;
    const t = templateData.data;
    reset({
      name: t.name,
      category: t.category,
      description: t.description ?? "",
      subject: t.subject,
      bodyHtml: t.bodyHtml,
      bodyText: t.bodyText ?? "",
      variables: t.variables ?? [],
      isShared: t.isShared ?? false,
    });
  }, [isEdit, templateData, reset]);

  const onSubmit = async (values: TemplateFormValues) => {
    const payload = {
      name: values.name,
      category: values.category as
        | "SALES"
        | "MARKETING"
        | "SUPPORT"
        | "NOTIFICATION"
        | "OTHER",
      description: values.description || undefined,
      subject: values.subject,
      bodyHtml: values.bodyHtml,
      bodyText: values.bodyText || undefined,
      variables: values.variables && values.variables.length > 0 ? values.variables : undefined,
      isShared: values.isShared,
    };

    try {
      if (isEdit && templateId) {
        await updateMutation.mutateAsync({ id: templateId, data: payload });
        toast.success("Template updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Template created");
      }
      router.push("/communication/templates");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} template`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingTemplate) return <LoadingSpinner fullPage />;

  return (
    <div className="p-6" style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      <PageHeader
        title={isEdit ? "Edit Template" : "Create Template"}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <Icon name="arrow-left" size={16} /> Back
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit(onSubmit as any)}
        noValidate
        className="mt-4 max-w-3xl space-y-6"
      >
        {/* Template Information */}
        <Fieldset label="Template Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div>
                  <label style={labelStyle}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Template name"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.name}
                    errorMessage={errors.name?.message}
                  />
                </div>
              )}
            />
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <LookupSelect
                  masterCode="TEMPLATE_CATEGORY"
                  label="Category"
                  value={field.value}
                  onChange={(v) => field.onChange(String(v ?? ""))}
                  error={!!errors.category}
                  errorMessage={errors.category?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div>
                  <label style={labelStyle}>Description</label>
                  <Input
                    placeholder="Short description"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              name="isShared"
              control={control}
              render={({ field }) => (
                <Switch
                  label="Share with team"
                  checked={field.value ?? false}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* Email Content */}
        <Fieldset label="Email Content">
          <div className="space-y-4">
            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <div>
                  <label style={labelStyle}>
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Email subject"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.subject}
                    errorMessage={errors.subject?.message}
                  />
                </div>
              )}
            />
            <Controller
              name="variables"
              control={control}
              render={({ field }) => (
                <TagsInput
                  label="Variables"
                  value={field.value ?? []}
                  onChange={(tags) => field.onChange(tags)}
                  placeholder="Add variable and press Enter"
                />
              )}
            />
            <Controller
              name="bodyHtml"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  label="Email Body"
                  value={field.value}
                  onChange={(html) => field.onChange(html)}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <Icon name="check" size={16} />{" "}
            {isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Update" : "Save"}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
