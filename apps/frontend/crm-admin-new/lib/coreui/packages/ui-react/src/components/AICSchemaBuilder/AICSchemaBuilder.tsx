/**
 * React AICSchemaBuilder component.
 * Interactive form schema editor with upload, AI generation, preview, and drag-and-drop.
 */

import React, { useState, useCallback, useRef } from "react";

import { cn } from "@coreui/ui";
import type {
  FormSchema,
  FormFieldConfig,
  RowConfig,
} from "@coreui/ui";

import { AICFieldEditor } from "./AICFieldEditor";

// ── Props ───────────────────────────────────────────────

export interface SchemaBuilderProps {
  /** Initial schema to display in preview mode. */
  initialSchema?: FormSchema | null;
  /** Callback when the schema changes (field edits, drag-and-drop reorder). */
  onSchemaChange?: (schema: FormSchema) => void;
  /** Callback when the user clicks Download JSON. Falls back to browser download. */
  onDownload?: (schema: FormSchema) => void;
  /** AI generation from uploaded images. */
  onGenerateFromImage?: (images: Array<{ data: string; mimeType: string }>) => Promise<FormSchema>;
  /** AI generation from pasted HTML snippet. */
  onGenerateFromHtml?: (html: string) => Promise<FormSchema>;
  /** Additional CSS class names. */
  className?: string;
}

// ── Helpers (from core logic) ───────────────────────────

function getPreviewRows(schema: FormSchema | null): RowConfig[] {
  if (!schema) return [];
  if (schema.layout === "tabs" && schema.tabs && schema.tabs.length > 0) {
    return schema.tabs[0].rows ?? [];
  }
  return schema.rows ?? [];
}

function getHeaderRows(schema: FormSchema | null): RowConfig[] {
  if (!schema) return [];
  if (schema.layout === "tabs" && schema.rows) {
    return schema.rows;
  }
  return [];
}

function moveField(
  schema: FormSchema,
  fromRowIdx: number,
  fromColIdx: number,
  toRowIdx: number,
  toColIdx: number,
): FormSchema {
  const newSchema = JSON.parse(JSON.stringify(schema)) as FormSchema;

  let rows: RowConfig[];
  if (newSchema.layout === "tabs" && newSchema.tabs && newSchema.tabs.length > 0) {
    rows = newSchema.tabs[0].rows;
  } else {
    rows = newSchema.rows ?? [];
  }

  if (!rows) return newSchema;

  const sourceRow = rows[fromRowIdx];
  const targetRow = rows[toRowIdx];
  if (!sourceRow || !targetRow) return newSchema;

  const itemToMove = sourceRow.columns[fromColIdx];
  sourceRow.columns.splice(fromColIdx, 1);
  targetRow.columns.splice(toColIdx, 0, itemToMove);

  return newSchema;
}

function downloadSchemaAsJson(schema: FormSchema): void {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(schema, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", "form-schema.json");
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// ── Component ───────────────────────────────────────────

export const AICSchemaBuilder: React.FC<SchemaBuilderProps> = ({
  initialSchema = null,
  onSchemaChange,
  onDownload,
  onGenerateFromImage,
  onGenerateFromHtml,
  className,
}) => {
  // ── State ───────────────────────────────────────────────
  const [schema, setSchema] = useState<FormSchema | null>(initialSchema);
  const [loading, setLoading] = useState(false);
  const [selectedField, setSelectedField] = useState<FormFieldConfig | null>(null);
  const [isTabbedMode, setIsTabbedMode] = useState(false);
  const [htmlInput, setHtmlInput] = useState("");
  const [draggedItem, setDraggedItem] = useState<{
    rowIndex: number;
    colIndex: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Schema update helper ────────────────────────────────
  const updateSchema = useCallback(
    (newSchema: FormSchema) => {
      setSchema(newSchema);
      onSchemaChange?.(newSchema);
    },
    [onSchemaChange],
  );

  // ── File upload handler ─────────────────────────────────
  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !onGenerateFromImage) return;

      setLoading(true);
      try {
        const images: Array<{ data: string; mimeType: string }> = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          images.push({ data, mimeType: file.type });
        }

        const generatedSchema = await onGenerateFromImage(images);
        if (isTabbedMode) {
          generatedSchema.layout = "tabs";
        }
        updateSchema(generatedSchema);
      } finally {
        setLoading(false);
      }
    },
    [onGenerateFromImage, isTabbedMode, updateSchema],
  );

  // ── HTML generation handler ─────────────────────────────
  const handleGenerateFromHtml = useCallback(async () => {
    if (!htmlInput.trim() || !onGenerateFromHtml) return;

    setLoading(true);
    try {
      const generatedSchema = await onGenerateFromHtml(htmlInput);
      if (isTabbedMode) {
        generatedSchema.layout = "tabs";
      }
      updateSchema(generatedSchema);
    } finally {
      setLoading(false);
    }
  }, [htmlInput, onGenerateFromHtml, isTabbedMode, updateSchema]);

  // ── Download handler ────────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!schema) return;
    if (onDownload) {
      onDownload(schema);
    } else {
      downloadSchemaAsJson(schema);
    }
  }, [schema, onDownload]);

  // ── Reset handler ───────────────────────────────────────
  const handleReset = useCallback(() => {
    setSchema(null);
    setSelectedField(null);
    setHtmlInput("");
    setIsTabbedMode(false);
  }, []);

  // ── Field selection handler ─────────────────────────────
  const handleFieldSelect = useCallback((field: FormFieldConfig) => {
    setSelectedField((prev) => (prev?.key === field.key ? null : field));
  }, []);

  // ── Field change callback ──────────────────────────────
  const handleFieldChange = useCallback(() => {
    if (schema) {
      onSchemaChange?.(schema);
    }
  }, [schema, onSchemaChange]);

  // ── Drag & Drop handlers ──────────────────────────────
  const handleDragStart = useCallback(
    (rowIndex: number, colIndex: number) => (e: React.DragEvent) => {
      setDraggedItem({ rowIndex, colIndex });
      e.dataTransfer.effectAllowed = "move";
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (toRowIndex: number, toColIndex: number) => (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggedItem || !schema) return;

      const newSchema = moveField(
        schema,
        draggedItem.rowIndex,
        draggedItem.colIndex,
        toRowIndex,
        toColIndex,
      );
      updateSchema(newSchema);
      setDraggedItem(null);
    },
    [draggedItem, schema, updateSchema],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  // ── Drop zone handlers ────────────────────────────────
  const handleDropZoneDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload],
  );

  const handleDropZoneDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // ── Derived data ──────────────────────────────────────
  const previewRows = getPreviewRows(schema);
  const headerRows = getHeaderRows(schema);
  const hasSchema = schema !== null;

  // ── Render: Row of fields ─────────────────────────────
  const renderRow = (row: RowConfig, rowIndex: number, isHeader = false) => (
    <div
      key={rowIndex}
      className="flex flex-wrap gap-4"
      data-testid={isHeader ? `header-row-${rowIndex}` : `preview-row-${rowIndex}`}
    >
      {row.columns.map((col, colIndex) => (
        <div
          key={col.field.key}
          className={cn(
            "flex-1 min-w-[200px] p-2 rounded-lg border cursor-pointer transition-all",
            selectedField?.key === col.field.key
              ? "ring-2 ring-primary border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
          )}
          data-testid={`field-wrapper-${col.field.key}`}
          draggable={!isHeader}
          onDragStart={
            !isHeader ? handleDragStart(rowIndex, colIndex) : undefined
          }
          onDragOver={!isHeader ? handleDragOver : undefined}
          onDrop={
            !isHeader ? handleDrop(rowIndex, colIndex) : undefined
          }
          onDragEnd={!isHeader ? handleDragEnd : undefined}
          onClick={() => handleFieldSelect(col.field)}
        >
          {/* Field preview (non-interactive) */}
          <div className="pointer-events-none">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {col.field.label}
              {col.field.validators?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <div className="text-xs text-gray-500 mb-1">
              [{col.field.type}] &mdash; {col.field.key}
            </div>
            <div
              className="h-8 bg-gray-100 rounded border border-gray-200 flex items-center px-2 text-sm text-gray-400"
              data-testid={`field-preview-${col.field.key}`}
            >
              {col.field.placeholder || col.field.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── Render ────────────────────────────────────────────
  return (
    <div
      className={cn("flex h-full", className)}
      data-testid="schema-builder"
    >
      {/* ── Left Panel: Builder / Preview ──────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white"
          data-testid="schema-builder-toolbar"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Schema Builder
            </h2>
            <span
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full",
                hasSchema
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700",
              )}
              data-testid="mode-badge"
            >
              {hasSchema ? "Edit" : "Upload"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasSchema && (
              <>
                <button
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  onClick={handleDownload}
                  data-testid="download-btn"
                >
                  Download JSON
                </button>
                <button
                  className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                  onClick={handleReset}
                  data-testid="reset-btn"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 relative">
          {/* Loading Overlay */}
          {loading && (
            <div
              className="absolute inset-0 bg-white/80 flex items-center justify-center z-10"
              data-testid="loading-overlay"
            >
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="animate-spin h-8 w-8 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  data-testid="loading-spinner"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span className="text-sm text-gray-500">
                  Generating schema...
                </span>
              </div>
            </div>
          )}

          {!hasSchema ? (
            /* ── Upload State ───────────────────────────── */
            <div
              className="max-w-2xl mx-auto space-y-6"
              data-testid="upload-state"
            >
              {/* Mode Toggle */}
              <div
                className="flex items-center gap-4"
                data-testid="mode-toggle"
              >
                <span className="text-sm font-medium text-gray-700">
                  Layout:
                </span>
                <button
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-colors",
                    !isTabbedMode
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  )}
                  onClick={() => setIsTabbedMode(false)}
                  data-testid="mode-single-page"
                >
                  Single Page
                </button>
                <button
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-colors",
                    isTabbedMode
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  )}
                  onClick={() => setIsTabbedMode(true)}
                  data-testid="mode-tabbed-view"
                >
                  Tabbed View
                </button>
              </div>

              {/* File Upload Drop Zone */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onDrop={handleDropZoneDrop}
                onDragOver={handleDropZoneDragOver}
                onClick={() => fileInputRef.current?.click()}
                data-testid="file-upload-area"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  data-testid="file-input"
                />
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="h-10 w-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">
                    Drop images here or click to upload
                  </p>
                  <p className="text-xs text-gray-500">
                    Upload form screenshots to generate schema via AI
                  </p>
                </div>
              </div>

              {/* HTML Paste Area */}
              <div className="space-y-3" data-testid="html-paste-area">
                <label className="block text-sm font-medium text-gray-700">
                  Or paste HTML snippet
                </label>
                <textarea
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y"
                  placeholder="Paste your HTML form snippet here..."
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                  data-testid="html-input"
                />
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    htmlInput.trim()
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed",
                  )}
                  disabled={!htmlInput.trim()}
                  onClick={handleGenerateFromHtml}
                  data-testid="generate-html-btn"
                >
                  Generate from HTML
                </button>
              </div>
            </div>
          ) : (
            /* ── Preview State ──────────────────────────── */
            <div className="space-y-4" data-testid="preview-state">
              {/* Schema Title & Description */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3
                  className="text-lg font-semibold text-gray-900"
                  data-testid="preview-title"
                >
                  {schema.title}
                </h3>
                {schema.description && (
                  <p
                    className="text-sm text-gray-500 mt-1"
                    data-testid="preview-description"
                  >
                    {schema.description}
                  </p>
                )}
              </div>

              {/* Header Rows (for tabbed layout) */}
              {headerRows.length > 0 && (
                <div
                  className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-3"
                  data-testid="header-section"
                >
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Header Fields
                  </h4>
                  {headerRows.map((row, idx) => renderRow(row, idx, true))}
                </div>
              )}

              {/* Tab Navigation Mock (for tabbed layout) */}
              {schema.layout === "tabs" &&
                schema.tabs &&
                schema.tabs.length > 0 && (
                  <div
                    className="flex border-b border-gray-200"
                    data-testid="tab-navigation"
                  >
                    {schema.tabs.map((tab, idx) => (
                      <div
                        key={tab.id}
                        className={cn(
                          "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                          idx === 0
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700",
                        )}
                        data-testid={`tab-${tab.id}`}
                      >
                        {tab.label}
                      </div>
                    ))}
                  </div>
                )}

              {/* Main Content Rows */}
              <div
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-3"
                data-testid="preview-content"
              >
                {previewRows.length > 0 ? (
                  previewRows.map((row, idx) => renderRow(row, idx))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No fields in this schema
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Panel: Field Editor ──────────────────── */}
      <AICFieldEditor
        field={selectedField}
        onFieldChange={handleFieldChange}
      />
    </div>
  );
};

AICSchemaBuilder.displayName = "AICSchemaBuilder";
