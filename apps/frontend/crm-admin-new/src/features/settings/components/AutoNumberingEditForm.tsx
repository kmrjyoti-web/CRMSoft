"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import { Input, Button, Icon, SelectInput, NumberInput, Modal } from "@/components/ui";
import { useSidePanelStore } from "@/stores/side-panel.store";

import {
  useAutoNumberSequence,
  useUpdateAutoNumber,
  usePreviewAutoNumber,
  useResetAutoNumber,
} from "../hooks/useAutoNumbering";

// ── Props ────────────────────────────────────────────────

interface AutoNumberingEditFormProps {
  entityName?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Schema ───────────────────────────────────────────────

const autoNumberSchema = z.object({
  prefix: z.string().min(1, "Prefix is required"),
  formatPattern: z.string().min(1, "Format pattern is required"),
  seqPadding: z.coerce.number().min(1).max(10),
  startFrom: z.coerce.number().min(1),
  incrementBy: z.coerce.number().min(1).max(100),
  resetPolicy: z.string().min(1),
});

type AutoNumberFormData = z.infer<typeof autoNumberSchema>;

// ── Reset Policy options ─────────────────────────────────

const RESET_POLICY_OPTIONS = [
  { label: "Never", value: "NEVER" },
  { label: "Daily", value: "DAILY" },
  { label: "Monthly", value: "MONTHLY" },
  { label: "Quarterly", value: "QUARTERLY" },
  { label: "Yearly", value: "YEARLY" },
];

// ── Format token reference ───────────────────────────────

const FORMAT_TOKENS = [
  { token: "{PREFIX}", desc: "Prefix value" },
  { token: "{YYYY}", desc: "Full year" },
  { token: "{YY}", desc: "Short year" },
  { token: "{MM}", desc: "Month (01-12)" },
  { token: "{DD}", desc: "Day (01-31)" },
  { token: "{SEQ:n}", desc: "Sequence padded to n digits" },
];

// ── Component ────────────────────────────────────────────

export function AutoNumberingEditForm({
  entityName,
  mode = "panel",
  panelId,
  onSuccess,
  onCancel,
}: AutoNumberingEditFormProps) {
  const { data: seqData } = useAutoNumberSequence(entityName ?? "");
  const seq = (seqData as any)?.data ?? seqData;

  const { data: previewData, refetch: refetchPreview } = usePreviewAutoNumber(entityName ?? "");
  const previewNumber = (previewData as any)?.data?.number ?? (previewData as any)?.number ?? null;

  const updateMutation = useUpdateAutoNumber();
  const resetMutation = useResetAutoNumber();

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetNewStart, setResetNewStart] = useState<number | null>(null);

  const formId = `sp-form-auto-number-${entityName ?? "new"}`;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AutoNumberFormData>({
    resolver: zodResolver(autoNumberSchema) as any,
    defaultValues: {
      prefix: "",
      formatPattern: "",
      seqPadding: 5,
      startFrom: 1,
      incrementBy: 1,
      resetPolicy: "YEARLY",
    },
  });

  // Pre-fill when sequence loads
  useEffect(() => {
    if (seq) {
      reset({
        prefix: seq.prefix ?? "",
        formatPattern: seq.formatPattern ?? "",
        seqPadding: seq.seqPadding ?? 5,
        startFrom: seq.startFrom ?? 1,
        incrementBy: seq.incrementBy ?? 1,
        resetPolicy: seq.resetPolicy ?? "YEARLY",
      });
    }
  }, [seq, reset]);

  // Sync submitting state to panel footer
  const setFooterDisabled = useSidePanelStore((s) => s.setFooterDisabled);
  useEffect(() => {
    if (mode === "panel") setFooterDisabled?.(isSubmitting);
  }, [isSubmitting, mode, setFooterDisabled]);

  const onSubmit = useCallback(
    async (data: AutoNumberFormData) => {
      if (!entityName) return;
      try {
        await updateMutation.mutateAsync({ entity: entityName, data });
        toast.success("Auto numbering updated");
        onSuccess?.();
      } catch {
        toast.error("Failed to update auto numbering");
      }
    },
    [entityName, updateMutation, onSuccess],
  );

  const handleReset = useCallback(async () => {
    if (!entityName) return;
    try {
      await resetMutation.mutateAsync({
        entity: entityName,
        data: resetNewStart != null ? { newStart: resetNewStart } : undefined,
      });
      toast.success("Sequence reset successfully");
      setShowResetModal(false);
      setResetNewStart(null);
    } catch {
      toast.error("Failed to reset sequence");
    }
  }, [entityName, resetMutation, resetNewStart]);

  return (
    <>
      <form
        id={formId}
        onSubmit={handleSubmit(onSubmit) as any}
        className="space-y-6 p-4"
      >
        {/* Entity Info (read-only) */}
        {seq && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900">{seq.entityName}</p>
            <p className="text-xs text-gray-500">
              Current Sequence: {seq.currentSequence} &middot;
              Sample: {seq.sampleNumber ?? "\u2014"}
            </p>
          </div>
        )}

        {/* Format Configuration */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Format Configuration</h4>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="prefix"
              control={control}
              render={({ field }) => (
                <Input
                  label="Prefix"
                  leftIcon={<Icon name="hash" size={16} />}
                  placeholder="LD"
                  value={field.value}
                  onChange={(val: string) => field.onChange(val)}
                  error={!!errors.prefix}
                  errorMessage={errors.prefix?.message}
                />
              )}
            />

            <Controller
              name="formatPattern"
              control={control}
              render={({ field }) => (
                <Input
                  label="Format Pattern"
                  leftIcon={<Icon name="code" size={16} />}
                  placeholder="{PREFIX}-{YYYY}-{SEQ:5}"
                  value={field.value}
                  onChange={(val: string) => field.onChange(val)}
                  error={!!errors.formatPattern}
                  errorMessage={errors.formatPattern?.message}
                />
              )}
            />
          </div>

          {/* Token reference */}
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="text-xs font-medium text-blue-700 mb-1">Available Tokens:</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {FORMAT_TOKENS.map((t) => (
                <span key={t.token} className="text-xs text-blue-600">
                  <code className="bg-blue-100 px-1 rounded">{t.token}</code>{" "}
                  {t.desc}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sequence Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Sequence Settings</h4>
          <div className="grid grid-cols-3 gap-4">
            <Controller
              name="seqPadding"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Seq Padding"
                  value={field.value}
                  onChange={field.onChange}
                  min={1}
                  max={10}
                />
              )}
            />

            <Controller
              name="startFrom"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Start From"
                  value={field.value}
                  onChange={field.onChange}
                  min={1}
                />
              )}
            />

            <Controller
              name="incrementBy"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Increment By"
                  value={field.value}
                  onChange={field.onChange}
                  min={1}
                  max={100}
                />
              )}
            />
          </div>
        </div>

        {/* Reset Policy */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Reset Policy</h4>
          <Controller
            name="resetPolicy"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Reset Policy"
                leftIcon={<Icon name="rotate-ccw" size={16} />}
                options={RESET_POLICY_OPTIONS}
                value={field.value}
                onChange={(val) => field.onChange(String(val ?? ""))}
              />
            )}
          />
        </div>

        {/* Preview & Reset actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetchPreview()}
          >
            <Icon name="eye" size={14} /> Preview Next
          </Button>
          {previewNumber && (
            <span className="text-sm text-gray-700">
              Next: <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">{previewNumber}</code>
            </span>
          )}

          <Button
            type="button"
            variant="danger"
            size="sm"
            className="ml-auto"
            onClick={() => setShowResetModal(true)}
          >
            <Icon name="rotate-ccw" size={14} /> Reset
          </Button>
        </div>
      </form>

      {/* Reset confirmation modal */}
      <Modal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Sequence"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReset}
              loading={resetMutation.isPending}
            >
              Reset
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600 mb-3">
          This will reset the sequence counter for <strong>{entityName}</strong>.
          This action cannot be undone.
        </p>
        <NumberInput
          label="New Start Value (optional)"
          value={resetNewStart}
          onChange={(val) => setResetNewStart(val)}
          min={0}
        />
      </Modal>
    </>
  );
}
