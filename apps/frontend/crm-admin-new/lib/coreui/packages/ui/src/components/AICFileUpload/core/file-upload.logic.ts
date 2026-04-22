/**
 * FileUpload state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular file-upload.component.ts — exact port of logic.
 */

// ---------------------------------------------------------------------------
// Image detection
// ---------------------------------------------------------------------------

/**
 * Checks whether a MIME type represents an image file.
 *
 * @param type - The MIME type string (e.g. "image/png").
 * @returns `true` if the type starts with "image".
 */
export function isImageFile(type: string): boolean {
  return type.startsWith("image");
}

/**
 * Checks whether a data URL represents an image.
 *
 * @param url - The data URL string.
 * @returns `true` if the URL starts with "data:image".
 */
export function isImageDataUrl(url: string): boolean {
  return url.startsWith("data:image");
}

// ---------------------------------------------------------------------------
// File size formatting
// ---------------------------------------------------------------------------

/**
 * Formats a byte count to a human-readable string.
 *
 * @param bytes - The file size in bytes.
 * @returns A formatted string (e.g. "1.5 MB", "256 KB", "512 B").
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${bytes} B`;
}

// ---------------------------------------------------------------------------
// FileReader wrapper
// ---------------------------------------------------------------------------

/**
 * Reads a File object as a data URL using the FileReader API.
 * Returns a Promise that resolves with the data URL string.
 *
 * @param file - The File object to read.
 * @returns A promise resolving to the data URL string.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
