/**
 * RichTextEditor component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular rich-text-editor.component.ts
 */

import type { EditorConfig } from "../../../core/models/editor-config.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface RichTextEditorProps<
  OnChange = (html: string) => void,
> {
  /** Current HTML value. */
  value?: string;
  /** Default value for uncontrolled usage. */
  defaultValue?: string;
  /** Label text. */
  label?: string;
  /** Editor configuration (toolbar visibility and dropdown options). */
  editorConfig?: Partial<EditorConfig>;
  /** Whether the editor is disabled. */
  disabled?: boolean;
  /** Whether the field is required. */
  required?: boolean;
  /** Whether the field has a validation error. */
  error?: boolean;
  /** Error message to display. */
  errorMessage?: string;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** Change handler — fires with HTML string. */
  onChange?: OnChange;
}
