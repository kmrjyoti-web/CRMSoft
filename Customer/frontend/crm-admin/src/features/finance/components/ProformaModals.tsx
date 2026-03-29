"use client";

import { Control, Controller, UseFormWatch } from "react-hook-form";

import { Button, Icon, Modal, TextareaInput } from "@/components/ui";

// ---------------------------------------------------------------------------
// Types (minimal — only the fields used by modals & triggers)
// ---------------------------------------------------------------------------

interface ProformaModalFormValues {
  notes?: string;
  termsAndConditions?: string;
  internalNotes?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProformaModalsProps {
  control: Control<ProformaModalFormValues>;
  watch: UseFormWatch<ProformaModalFormValues>;
  showNotesModal: boolean;
  showTermsModal: boolean;
  showInternalNotesModal: boolean;
  onShowNotesModal: (open: boolean) => void;
  onShowTermsModal: (open: boolean) => void;
  onShowInternalNotesModal: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProformaModals({
  control,
  watch,
  showNotesModal,
  showTermsModal,
  showInternalNotesModal,
  onShowNotesModal,
  onShowTermsModal,
  onShowInternalNotesModal,
}: ProformaModalsProps) {
  return (
    <>
      {/* ----------------------------------------------------------------
          Trigger buttons
      ---------------------------------------------------------------- */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onShowNotesModal(true)}
          className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Icon name="file-text" size={16} />
          <span className="font-medium">Notes</span>
          {watch("notes") ? (
            <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
              Added
            </span>
          ) : (
            <span className="ml-auto text-xs text-gray-400">+ Add</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onShowTermsModal(true)}
          className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Icon name="shield" size={16} />
          <span className="font-medium">Terms &amp; Conditions</span>
          {watch("termsAndConditions") ? (
            <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
              Added
            </span>
          ) : (
            <span className="ml-2 text-xs text-gray-400">+ Add</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onShowInternalNotesModal(true)}
          className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Icon name="message-square" size={16} />
          <span className="font-medium">Internal Notes</span>
          {watch("internalNotes") ? (
            <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
              Added
            </span>
          ) : (
            <span className="ml-2 text-xs text-gray-400">+ Add</span>
          )}
        </button>
      </div>

      {/* ── Notes Modal ── */}
      <Modal
        open={showNotesModal}
        onClose={() => onShowNotesModal(false)}
        title="Notes"
        size="md"
        footer={
          <div className="flex justify-end">
            <Button type="button" variant="primary" onClick={() => onShowNotesModal(false)}>
              Done
            </Button>
          </div>
        }
      >
        <Controller
          name="notes"
          control={control as any}
          render={({ field }) => (
            <TextareaInput
              label="Notes"
              value={(field.value as string) ?? ""}
              onChange={field.onChange}
              rows={5}
            />
          )}
        />
      </Modal>

      {/* ── Terms & Conditions Modal ── */}
      <Modal
        open={showTermsModal}
        onClose={() => onShowTermsModal(false)}
        title="Terms & Conditions"
        size="md"
        footer={
          <div className="flex justify-end">
            <Button type="button" variant="primary" onClick={() => onShowTermsModal(false)}>
              Done
            </Button>
          </div>
        }
      >
        <Controller
          name="termsAndConditions"
          control={control as any}
          render={({ field }) => (
            <TextareaInput
              label="Terms & Conditions"
              value={(field.value as string) ?? ""}
              onChange={field.onChange}
              rows={5}
            />
          )}
        />
      </Modal>

      {/* ── Internal Notes Modal ── */}
      <Modal
        open={showInternalNotesModal}
        onClose={() => onShowInternalNotesModal(false)}
        title="Internal Notes"
        size="md"
        footer={
          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              onClick={() => onShowInternalNotesModal(false)}
            >
              Done
            </Button>
          </div>
        }
      >
        <Controller
          name="internalNotes"
          control={control as any}
          render={({ field }) => (
            <TextareaInput
              label="Internal Notes"
              value={(field.value as string) ?? ""}
              onChange={field.onChange}
              rows={5}
            />
          )}
        />
      </Modal>
    </>
  );
}
