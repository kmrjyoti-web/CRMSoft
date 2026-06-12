/**
 * React AICFileUpload component.
 * Drag-and-drop dropzone, click to browse, image preview,
 * file info display, remove button.
 *
 * Source: Angular file-upload.component.ts
 */

import React, { useCallback, useState, useRef } from "react";
import {
  cn,
  GLOBAL_UI_CONFIG,
  isImageFile,
  isImageDataUrl,
  formatFileSize,
  readFileAsDataUrl,
} from "@coreui/ui";
import type { FileData } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FileUploadProps {
  /** Current file value (controlled). */
  value?: FileData | null;
  /** Label text displayed above the dropzone. */
  label?: string;
  /** Accepted file types (e.g. "image/*,.pdf"). */
  accept?: string;
  /** Maximum file size display text (e.g. "5MB"). */
  maxSize?: string;
  /** Whether the file upload is disabled. */
  disabled?: boolean;
  /** Whether the file upload is required. */
  required?: boolean;
  /** Whether the file upload is in an error state. */
  error?: boolean;
  /** Error message displayed below the dropzone when `error` is true. */
  errorMessage?: string;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** Change handler — fires with FileData or null on removal. */
  onChange?: (file: FileData | null) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICFileUpload with drag-and-drop, click-to-browse,
 * image preview, and file info display.
 */
export const AICFileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      label,
      accept,
      maxSize,
      disabled = false,
      required = false,
      error = false,
      errorMessage,
      className,
      id,
      onChange,
    } = props;

    // -----------------------------------------------------------------------
    // Controlled vs uncontrolled
    // -----------------------------------------------------------------------

    const isControlled = controlledValue !== undefined;
    const [internalFile, setInternalFile] = useState<FileData | null>(null);
    const currentFile = isControlled ? controlledValue : internalFile;

    // -----------------------------------------------------------------------
    // Drag state
    // -----------------------------------------------------------------------

    const [isDragOver, setIsDragOver] = useState(false);

    // -----------------------------------------------------------------------
    // Refs
    // -----------------------------------------------------------------------

    const fileInputRef = useRef<HTMLInputElement>(null);

    // -----------------------------------------------------------------------
    // File processing
    // -----------------------------------------------------------------------

    const processFile = useCallback(
      async (file: File) => {
        if (disabled) return;

        try {
          const data = await readFileAsDataUrl(file);
          const fileData: FileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            data,
          };

          if (!isControlled) {
            setInternalFile(fileData);
          }
          onChange?.(fileData);
        } catch {
          // FileReader error — silently ignore
        }
      },
      [disabled, isControlled, onChange],
    );

    // -----------------------------------------------------------------------
    // Event handlers
    // -----------------------------------------------------------------------

    const handleClick = useCallback(() => {
      if (disabled) return;
      fileInputRef.current?.click();
    }, [disabled]);

    const handleFileInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          processFile(file);
        }
        // Reset input so the same file can be re-selected
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      [processFile],
    );

    const handleDragOver = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
          setIsDragOver(true);
        }
      },
      [disabled],
    );

    const handleDragLeave = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
      },
      [],
    );

    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        if (file) {
          processFile(file);
        }
      },
      [disabled, processFile],
    );

    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isControlled) {
          setInternalFile(null);
        }
        onChange?.(null);
      },
      [isControlled, onChange],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      },
      [disabled],
    );

    // -----------------------------------------------------------------------
    // Derived state
    // -----------------------------------------------------------------------

    const hasFile = currentFile !== null && currentFile !== undefined;
    const showImagePreview =
      hasFile && isImageFile(currentFile.type) && isImageDataUrl(currentFile.data);

    // -----------------------------------------------------------------------
    // Styles
    // -----------------------------------------------------------------------

    const containerClasses = cn(
      GLOBAL_UI_CONFIG.container,
      className,
    );

    const dropzoneClasses = cn(
      GLOBAL_UI_CONFIG.fileUploadDropzone,
      isDragOver && "border-primary bg-blue-50",
      error && "border-danger",
      disabled && "opacity-50 cursor-not-allowed hover:border-gray-300 hover:bg-white",
    );

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
      <div className={containerClasses} ref={ref} data-testid="file-upload">
        {/* Label */}
        {label && (
          <label
            className="block text-sm font-medium text-gray-700 mb-1.5"
            htmlFor={id}
          >
            {label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          className="hidden"
          onChange={handleFileInputChange}
          id={id}
          data-testid="file-upload-input"
        />

        {/* Dropzone */}
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          className={dropzoneClasses}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={handleKeyDown}
          aria-disabled={disabled || undefined}
          data-testid="file-upload-dropzone"
        >
          {hasFile ? (
            /* ── File preview state ──────────────────────── */
            <div className="relative" data-testid="file-upload-preview">
              {showImagePreview ? (
                /* Image preview */
                <img
                  src={currentFile.data}
                  alt={currentFile.name}
                  className={GLOBAL_UI_CONFIG.fileUploadPreview}
                  data-testid="file-upload-image-preview"
                />
              ) : (
                /* Non-image file icon + name */
                <div
                  className="flex flex-col items-center gap-2 py-4"
                  data-testid="file-upload-file-icon"
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400"
                    aria-hidden="true"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                    {currentFile.name}
                  </span>
                </div>
              )}

              {/* File info */}
              <div className="mt-2 text-xs text-gray-500">
                <span>{currentFile.name}</span>
                <span className="mx-1">&middot;</span>
                <span>{formatFileSize(currentFile.size)}</span>
              </div>

              {/* Remove button */}
              {!disabled && (
                <button
                  type="button"
                  className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                  onClick={handleRemove}
                  aria-label="Remove file"
                  data-testid="file-upload-remove"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            /* ── Empty state ─────────────────────────────── */
            <div
              className="flex flex-col items-center gap-2"
              data-testid="file-upload-empty"
            >
              {/* Upload icon */}
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>

              <p className="text-sm text-gray-600">
                <span className="font-semibold text-primary">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>

              {/* Accept info */}
              {(accept || maxSize) && (
                <p className="text-xs text-gray-400">
                  {accept && <span>{accept}</span>}
                  {accept && maxSize && <span className="mx-1">&middot;</span>}
                  {maxSize && <span>Max {maxSize}</span>}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && errorMessage && (
          <span
            id={id ? `${id}-error` : undefined}
            className={GLOBAL_UI_CONFIG.error}
            role="alert"
            data-testid="file-upload-error"
          >
            {errorMessage}
          </span>
        )}
      </div>
    );
  },
);

AICFileUpload.displayName = "AICFileUpload";
