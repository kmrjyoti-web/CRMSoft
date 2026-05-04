// Pure TypeScript — no framework imports
// Source: core/ui-kit/angular/src/lib/control-library/models/confirm-dialog.model.ts

import { z } from "zod";

// ── Types ───────────────────────────────────────────────

export type DialogType = "info" | "success" | "warning" | "danger";

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

// ── Zod Schemas ─────────────────────────────────────────

export const DialogTypeSchema = z.enum([
  "info",
  "success",
  "warning",
  "danger",
]);

export const ConfirmDialogConfigSchema = z.object({
  title: z.string(),
  message: z.string(),
  type: DialogTypeSchema.optional(),
  confirmText: z.string().optional(),
  cancelText: z.string().optional(),
  showCancel: z.boolean().optional(),
});
