"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, NumberInput, SelectInput, Fieldset, Modal } from "@/components/ui";
import { SmartDateInput } from "@/components/common/SmartDateInput";
import { LookupSelect } from "@/components/common/LookupSelect";
import { ProductSelect } from "@/components/common/ProductSelect";
import type { ProductSelectOption } from "@/components/common/ProductSelect";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { useSidePanelStore } from "@/stores/side-panel.store";

import { useGRNDetail, useCreateGRN, useUpdateGRN } from "../hooks/useProcurement";

// ─── Schema ──────────────────────────────────────────────────────────────────

const RECEIPT_TYPE_OPTIONS = [
  { value: "PURCHASE", label: "Purchase" },
  { value: "RETURN", label: "Return" },
  { value: "TRANSFER", label: "Transfer" },
];

const lineItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, "Product required"),
  receivedQty: z.number().min(0.01, "Qty required"),
  acceptedQty: z.number().nullable().optional(),
  rejectedQty: z.number().nullable().optional(),
  unit: z.string().optional(),
  batchNo: z.string().optional(),
  rejectionReason: z.string().optional(),
});

const grnSchema = z.object({
  receiptType: z.string().min(1, "Type required"),
  locationId: z.string().min(1, "Location required"),
  poId: z.string().optional(),
  vendorId: z.string().optional(),
  receiptDate: z.string().min(1, "Date required"),
  vendorChallanNo: z.string().optional(),
  internalNotes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, "Add at least one item"),
});

type GRNFormValues = z.infer<typeof grnSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface GRNFormProps {
  grnId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GRNForm({ grnId, mode = "page", panelId, onSuccess }: GRNFormProps) {
  const router = useRouter();
  const isEdit = !!grnId;
  const isPanel = mode === "panel";
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const [showNotesModal, setShowNotesModal] = useState(false);

  const { data: grnData, isLoading } = useGRNDetail(grnId ?? "");
  const createMutation = useCreateGRN();
  const updateMutation = useUpdateGRN();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GRNFormValues>({
    resolver: zodResolver(grnSchema),
    defaultValues: {
      receiptType: "PURCHASE",
      locationId: "",
      poId: "",
      vendorId: "",
      receiptDate: new Date().toISOString().slice(0, 10),
      vendorChallanNo: "",
      internalNotes: "",
      items: [{ productId: "", productName: "", receivedQty: 1, acceptedQty: 1, rejectedQty: 0, unit: "PIECE", batchNo: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (!isEdit || !grnData?.data) return;
    const g = grnData.data;
    reset({
      receiptType: g.receiptType,
      locationId: g.locationId,
      poId: g.poId ?? "",
      vendorId: g.vendorId ?? "",
      receiptDate: g.receiptDate.slice(0, 10),
      vendorChallanNo: g.vendorChallanNo ?? "",
      internalNotes: "",
      items: g.items?.length
        ? g.items.map((item) => ({
            productId: item.productId ?? "",
            productName: item.productId ?? "",
            receivedQty: item.receivedQty,
            acceptedQty: item.acceptedQty ?? null,
            rejectedQty: item.rejectedQty ?? 0,
            unit: item.unitId ?? "PIECE",
            batchNo: item.batchNo ?? "",
            rejectionReason: item.rejectionReason ?? "",
          }))
        : [{ productId: "", productName: "", receivedQty: 1, acceptedQty: 1, rejectedQty: 0, unit: "PIECE", batchNo: "" }],
    });
  }, [isEdit, grnData, reset]);

  useEffect(() => {
    if (!panelId) return;
    updatePanelConfig(panelId, {
      footerButtons: [
        { id: "cancel", label: "Cancel", showAs: "text", variant: "secondary", disabled: isSubmitting, onClick: () => {} },
        {
          id: "save",
          label: isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Save Changes" : "Save",
          icon: "check", showAs: "both", variant: "primary", loading: isSubmitting, disabled: isSubmitting,
          onClick: () => {
            const formEl = document.getElementById(`sp-form-grn-${grnId ?? "new"}`) as HTMLFormElement | null;
            formEl?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, grnId, updatePanelConfig]);

  const onSubmit = async (values: GRNFormValues) => {
    try {
      const payload = {
        receiptType: values.receiptType,
        locationId: values.locationId,
        poId: values.poId || undefined,
        vendorId: values.vendorId || undefined,
        receiptDate: values.receiptDate,
        vendorChallanNo: values.vendorChallanNo || undefined,
        items: values.items.map((item) => ({
          productId: item.productId || item.productName,
          receivedQty: item.receivedQty,
          acceptedQty: item.acceptedQty ?? undefined,
          rejectedQty: item.rejectedQty ?? 0,
          unitId: item.unit || undefined,
          batchNo: item.batchNo || undefined,
          rejectionReason: item.rejectionReason || undefined,
        })),
      };

      if (isEdit && grnId) {
        await updateMutation.mutateAsync({ id: grnId, data: payload });
        toast.success("GRN updated");
        if (isPanel && onSuccess) onSuccess();
        else router.push(`/procurement/goods-receipts/${grnId}`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("GRN created");
        if (isPanel && onSuccess) onSuccess();
        else router.push("/procurement/goods-receipts");
      }
    } catch {
      toast.error(isEdit ? "Failed to update GRN" : "Failed to create GRN");
    }
  };

  if (isEdit && isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className={isPanel ? "p-4" : "p-6 max-w-5xl mx-auto"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Goods Receipt" : "New Goods Receipt"}
          actions={<Button variant="outline" onClick={() => router.back()}><Icon name="arrow-left" size={16} /> Back</Button>}
        />
      )}

      <form
        id={isPanel ? `sp-form-grn-${grnId ?? "new"}` : undefined}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={`mt-4 space-y-6${isPanel ? "" : " max-w-5xl"}`}
      >
        <FormErrors errors={errors} />

        {/* ── Receipt Information ── */}
        <Fieldset label="Receipt Information">
          <div className="grid grid-cols-3 gap-4">
            <Controller name="receiptType" control={control} render={({ field }) => (
              <SelectInput label="Receipt Type *" options={RECEIPT_TYPE_OPTIONS} value={field.value}
                onChange={(v) => field.onChange(v as string)} error={errors.receiptType?.message} />
            )} />
            <Controller name="receiptDate" control={control} render={({ field }) => (
              <SmartDateInput label="Receipt Date" required value={field.value || null} onChange={(v) => field.onChange(v ?? "")} />
            )} />
            <Controller name="locationId" control={control} render={({ field }) => (
              <Input label="Location ID *" leftIcon={<Icon name="map-pin" size={16} />}
                value={field.value ?? ""} onChange={field.onChange} error={errors.locationId?.message} />
            )} />
            <Controller name="poId" control={control} render={({ field }) => (
              <Input label="PO Reference" leftIcon={<Icon name="file-text" size={16} />}
                placeholder="PO ID (optional)" value={field.value ?? ""} onChange={field.onChange} />
            )} />
            <Controller name="vendorId" control={control} render={({ field }) => (
              <Input label="Vendor ID" leftIcon={<Icon name="building" size={16} />}
                placeholder="Vendor ID" value={field.value ?? ""} onChange={field.onChange} />
            )} />
            <Controller name="vendorChallanNo" control={control} render={({ field }) => (
              <Input label="Vendor Challan #" leftIcon={<Icon name="hash" size={16} />}
                value={field.value ?? ""} onChange={field.onChange} />
            )} />
          </div>
        </Fieldset>

        {/* ── Receipt Items ── */}
        <Fieldset label="Receipt Items">
          <div className="overflow-visible">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                  <th className="pb-2 pr-2">Product *</th>
                  <th className="pb-2 pr-2 w-24">Received *</th>
                  <th className="pb-2 pr-2 w-24">Accepted</th>
                  <th className="pb-2 pr-2 w-24">Rejected</th>
                  <th className="pb-2 pr-2 w-28">Unit</th>
                  <th className="pb-2 pr-2 w-28">Batch No</th>
                  <th className="pb-2 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fields.map((fieldItem, index) => (
                  <tr key={fieldItem.id} className="align-top">
                    <td className="py-2 pr-2">
                      <Controller name={`items.${index}.productId`} control={control} render={({ field: f }) => (
                        <ProductSelect label="" value={f.value ?? null} onChange={(val) => f.onChange(val ?? "")}
                          onProductSelect={(product: ProductSelectOption | null) => {
                            if (product) {
                              setValue(`items.${index}.productName`, product.name);
                              if (product.primaryUnit) setValue(`items.${index}.unit`, product.primaryUnit);
                            }
                          }}
                          error={!!errors.items?.[index]?.productName} />
                      )} />
                    </td>
                    <td className="py-2 pr-2">
                      <Controller name={`items.${index}.receivedQty`} control={control}
                        render={({ field: f }) => <NumberInput label="" value={f.value} onChange={f.onChange} min={0.01} step={1} precision={2} />} />
                    </td>
                    <td className="py-2 pr-2">
                      <Controller name={`items.${index}.acceptedQty`} control={control}
                        render={({ field: f }) => <NumberInput label="" value={f.value ?? null} onChange={f.onChange} min={0} step={1} precision={2} />} />
                    </td>
                    <td className="py-2 pr-2">
                      <Controller name={`items.${index}.rejectedQty`} control={control}
                        render={({ field: f }) => <NumberInput label="" value={f.value ?? null} onChange={f.onChange} min={0} step={1} precision={2} />} />
                    </td>
                    <td className="py-2 pr-2">
                      <Controller name={`items.${index}.unit`} control={control}
                        render={({ field: f }) => <LookupSelect masterCode="UNIT_OF_MEASURE" value={f.value ?? ""} onChange={(v) => f.onChange(String(v ?? ""))} />} />
                    </td>
                    <td className="py-2 pr-2">
                      <Controller name={`items.${index}.batchNo`} control={control}
                        render={({ field: f }) => <Input label="" placeholder="Batch #" value={f.value ?? ""} onChange={f.onChange} />} />
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        <Button type="button" variant="outline" size="sm"
                          onClick={() => append({ productId: "", productName: "", receivedQty: 1, acceptedQty: 1, rejectedQty: 0, unit: "PIECE", batchNo: "" })}>
                          <Icon name="plus" size={14} />
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => remove(index)} disabled={fields.length <= 1}>
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
          <button type="button" onClick={() => setShowNotesModal(true)}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
            <Icon name="message-square" size={16} />
            <span className="font-medium">Internal Notes</span>
            {watch("internalNotes") ? <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Added</span> : <span className="ml-2 text-xs text-gray-400">+ Add</span>}
          </button>
        </div>

        <Modal open={showNotesModal} onClose={() => setShowNotesModal(false)} title="Internal Notes" size="md"
          footer={<div className="flex justify-end"><Button type="button" variant="primary" onClick={() => setShowNotesModal(false)}>Done</Button></div>}>
          <Controller name="internalNotes" control={control} render={({ field }) => (
            <textarea className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
              value={field.value ?? ""} onChange={field.onChange} rows={5} placeholder="Internal notes..." />
          )} />
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
