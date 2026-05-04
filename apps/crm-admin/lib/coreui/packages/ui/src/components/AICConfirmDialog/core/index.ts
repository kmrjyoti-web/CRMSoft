/**
 * Core ConfirmDialog module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  ConfirmDialogProps,
  DialogType,
  ConfirmDialogConfig,
} from "./confirm-dialog.types";

// Logic
export {
  getDialogIconBgClass,
  getDialogIconTextClass,
  getDialogConfirmButtonClass,
  getDialogIconName,
} from "./confirm-dialog.logic";
