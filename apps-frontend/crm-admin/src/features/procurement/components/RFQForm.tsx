"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, NumberInput, Fieldset, Modal } from "@/components/ui";
import { SmartDateInput } from "@/components/common/SmartDateInput";
import { LookupSelect } from "@/components/common/LookupSelect";
import { ProductSelect } from "@/components/common/ProductSelect";
import type { ProductSelectOption } from "@/components/common/ProductSelect";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { useSidePanelStore } from "@/stores/side-panel.store";

import { useRFQDetail, useCreateRFQ, useUpdateRFQ } from "../hooks/useProcurement";

// ─── Schema ──────────────────────────────────────────────────────────────────

const lineItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, "Product required"),
  quantity: z.number().min(0.01, "Qty required"),
  unit: z.string().optional(),
  specifications: z.string().optional(),
});

const rfqSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  requiredByDate: z.string().optional(),
  validUntilDate: z.string().optional(),
  internalNotes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, "Add at least one item"),
});

type RFQFormValues = z.infer<typeof rfqSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface RFQFormProps {
  rfqId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RFQForm({ rfqId, mode = "page", panelId, onSuccess }: RFQFormProps) {
  const router = useRouter();
  const isEdit = !!rfqId;
  const isPanel = mode === "panel";
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const [showNotesModal, setShowNotesModal] = useState(false);

  const { data: rfqData, isLoading: isLoadingRFQ } = useRFQDetail(rfqId ?? "");
  const createMutation = useCreateRFQ();
  const updateMutation = useUpdateRFQ();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RFQFormValues>({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      title: "",
      description: "",
      requiredByDate: "",
      validUntilDate: "",
      internalNotes: "",
      items: [{ productId: "", productName: "", quantity: 1, unit: "PIECE", specifications: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (!isEdit || !rfqData?.data) return;
    const r = rfqData.data;
    reset({
      title: r.title,
      description: r.description ?? "",
      requiredByDate: r.requiredByDate ? r.requiredByDate.slice(0, 10) : "",
      validUntilDate: r.validUntilDate ? r.validUntilDate.slice(0, 10) : "",
      internalNotes: "",
      items: r.items?.length
        ? r.items.map((item) => ({
            productId: item.productId ?? "",
            productName: item.productId ?? "",
            quantity: item.quantity,
            unit: item.unitId ?? "PIECE",
            specifications: item.specifications ?? "",
          }))
        : [{ productId: "", productName: "", quantity: 1, unit: "PIECE", specifications: "" }],
    });
  }, [isEdit, rfqData, reset]);

  useEffect(() => {
    if (!panelId) return;
    updatePanelConfig(panelId, {
      footerButtons: [
        {
          id: "cancel",
          label: "Cancel",
          showAs: "text",
          variant: "secondary",
          disabled: isSubmitting,
          onClick: () => {},
        },
        {
          id: "save",
          label: isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Save Changes" : "Save",
          icon: "check",
          showAs: "both",
          variant: "primary",
          loading: isSubmitting,
          disabled: isSubmitting,
          onClick: () => {
            const formEl = document.getElementById(`sp-form-rfq-${rfqId ?? "new"}`) as HTMLFormElement | null;
            formEl?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, rfqId, updatePanelConfig]);

  const onSubmit = async (values: RFQFormValues) => {
    try {
      const payload = {
        title: values.title,
        description: values.description || undefined,
        requiredByDate: values.requiredByDate || undefined,
        validUntilDate: values.validUntilDate || undefined,
        items: values.items.map((item) => ({
          productId: item.productId || item.productName,
          quantity: item.quantity,
          unitId: item.unit || undefined,
          specifications: item.specifications || undefined,
        })),
      };

      if (isEdit && rfqId) {
        await updateMutation.mutateAsync({ id: rfqId, data: payload });
        toast.success("RFQ updated");
        if (isPanel && onSuccess) onSuccess();
        else router.push(`/procurement/rfq/${rfqId}`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("RFQ created");
        if (isPanel && onSuccess) onSuccess();
        else router.push("/procurement/rfq");
      }
    } catch {
      toast.error(isEdit ? "Failed to update RFQ" : "Failed to create RFQ");
    }
  };

  if (isEdit && isLoadingRFQ) return <LoadingSpinner fullPage />;

  return (
    <div className={isPanel ? "p-4" : "p-6 max-w-5xl mx-auto"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit RFQ" : "New RFQ"}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
          }
        />
      )}

      <form
        id={isPanel ? `sp-form-rfq-${rfqId ?? "new"}` : undefined}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={`mt-4 space-y-6${isPanel ? "" : " max-w-5xl"}`}
      >
        <FormErrors errors={errors} />

        {/* ── RFQ Information ── */}
        <Fieldset label="RFQ Information">
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  label="Title *"
                  placeholder="RFQ title"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={errors.title?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input
                  label="Description"
                  placeholder="Brief description"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="requiredByDate"
              control={control}
              render={({ field }) => (
                <SmartDateInput
                  label="Required By"
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? "")}
                />
              )}
            />
            <Controller
              name="validUntilDate"
              control={control}
              render={({ field }) => (
                <SmartDateInput
                  label="Valid Until"
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? "")}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* ── Line Items ── */}
        <Fieldset label="Line Items">
          <div className="overflow-visible">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                  <th className="pb-2 pr-2">Product *</th>
                  <th className="pb-2 pr-2 w-24">Qty *</th>
                  <th className="pb-2 pr-2 w-28">Unit</th>
                  <th className="pb-2 pr-2">Specifications</th>
                  <th className="pb-2 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fields.map((fieldItem, index) => (
                  <tr key={fieldItem.id} className="align-top">
                    <td className="py-2 pr-2">
                      <Controller
                        name={`items.${index}.productId`}
                        control={control}
                        render={({ field: f }) => (
                          <ProductSelect
                            label=""
                            value={f.value ?? null}
                            onChange={(val) => f.onChange(val ?? "")}
                            onProductSelect={(product: ProductSelectOption | null) => {
                              if (product) {
                                setValue(`items.${index}.productName`, product.name);
                                if (product.primaryUnit) setValue(`items.${index}.unit`, product.primaryUnit);
                              }
                            }}
                            error={!!errors.items?.[index]?.productName}
                          />
                        )}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <Controller
                        name={`items.${index}.quantity`}
                        control={control}
                        render={({ field: f }) => (
                          <NumberInput label="" value={f.value} onChange={f.onChange} min={0.01} step={1} precision={2} />
                        )}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <Controller
                        name={`items.${index}.unit`}
                        control={control}
                        render={({ field: f }) => (
                          <LookupSelect masterCode="UNIT_OF_MEASURE" value={f.value ?? ""} onChange={(v) => f.onChange(String(v ?? ""))} />
                        )}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <Controller
                        name={`items.${index}.specifications`}
                        control={control}
                        render={({ field: f }) => (
                          <Input label="" placeholder="Specifications..." value={f.value ?? ""} onChange={f.onChange} />
                        )}
                      />
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ productId: "", productName: "", quantity: 1, unit: "PIECE", specifications: "" })}
                        >
                          <Icon name="plus" size={14} />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                        >
                          <Icon name="trash-2" size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fieldset>

        {/* ── Additional Sections ── */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowNotesModal(true)}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Icon name="message-square" size={16} />
            <span className="font-medium">Internal Notes</span>
            {watch("internalNotes") ? (
              <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Added</span>
            ) : (
              <span className="ml-2 text-xs text-gray-400">+ Add</span>
            )}
          </button>
        </div>

        <Modal
          open={showNotesModal}
          onClose={() => setShowNotesModal(false)}
          title="Internal Notes"
          size="md"
          footer={
            <div className="flex justify-end">
              <Button type="button" variant="primary" onClick={() => setShowNotesModal(false)}>Done</Button>
            </div>
          }
        >
          <Controller
            name="internalNotes"
            control={control}
            render={({ field }) => (
              <textarea
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                value={field.value ?? ""}
                onChange={field.onChange}
                rows={5}
                placeholder="Internal notes..."
              />
            )}
          />
        </Modal>

        {!isPanel && (
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Update" : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        )}
      </form>
    </div>
  );
}
