/**
 * RichTextEditor state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular rich-text-editor.component.ts — exact port of editing logic.
 */

import type { EditorConfig } from "../../../core/models/editor-config.types";
import { DEFAULT_EDITOR_CONFIG } from "../../../core/models/editor-config.types";

// ---------------------------------------------------------------------------
// ToolbarCommand — all supported execCommand names + custom ones
// ---------------------------------------------------------------------------

export type ToolbarCommand =
  | "undo"
  | "redo"
  | "bold"
  | "italic"
  | "underline"
  | "strikeThrough"
  | "justifyLeft"
  | "justifyCenter"
  | "justifyRight"
  | "justifyFull"
  | "outdent"
  | "indent"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "subscript"
  | "superscript"
  | "inlineCode"
  | "formatBlock"
  | "fontName"
  | "fontSize"
  | "foreColor"
  | "hiliteColor";

// ---------------------------------------------------------------------------
// execCommand — wraps document.execCommand with special handling for inlineCode
// Port of Angular's onToolbarClick with inlineCode branch
// ---------------------------------------------------------------------------

export function execCommand(command: string, value?: string): void {
  if (command === "inlineCode") {
    // Wrap selection in <code> tag via insertHTML
    const selection = document.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      document.execCommand(
        "insertHTML",
        false,
        `<code style="background:#f0f0f0;padding:2px 4px;border-radius:3px;font-family:monospace">${selectedText}</code>`,
      );
    }
    return;
  }

  document.execCommand(command, false, value);
}

// ---------------------------------------------------------------------------
// mergeEditorConfig — merges partial config with DEFAULT_EDITOR_CONFIG
// ---------------------------------------------------------------------------

export function mergeEditorConfig(
  custom?: Partial<EditorConfig>,
): EditorConfig {
  if (!custom) return { ...DEFAULT_EDITOR_CONFIG };

  return {
    showToolbar: {
      ...DEFAULT_EDITOR_CONFIG.showToolbar,
      ...custom.showToolbar,
    },
    dropdownOptions: {
      templates: custom.dropdownOptions?.templates ?? DEFAULT_EDITOR_CONFIG.dropdownOptions.templates,
      headings: custom.dropdownOptions?.headings ?? DEFAULT_EDITOR_CONFIG.dropdownOptions.headings,
      fonts: custom.dropdownOptions?.fonts ?? DEFAULT_EDITOR_CONFIG.dropdownOptions.fonts,
      fontSizes: custom.dropdownOptions?.fontSizes ?? DEFAULT_EDITOR_CONFIG.dropdownOptions.fontSizes,
    },
  };
}

// ---------------------------------------------------------------------------
// cleanEditorHtml — returns '' for empty editor content
// Port of Angular's clean check for <br> / <div><br></div>
// ---------------------------------------------------------------------------

export function cleanEditorHtml(html: string): string {
  const trimmed = html.trim();
  if (
    !trimmed ||
    trimmed === "<br>" ||
    trimmed === "<div><br></div>" ||
    trimmed === "<p><br></p>"
  ) {
    return "";
  }
  return trimmed;
}
