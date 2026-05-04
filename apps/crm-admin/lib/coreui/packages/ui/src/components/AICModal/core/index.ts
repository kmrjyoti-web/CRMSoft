/**
 * Core Modal module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  ModalSize,
  ModalMode,
  ModalProps,
} from "./modal.types";

// Variant, size & mode style maps
export {
  modalSizeStyles,
  modalModeBaseStyles,
  modalModeAnimations,
} from "./modal.variants";

// Style composition
export {
  getModalOverlayStyles,
  getModalContentStyles,
  getModalHeaderStyles,
  getModalBodyStyles,
  getModalFooterStyles,
  getModalCloseButtonStyles,
} from "./modal.styles";
export type {
  GetModalOverlayStylesConfig,
  GetModalContentStylesProps,
} from "./modal.styles";

// State logic
export {
  modalReducer,
  initialModalState,
  resolveModalMode,
} from "./modal.logic";
export type {
  ModalAction,
  ModalReducerConfig,
  ModalInternalState,
  ModalLayoutHints,
} from "./modal.logic";

// Accessibility
export {
  getModalA11yProps,
  getModalKeyboardHandlers,
} from "./modal.a11y";
export type {
  ModalA11yInput,
  ModalA11yProps,
} from "./modal.a11y";

// Schema & defaults
export {
  modalPropsSchema,
  resolveModalDefaults,
} from "./modal.schema";
export type {
  ModalPropsSchemaInput,
  ModalPropsSchemaOutput,
} from "./modal.schema";
