import type { MaskingMeta } from "../types/table-config.types";

/**
 * Check if a column is masked in a record's masking metadata.
 */
export function isColumnMasked(
  meta: MaskingMeta | undefined,
  columnId: string,
): boolean {
  return meta?.[columnId]?.masked ?? false;
}

/**
 * Check if a masked column can be unmasked.
 */
export function canUnmaskColumn(
  meta: MaskingMeta | undefined,
  columnId: string,
): boolean {
  return meta?.[columnId]?.canUnmask ?? false;
}

/**
 * Extract masking meta from a record (API adds _maskingMeta field).
 */
export function extractMaskingMeta(
  record: Record<string, unknown>,
): MaskingMeta | undefined {
  return record._maskingMeta as MaskingMeta | undefined;
}

/**
 * Client-side mask display for a string value.
 * Mirrors the backend maskValue logic in data-masking.service.ts.
 */
export function maskDisplayValue(
  value: string,
  maskType: "FULL" | "PARTIAL",
): string {
  if (maskType === "FULL") return "****";

  // Email
  if (value.includes("@")) {
    const [local, domain] = value.split("@");
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local[0]}${"*".repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}@${domain}`;
  }

  // Phone (8+ chars)
  if (value.length >= 8) {
    const maskedLen = Math.min(value.length - 6, 6);
    return value.slice(0, 2) + "*".repeat(maskedLen) + value.slice(-4);
  }

  // Short (4-7 chars)
  if (value.length >= 4) return value[0] + "***" + value.slice(-2);

  return "****";
}
