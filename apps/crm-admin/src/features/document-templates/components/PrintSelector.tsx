"use client";

import { useState, useCallback } from "react";
import { Icon, Button, Card, Badge, Modal } from "@/components/ui";
import { TemplatePreview } from "./TemplatePreview";
import { useTemplatesByType, usePreviewTemplate, useDownloadPdf } from "../hooks/useDocumentTemplates";
import type { DocumentTemplate } from "../types/document-template.types";

interface PrintSelectorProps {
  /** Document type, e.g. "INVOICE", "QUOTATION" */
  documentType: string;
  /** The entity ID to generate the document for */
  entityId: string;
  /** Data to use for preview (optional, uses sample data if not provided) */
  previewData?: Record<string, unknown>;
  /** Callback after PDF download completes */
  onDownloaded?: () => void;
}

export function PrintSelector({
  documentType,
  entityId,
  previewData,
  onDownloaded,
}: PrintSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const { data: templatesRes, isLoading } = useTemplatesByType(documentType);
  const previewMutation = usePreviewTemplate();
  const downloadMutation = useDownloadPdf();

  const templates: DocumentTemplate[] = (templatesRes?.data ?? []) as DocumentTemplate[];

  // Auto-select default template
  const defaultTemplate = templates.find((t) => t.isDefault);
  const activeId = selectedId ?? defaultTemplate?.id ?? templates[0]?.id ?? null;

  const handlePreview = useCallback(() => {
    if (!activeId) return;
    previewMutation.mutate(
      {
        templateId: activeId,
        sampleData: previewData,
      },
      {
        onSuccess: (res) => {
          const html = (res?.data ?? "") as string;
          setPreviewHtml(html);
          setShowPreview(true);
        },
      },
    );
  }, [activeId, previewData, previewMutation]);

  const handleDownload = useCallback(() => {
    if (!activeId) return;
    downloadMutation.mutate(
      {
        templateId: activeId,
        entityId,
        entityType: documentType,
      },
      {
        onSuccess: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${documentType.toLowerCase()}-${entityId}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          onDownloaded?.();
        },
      },
    );
  }, [activeId, entityId, documentType, downloadMutation, onDownloaded]);

  const handlePrint = useCallback(() => {
    if (!activeId) return;
    previewMutation.mutate(
      {
        templateId: activeId,
        sampleData: previewData,
      },
      {
        onSuccess: (res) => {
          const html = (res?.data ?? "") as string;
          const printWindow = window.open("", "_blank");
          if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
          }
        },
      },
    );
  }, [activeId, previewData, previewMutation]);

  if (isLoading) {
    return (
      <div className="text-center py-4 text-muted">
        <Icon name="loader" size={20} /> Loading templates...
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <Icon name="file-x" size={32} />
        <p className="mt-2 mb-0">No templates available for this document type.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Template grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {templates.map((tpl) => (
          <Card
            key={tpl.id}
            style={{
              cursor: "pointer",
              border: activeId === tpl.id ? "2px solid var(--primary, #2563eb)" : "1px solid #dee2e6",
              transition: "border-color 0.15s",
            }}
            onClick={() => setSelectedId(tpl.id)}
          >
            <div className="p-3 text-center">
              <div
                style={{
                  height: 80,
                  background: "#f8f9fa",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                {tpl.thumbnailUrl ? (
                  <img
                    src={tpl.thumbnailUrl}
                    alt={tpl.name}
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <Icon name="file-text" size={32} />
                )}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{tpl.name}</div>
              {tpl.isDefault && (
                <Badge variant="success">
                  Default
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Action buttons */}
      <div className="d-flex gap-2">
        <Button
          variant="outline"
          onClick={handlePreview}
          disabled={!activeId || previewMutation.isPending}
        >
          <Icon name="eye" size={14} />{" "}
          {previewMutation.isPending ? "Loading..." : "Preview"}
        </Button>
        <Button
          variant="primary"
          onClick={handleDownload}
          disabled={!activeId || downloadMutation.isPending}
        >
          <Icon name="download" size={14} />{" "}
          {downloadMutation.isPending ? "Generating..." : "Download PDF"}
        </Button>
        <Button
          variant="outline"
          onClick={handlePrint}
          disabled={!activeId || previewMutation.isPending}
        >
          <Icon name="printer" size={14} /> Print
        </Button>
      </div>

      {/* Preview Modal */}
      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Document Preview"
        size="xl"
      >
        <div style={{ height: 700 }}>
          <TemplatePreview html={previewHtml} />
        </div>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleDownload} disabled={downloadMutation.isPending}>
            <Icon name="download" size={14} /> Download PDF
          </Button>
        </div>
      </Modal>
    </div>
  );
}
