/**
 * React AICRichTextEditor component.
 * ContentEditable WYSIWYG editor with two toolbar rows,
 * code view toggle, color pickers, and dropdown selects.
 *
 * Source: Angular rich-text-editor.component.ts
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  cn,
  GLOBAL_UI_CONFIG,
  DEFAULT_EDITOR_CONFIG,
  execCommand,
  mergeEditorConfig,
  cleanEditorHtml,
} from "@coreui/ui";
import type { EditorConfig } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface RichTextEditorProps {
  value?: string;
  defaultValue?: string;
  label?: string;
  editorConfig?: Partial<EditorConfig>;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  className?: string;
  id?: string;
  onChange?: (html: string) => void;
}

// ---------------------------------------------------------------------------
// Toolbar button helper
// ---------------------------------------------------------------------------

interface ToolbarButtonProps {
  command: string;
  label: string;
  value?: string;
  disabled?: boolean;
}

function AICToolbarButton({ command, label, value, disabled }: ToolbarButtonProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (disabled) return;
      execCommand(command, value);
    },
    [command, value, disabled],
  );

  return (
    <button
      type="button"
      className={GLOBAL_UI_CONFIG.editorBtn}
      onClick={handleClick}
      disabled={disabled}
      title={label}
      data-testid={`editor-btn-${command}`}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICRichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = "",
      label,
      editorConfig: customConfig,
      disabled = false,
      required = false,
      error = false,
      errorMessage,
      className,
      id,
      onChange,
    } = props;

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = isControlled ? controlledValue : internalValue;

    const [isCodeView, setIsCodeView] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const savedSelectionRef = useRef<Range | null>(null);

    const config: EditorConfig = useMemo(
      () => mergeEditorConfig(customConfig),
      [customConfig],
    );

    // ── Sync controlled value to contentEditable ──────────
    useEffect(() => {
      if (isControlled && editorRef.current && !isCodeView) {
        if (editorRef.current.innerHTML !== controlledValue) {
          editorRef.current.innerHTML = controlledValue ?? "";
        }
      }
    }, [controlledValue, isControlled, isCodeView]);

    // ── Set initial value ─────────────────────────────────
    useEffect(() => {
      if (editorRef.current && currentValue) {
        editorRef.current.innerHTML = currentValue;
      }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Save / Restore selection (for color pickers) ──────
    const saveSelection = useCallback(() => {
      const sel = document.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
      }
    }, []);

    const restoreSelection = useCallback(() => {
      const sel = document.getSelection();
      if (sel && savedSelectionRef.current) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }, []);

    // ── onInput handler ───────────────────────────────────
    const handleInput = useCallback(() => {
      if (!editorRef.current) return;
      const raw = editorRef.current.innerHTML;
      const cleaned = cleanEditorHtml(raw);
      if (!isControlled) {
        setInternalValue(cleaned);
      }
      onChange?.(cleaned);
    }, [isControlled, onChange]);

    // ── Code view textarea change ─────────────────────────
    const handleCodeChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        if (!isControlled) {
          setInternalValue(val);
        }
        onChange?.(val);
      },
      [isControlled, onChange],
    );

    // ── Toggle code view ──────────────────────────────────
    const toggleCodeView = useCallback(() => {
      if (isCodeView && editorRef.current) {
        // Switching from code to visual: set innerHTML
        editorRef.current.innerHTML = currentValue;
      }
      setIsCodeView((prev) => !prev);
    }, [isCodeView, currentValue]);

    // ── Color input handlers ──────────────────────────────
    const handleColorChange = useCallback(
      (command: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        restoreSelection();
        execCommand(command, e.target.value);
        handleInput();
      },
      [restoreSelection, handleInput],
    );

    // ── Dropdown handlers ─────────────────────────────────
    const handleSelectChange = useCallback(
      (command: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (!val) return;
        execCommand(command, val);
        handleInput();
      },
      [handleInput],
    );

    // ── Template handler ──────────────────────────────────
    const handleTemplateChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (!val) return;
        execCommand("insertHTML", val);
        e.target.value = "";
        handleInput();
      },
      [handleInput],
    );

    return (
      <div
        className={cn("relative", className)}
        ref={ref}
        data-testid="rich-text-editor"
      >
        {label && (
          <label
            className="block text-sm font-medium text-[var(--color-text)] mb-1"
            htmlFor={id}
          >
            {label}
            {required && (
              <span className="text-[var(--color-danger)] ml-1">*</span>
            )}
          </label>
        )}

        <div
          className={cn(
            GLOBAL_UI_CONFIG.editorContainer,
            error && "border-[var(--color-danger)] focus-within:ring-[var(--color-danger)] focus-within:border-[var(--color-danger)]",
            disabled && "opacity-50 pointer-events-none",
          )}
          data-testid="editor-container"
        >
          {/* ── Toolbar Row 1 ────────────────────────────── */}
          <div
            className={GLOBAL_UI_CONFIG.editorToolbar}
            data-testid="editor-toolbar-row1"
          >
            {/* History */}
            {config.showToolbar.history && (
              <div className="flex items-center gap-0.5" data-testid="editor-section-history">
                <AICToolbarButton command="undo" label="Undo" disabled={disabled} />
                <AICToolbarButton command="redo" label="Redo" disabled={disabled} />
                <span className="w-px h-5 bg-gray-300 mx-1" />
              </div>
            )}

            {/* Basic Formatting */}
            {config.showToolbar.basicFormatting && (
              <div className="flex items-center gap-0.5" data-testid="editor-section-formatting">
                <AICToolbarButton command="bold" label="B" disabled={disabled} />
                <AICToolbarButton command="italic" label="I" disabled={disabled} />
                <AICToolbarButton command="underline" label="U" disabled={disabled} />
                <AICToolbarButton command="strikeThrough" label="S" disabled={disabled} />
                <span className="w-px h-5 bg-gray-300 mx-1" />
              </div>
            )}

            {/* Colors */}
            {config.showToolbar.colors && (
              <div className="flex items-center gap-0.5" data-testid="editor-section-colors">
                <div className="relative">
                  <button
                    type="button"
                    className={GLOBAL_UI_CONFIG.editorBtn}
                    title="Text Color"
                    disabled={disabled}
                    onMouseDown={saveSelection}
                    data-testid="editor-btn-foreColor"
                  >
                    A
                    <input
                      type="color"
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      onChange={handleColorChange("foreColor")}
                      onMouseDown={saveSelection}
                      disabled={disabled}
                      tabIndex={-1}
                      data-testid="editor-input-foreColor"
                    />
                  </button>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    className={GLOBAL_UI_CONFIG.editorBtn}
                    title="Highlight Color"
                    disabled={disabled}
                    onMouseDown={saveSelection}
                    data-testid="editor-btn-hiliteColor"
                  >
                    H
                    <input
                      type="color"
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      onChange={handleColorChange("hiliteColor")}
                      onMouseDown={saveSelection}
                      disabled={disabled}
                      tabIndex={-1}
                      data-testid="editor-input-hiliteColor"
                    />
                  </button>
                </div>
                <span className="w-px h-5 bg-gray-300 mx-1" />
              </div>
            )}

            {/* Alignment */}
            {config.showToolbar.alignment && (
              <div className="flex items-center gap-0.5" data-testid="editor-section-alignment">
                <AICToolbarButton command="justifyLeft" label="Left" disabled={disabled} />
                <AICToolbarButton command="justifyCenter" label="Center" disabled={disabled} />
                <AICToolbarButton command="justifyRight" label="Right" disabled={disabled} />
                <AICToolbarButton command="justifyFull" label="Justify" disabled={disabled} />
                <span className="w-px h-5 bg-gray-300 mx-1" />
              </div>
            )}

            {/* Lists */}
            {config.showToolbar.lists && (
              <div className="flex items-center gap-0.5" data-testid="editor-section-lists">
                <AICToolbarButton command="outdent" label="Outdent" disabled={disabled} />
                <AICToolbarButton command="indent" label="Indent" disabled={disabled} />
                <AICToolbarButton command="insertUnorderedList" label="UL" disabled={disabled} />
                <AICToolbarButton command="insertOrderedList" label="OL" disabled={disabled} />
                <span className="w-px h-5 bg-gray-300 mx-1" />
              </div>
            )}

            {/* Scripts */}
            {config.showToolbar.scripts && (
              <div className="flex items-center gap-0.5" data-testid="editor-section-scripts">
                <AICToolbarButton command="subscript" label="Sub" disabled={disabled} />
                <AICToolbarButton command="superscript" label="Sup" disabled={disabled} />
                <AICToolbarButton command="inlineCode" label="Code" disabled={disabled} />
                <span className="w-px h-5 bg-gray-300 mx-1" />
              </div>
            )}

            {/* Code View Toggle */}
            {config.showToolbar.codeView && (
              <button
                type="button"
                className={cn(
                  GLOBAL_UI_CONFIG.editorBtn,
                  isCodeView && GLOBAL_UI_CONFIG.editorBtnActive,
                )}
                onClick={toggleCodeView}
                disabled={disabled}
                title="Code View"
                data-testid="editor-btn-codeView"
              >
                &lt;/&gt;
              </button>
            )}
          </div>

          {/* ── Toolbar Row 2 (Dropdowns) ────────────────── */}
          <div
            className={GLOBAL_UI_CONFIG.editorToolbar}
            data-testid="editor-toolbar-row2"
          >
            {/* Templates */}
            {config.showToolbar.templates && (
              <select
                className={cn(GLOBAL_UI_CONFIG.editorBtn, "text-xs pr-1")}
                onChange={handleTemplateChange}
                disabled={disabled}
                defaultValue=""
                data-testid="editor-select-templates"
              >
                <option value="" disabled>
                  Templates
                </option>
                {config.dropdownOptions.templates.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {/* Headings */}
            {config.showToolbar.headings && (
              <select
                className={cn(GLOBAL_UI_CONFIG.editorBtn, "text-xs pr-1")}
                onChange={handleSelectChange("formatBlock")}
                disabled={disabled}
                defaultValue=""
                data-testid="editor-select-headings"
              >
                <option value="" disabled>
                  Headings
                </option>
                {config.dropdownOptions.headings.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {/* Fonts */}
            {config.showToolbar.fonts && (
              <select
                className={cn(GLOBAL_UI_CONFIG.editorBtn, "text-xs pr-1")}
                onChange={handleSelectChange("fontName")}
                disabled={disabled}
                defaultValue=""
                data-testid="editor-select-fonts"
              >
                <option value="" disabled>
                  Font
                </option>
                {config.dropdownOptions.fonts.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            )}

            {/* Font Sizes */}
            {config.showToolbar.fontSizes && (
              <select
                className={cn(GLOBAL_UI_CONFIG.editorBtn, "text-xs pr-1")}
                onChange={handleSelectChange("fontSize")}
                disabled={disabled}
                defaultValue=""
                data-testid="editor-select-fontSizes"
              >
                <option value="" disabled>
                  Size
                </option>
                {config.dropdownOptions.fontSizes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* ── Editor Content / Code View ───────────────── */}
          {isCodeView ? (
            <textarea
              className={cn(
                GLOBAL_UI_CONFIG.editorContent,
                "w-full font-mono text-sm resize-y",
              )}
              value={currentValue}
              onChange={handleCodeChange}
              disabled={disabled}
              data-testid="editor-code-textarea"
            />
          ) : (
            <div
              ref={editorRef}
              id={id}
              contentEditable={!disabled}
              suppressContentEditableWarning
              className={GLOBAL_UI_CONFIG.editorContent}
              onInput={handleInput}
              data-testid="editor-content"
            />
          )}
        </div>

        {error && errorMessage && (
          <p
            className="text-xs text-[var(--color-danger)] mt-1"
            role="alert"
            data-testid="editor-error"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

AICRichTextEditor.displayName = "AICRichTextEditor";
