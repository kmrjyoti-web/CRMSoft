/**
 * React hooks barrel export.
 */

export { useFocusTrap } from "./useFocusTrap";
export { useScrollLock } from "./useScrollLock";
export { useAnimationState } from "./useAnimationState";
export type { UseAnimationStateReturn } from "./useAnimationState";
export { usePosition } from "./usePosition";
export type { UsePositionConfig } from "./usePosition";

// ── P0.3 Hooks (Zustand stores) ─────────────────────────
export { useFormStore } from "./useFormStore";
export type { FormStoreState } from "./useFormStore";
export { useConfirmDialog } from "./useConfirmDialog";
export type { ConfirmDialogState } from "./useConfirmDialog";
export { useTranslation } from "./useTranslation";
export type { TranslationState } from "./useTranslation";
export { useAiAssistant } from "./useAiAssistant";
export type { AiAssistantState } from "./useAiAssistant";
export { useToastStore } from "./useToast";
export type { Toast, ToastStoreState } from "./useToast";
export { useDialog } from "./useDialog";
export type { DialogState } from "./useDialog";

// ── P0.4 Hooks ──────────────────────────────────────────
export { useBaseControl } from "./useBaseControl";
