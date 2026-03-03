"use client";

import { useState, useCallback } from "react";

import toast from "react-hot-toast";

import { Button, Icon, Badge, Modal, Input, RichTextEditor, Switch } from "@/components/ui";

import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { useConfirmDialog } from "@/components/common/useConfirmDialog";

import {
  useSignaturesList,
  useCreateSignature,
  useUpdateSignature,
  useDeleteSignature,
} from "../hooks/useCommunication";

import type { EmailSignatureItem } from "../types/communication.types";

// ── Component ────────────────────────────────────────────

export function SignatureList() {
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();

  const { data, isLoading } = useSignaturesList();
  const createMutation = useCreateSignature();
  const updateMutation = useUpdateSignature();
  const deleteMutation = useDeleteSignature();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSignature, setEditingSignature] = useState<EmailSignatureItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formBodyHtml, setFormBodyHtml] = useState("");
  const [formIsDefault, setFormIsDefault] = useState(false);

  const signatures = data?.data ?? [];
  const saving = createMutation.isPending || updateMutation.isPending;

  const openCreate = useCallback(() => {
    setEditingSignature(null);
    setFormName("");
    setFormBodyHtml("");
    setFormIsDefault(false);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((sig: EmailSignatureItem) => {
    setEditingSignature(sig);
    setFormName(sig.name);
    setFormBodyHtml(sig.bodyHtml);
    setFormIsDefault(sig.isDefault);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingSignature(null);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      if (editingSignature) {
        await updateMutation.mutateAsync({
          id: editingSignature.id,
          data: {
            name: formName,
            bodyHtml: formBodyHtml,
            isDefault: formIsDefault,
          },
        });
        toast.success("Signature updated");
      } else {
        await createMutation.mutateAsync({
          name: formName,
          bodyHtml: formBodyHtml,
          isDefault: formIsDefault,
        });
        toast.success("Signature created");
      }
      closeModal();
    } catch {
      toast.error("Failed to save signature");
    }
  }, [
    editingSignature,
    formName,
    formBodyHtml,
    formIsDefault,
    createMutation,
    updateMutation,
    closeModal,
  ]);

  const handleDelete = useCallback(
    async (sig: EmailSignatureItem) => {
      const ok = await confirm({
        title: "Delete Signature",
        message: `Are you sure you want to delete "${sig.name}"? This cannot be undone.`,
        type: "danger",
        confirmText: "Delete",
      });
      if (!ok) return;
      try {
        await deleteMutation.mutateAsync(sig.id);
        toast.success("Signature deleted");
      } catch {
        toast.error("Failed to delete signature");
      }
    },
    [confirm, deleteMutation],
  );

  if (isLoading) return <TableSkeleton title="Email Signatures" />;

  return (
    <div className="p-6">
      <PageHeader
        title="Email Signatures"
        actions={
          <Button variant="primary" onClick={openCreate}>
            <Icon name="plus" size={16} /> Add Signature
          </Button>
        }
      />

      {signatures.length === 0 ? (
        <EmptyState
          icon="edit"
          title="No signatures yet"
          description="Create your first email signature to get started."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signatures.map((sig: EmailSignatureItem) => (
            <div
              key={sig.id}
              className="rounded-lg border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">{sig.name}</h4>
                {sig.isDefault && (
                  <Badge variant="success">Default</Badge>
                )}
              </div>

              <div
                className="rounded border border-gray-100 p-3 text-sm overflow-hidden"
                style={{ maxHeight: 120 }}
                dangerouslySetInnerHTML={{ __html: sig.bodyHtml }}
              />

              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(sig)}
                >
                  <Icon name="edit" size={14} /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(sig)}
                >
                  <Icon name="trash-2" size={14} /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingSignature ? "Edit Signature" : "Create Signature"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={saving}
            >
              Save
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              value={formName}
              onChange={(v: string) => setFormName(v)}
            />
          </div>

          <RichTextEditor
            label="Signature HTML"
            value={formBodyHtml}
            onChange={(html: string) => setFormBodyHtml(html)}
          />

          <Switch
            label="Default signature"
            checked={formIsDefault}
            onChange={(v: boolean) => setFormIsDefault(v)}
          />
        </div>
      </Modal>

      <ConfirmDialogPortal />
    </div>
  );
}
