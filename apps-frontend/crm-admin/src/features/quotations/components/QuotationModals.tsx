'use client';

import { Control, Controller } from "react-hook-form";
import toast from "react-hot-toast";

import { Button, Icon, Modal } from "@/components/ui";
import { SmartDateInput } from "@/components/common/SmartDateInput";

// ---------------------------------------------------------------------------
// Shared form type (mirrors QuotationForm's QuotationFormValues shape)
// ---------------------------------------------------------------------------

// We use a loose type here so this file does not re-declare the full Zod schema.
// The `control` prop is typed against the same inferred shape.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyControl = Control<any, any, any>;

// ---------------------------------------------------------------------------
// QuotationSummaryModal
// ---------------------------------------------------------------------------

interface QuotationSummaryModalProps {
  open: boolean;
  onClose: () => void;
  control: AnyControl;
}

export function QuotationSummaryModal({ open, onClose, control }: QuotationSummaryModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Summary"
      size="md"
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <Controller
        name="summary"
        control={control}
        render={({ field }) => (
          <textarea
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
            value={field.value ?? ""}
            onChange={field.onChange}
            rows={5}
            placeholder="Brief summary of the quotation..."
          />
        )}
      />
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// QuotationTermsModal
// ---------------------------------------------------------------------------

interface QuotationTermsModalProps {
  open: boolean;
  onClose: () => void;
  control: AnyControl;
}

export function QuotationTermsModal({ open, onClose, control }: QuotationTermsModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Validity & Terms"
      size="lg"
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Controller
            name="validFrom"
            control={control}
            render={({ field }) => (
              <SmartDateInput
                label="Valid From"
                value={field.value || null}
                onChange={(v) => field.onChange(v ?? "")}
              />
            )}
          />
          <Controller
            name="validUntil"
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

        <Controller
          name="paymentTerms"
          control={control}
          render={({ field }) => (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Payment Terms</label>
              <textarea
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                value={field.value ?? ""}
                onChange={field.onChange}
                rows={2}
              />
            </div>
          )}
        />

        <Controller
          name="deliveryTerms"
          control={control}
          render={({ field }) => (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Delivery Terms</label>
              <textarea
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                value={field.value ?? ""}
                onChange={field.onChange}
                rows={2}
              />
            </div>
          )}
        />

        <Controller
          name="warrantyTerms"
          control={control}
          render={({ field }) => (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Warranty Terms</label>
              <textarea
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                value={field.value ?? ""}
                onChange={field.onChange}
                rows={2}
              />
            </div>
          )}
        />

        <Controller
          name="termsConditions"
          control={control}
          render={({ field }) => (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Terms & Conditions</label>
              <textarea
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                value={field.value ?? ""}
                onChange={field.onChange}
                rows={3}
              />
            </div>
          )}
        />
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// QuotationNotesModal
// ---------------------------------------------------------------------------

interface QuotationNotesModalProps {
  open: boolean;
  onClose: () => void;
  control: AnyControl;
}

export function QuotationNotesModal({ open, onClose, control }: QuotationNotesModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Internal Notes"
      size="md"
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="primary" onClick={onClose}>
            Done
          </Button>
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
            placeholder="Internal notes (not visible to customer)..."
          />
        )}
      />
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// QuotationErrorModal
// ---------------------------------------------------------------------------

export interface ErrorModalState {
  open: boolean;
  title: string;
  summary: string;
  details: { field: string; message: string }[];
  rawError?: string;
}

interface QuotationErrorModalProps {
  errorModal: ErrorModalState;
  showErrorRaw: boolean;
  onClose: () => void;
  onToggleRaw: () => void;
}

export function QuotationErrorModal({
  errorModal,
  showErrorRaw,
  onClose,
  onToggleRaw,
}: QuotationErrorModalProps) {
  return (
    <Modal
      open={errorModal.open}
      onClose={onClose}
      title={errorModal.title}
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={() => {
              const body = [
                `Error: ${errorModal.title}`,
                `Summary: ${errorModal.summary}`,
                "",
                "Details:",
                ...errorModal.details.map((d) => `  - ${d.field}: ${d.message}`),
                "",
                errorModal.rawError ? `Raw:\n${errorModal.rawError}` : "",
                "",
                `URL: ${window.location.href}`,
                `Time: ${new Date().toISOString()}`,
              ].join("\n");
              navigator.clipboard.writeText(body);
              toast.success("Error details copied to clipboard");
            }}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Icon name="copy" size={14} />
            Copy for Report
          </button>
          <Button type="button" variant="primary" onClick={onClose}>
            OK
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Summary */}
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
          <Icon name="alert-circle" size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">{errorModal.summary}</p>
            <p className="text-xs text-red-500 mt-0.5">
              Fix the issues below and try saving again.
            </p>
          </div>
        </div>

        {/* Field-level details */}
        {errorModal.details.length > 0 && (
          <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
            {errorModal.details.map((d, i) => (
              <div key={i} className="flex items-start gap-3 px-3 py-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700">{d.field}</p>
                  <p className="text-xs text-gray-500">{d.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Raw error toggle (for technical details / reporting) */}
        {errorModal.rawError && (
          <div>
            <button
              type="button"
              onClick={onToggleRaw}
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name={showErrorRaw ? "chevron-down" : "chevron-right"} size={12} />
              Technical Details
            </button>
            {showErrorRaw && (
              <pre className="mt-1.5 rounded bg-gray-50 border border-gray-200 p-2 text-[11px] text-gray-600 overflow-x-auto max-h-40">
                {errorModal.rawError}
              </pre>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// QuotationUnsavedDialog
// ---------------------------------------------------------------------------

interface QuotationUnsavedDialogProps {
  open: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

export function QuotationUnsavedDialog({
  open,
  onKeepEditing,
  onDiscard,
}: QuotationUnsavedDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onKeepEditing}
      title=""
      size="sm"
    >
      <div className="text-center py-2">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
          <Icon name="alert-triangle" size={28} className="text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Unsaved Changes</h3>
        <p className="text-sm text-gray-500 mb-6">
          You have unsaved changes that will be lost.<br />
          Do you want to discard them?
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onKeepEditing}>
            Keep Editing
          </Button>
          <Button variant="danger" onClick={onDiscard}>
            Discard Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
