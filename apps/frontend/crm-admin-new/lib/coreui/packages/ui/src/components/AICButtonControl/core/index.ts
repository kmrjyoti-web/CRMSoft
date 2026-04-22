/**
 * Core ButtonControl module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  ButtonType,
  ButtonOption,
  ButtonControlProps,
} from "./button-control.types";

// Logic
export { isActiveOption } from "./button-control.logic";
