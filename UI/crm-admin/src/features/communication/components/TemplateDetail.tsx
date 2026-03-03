"use client";

import { useState, useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { Button, Icon, Badge, Modal } from "@/components/ui";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { formatDate } from "@/lib/format-date";

import { useTemplateDetail, usePreviewTemplate } from "../hooks/useCommunication";

// ── Component ────────────────────────────────────────────

export function TemplateDetail({ templateId }: { templateId: string }) {
  const router = useRouter();

  const { data, isLoading } = useTemplateDetail(templateId);
  const previewMutation = usePreviewTemplate();

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");

  const template = data?.data;

  const handlePreview = useCallback(async () => {
    if (!template) return;
    try {
      const result = await previewMutation.mutateAsync({
        id: templateId,
      });
      setPreviewSubject(result.data.subject);
      setPreviewHtml(result.data.bodyHtml);
      setShowPreviewModal(true);
    } catch {
      toast.error("Failed to generate preview");
    }
  }, [template, previewMutation, templateId]);

  // -- Loading / Not found ---------------------------------------------------

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!template) {
    return (
      <div className="p-6">
        <EmptyState
          icon="file-text"
          title="Template not found"
          description="The template you are looking for does not exist."
          action={{
            label: "Back to Templates",
            onClick: () => router.push("/communication/templates"),
          }}
        />
      </div>
    );
  }

  // -- Render ----------------------------------------------------------------

  return (
    <div className="p-6">
      <PageHeader
        title={template.name}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
            <Button
              variant="outline"
              onClick={handlePreview}
              loading={previewMutation.isPending}
            >
              <Icon name="eye" size={16} /> Preview
            </Button>
            <Link href={`/communication/templates/${templateId}/edit`}>
              <Button variant="outline">
                <Icon name="edit" size={16} /> Edit
              </Button>
            </Link>
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Template Information
            </h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-gray-500">Category</dt>
                <dd className="mt-1">
                  <Badge variant="primary">{template.category}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Subject</dt>
                <dd className="mt-1 font-medium">{template.subject}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Description</dt>
                <dd className="mt-1 whitespace-pre-wrap">
                  {template.description ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Shared</dt>
                <dd className="mt-1">
                  <Badge variant={template.isShared ? "success" : "secondary"}>
                    {template.isShared ? "Yes" : "No"}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Variables</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {template.variables && template.variables.length > 0 ? (
                    template.variables.map((v) => (
                      <Badge key={v} variant="outline">
                        {v}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Created At</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(template.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Updated At</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(template.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Sidebar — Body preview */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Preview
            </h3>
            <div
              className="rounded border border-gray-100 p-3 overflow-auto"
              style={{ maxHeight: 400 }}
              dangerouslySetInnerHTML={{ __html: template.bodyHtml }}
            />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        open={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Template Preview"
        size="lg"
        footer={
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowPreviewModal(false)}
            >
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Subject</dt>
            <dd className="mt-1 text-sm font-medium">{previewSubject}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Body</dt>
            <dd
              className="mt-1 rounded border border-gray-100 p-3 overflow-auto"
              style={{ maxHeight: 400 }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
