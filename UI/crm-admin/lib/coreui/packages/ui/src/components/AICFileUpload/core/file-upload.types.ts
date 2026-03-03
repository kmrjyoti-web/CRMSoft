/**
 * FileUpload component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular file-upload.component.ts
 */

// ---------------------------------------------------------------------------
// FileData
// ---------------------------------------------------------------------------

/** Represents a selected file's metadata and data URL content. */
export interface FileData {
  /** Original file name. */
  name: string;
  /** File size in bytes. */
  size: number;
  /** MIME type (e.g. "image/png", "application/pdf"). */
  type: string;
  /** Data URL representation of the file content. */
  data: string;
}

// ---------------------------------------------------------------------------
// FileUploadProps
// ---------------------------------------------------------------------------

/**
 * Core props for the FileUpload component.
 *
 * `OnChange` is purposely generic so each framework adapter can supply its
 * own event type (e.g. React callback, Angular EventEmitter, etc.).
 */
export interface FileUploadProps<
  OnChange = (file: FileData | null) => void,
> {
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
  onChange?: OnChange;
}
