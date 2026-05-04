/**
 * Modal accessibility helpers.
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides ARIA attribute objects and keyboard-to-action mappings that
 * framework adapters can spread onto DOM elements and wire into event handlers.
 */

import type { ModalAction } from "./modal.logic";

// ---------------------------------------------------------------------------
// Modal element ARIA props
// ---------------------------------------------------------------------------

/** Props consumed by `getModalA11yProps`. */
export interface ModalA11yInput {
  id: string;
  title?: string;
  description?: string;
}

/** Shape of the object returned by `getModalA11yProps`. */
export interface ModalA11yProps {
  role: string;
  "aria-modal": boolean;
  id: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

/**
 * Computes the ARIA attributes for the Modal dialog element.
 *
 * - `role="dialog"` marks the element as a dialog.
 * - `aria-modal=true` indicates it is a modal dialog, preventing
 *   assistive technologies from interacting with content behind it.
 * - `aria-labelledby` references the title element's ID when a title
 *   is provided.
 * - `aria-describedby` references the description element's ID when
 *   a description is provided.
 */
export function getModalA11yProps(input: ModalA11yInput): ModalA11yProps {
  const props: ModalA11yProps = {
    role: "dialog",
    "aria-modal": true,
    id: input.id,
  };

  if (input.title) {
    props["aria-labelledby"] = `${input.id}-title`;
  }

  if (input.description) {
    props["aria-describedby"] = `${input.id}-description`;
  }

  return props;
}

// ---------------------------------------------------------------------------
// Keyboard handlers
// ---------------------------------------------------------------------------

/**
 * Returns a mapping from keyboard key values to the `ModalAction` type
 * that should be dispatched when that key is pressed.
 *
 * Only the Escape key is mapped, triggering the ESCAPE action.
 */
export function getModalKeyboardHandlers(): Record<string, ModalAction["type"]> {
  return {
    Escape: "ESCAPE",
  };
}
