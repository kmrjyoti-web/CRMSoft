/**
 * AICFieldEditor component.
 * Right-sidebar property panel for editing individual form fields.
 */

import React, { useCallback } from "react";

import { cn } from "@coreui/ui";
import type { FormFieldConfig, ControlType } from "@coreui/ui";

// ── Constants ───────────────────────────────────────────

const AVAILABLE_CONTROL_TYPES: ControlType[] = [
  "text", "number", "email", "password", "textarea",
  "select", "multi-select",
  "checkbox", "radio-group", "switch",
  "date", "mobile", "currency",
  "rating", "slider", "tags", "segment",
  "file-upload", "signature", "otp",
  "button", "confirm-dialog", "alert-dialog",
];

const TRANSLITERATION_LANGUAGES = [
  "Hindi",
  "Gujarati",
  "Marathi",
  "Urdu",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Punjabi",
  "Arabic",
] as const;

// ── Props ───────────────────────────────────────────────

export interface FieldEditorProps {
  /** The field to edit, or null when nothing is selected. */
  field: FormFieldConfig | null;
  /** Called after a field property is mutated so the parent can sync state. */
  onFieldChange?: () => void;
  /** Additional CSS class names. */
  className?: string;
}

// ── Component ───────────────────────────────────────────

export const AICFieldEditor: React.FC<FieldEditorProps> = ({
  field,
  onFieldChange,
  className,
}) => {
  // ── Field mutation helper ─────────────────────────────
  // Since field is mutable from parent, we modify in-place and notify
  const mutateField = useCallback(
    (updater: (f: FormFieldConfig) => void) => {
      if (!field) return;
      updater(field);
      onFieldChange?.();
    },
    [field, onFieldChange],
  );

  // ── Section render helper ─────────────────────────────
  const renderSection = (title: string, children: React.ReactNode) => (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h4>
      {children}
    </div>
  );

  // ── AICInput render helper ───────────────────────────────
  const renderInput = (
    label: string,
    value: string | undefined,
    onChange: (val: string) => void,
    testId: string,
    placeholder?: string,
  ) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        type="text"
        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={testId}
      />
    </div>
  );

  // ── Render ────────────────────────────────────────────
  return (
    <div
      className={cn(
        "w-80 border-l border-gray-200 bg-gray-50 flex flex-col overflow-hidden",
        className,
      )}
      data-testid="field-editor"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <h3 className="text-sm font-semibold text-gray-900">Edit Field</h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {!field ? (
          <p
            className="text-sm text-gray-400 text-center mt-8"
            data-testid="field-editor-placeholder"
          >
            AICSelect a field to edit its properties
          </p>
        ) : (
          <div className="space-y-5" data-testid="field-editor-form">
            {/* ── Basic Properties ──────────────────────── */}
            {renderSection(
              "Properties",
              <div className="space-y-3">
                {/* Key (ID) */}
                {renderInput(
                  "Key (ID)",
                  field.key,
                  (val) =>
                    mutateField((f) => {
                      f.key = val;
                    }),
                  "field-key-input",
                  "field_id",
                )}

                {/* Label */}
                {renderInput(
                  "Label",
                  field.label,
                  (val) =>
                    mutateField((f) => {
                      f.label = val;
                    }),
                  "field-label-input",
                  "Field Label",
                )}

                {/* Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Type
                  </label>
                  <select
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                    value={field.type}
                    onChange={(e) =>
                      mutateField((f) => {
                        f.type = e.target.value as ControlType;
                      })
                    }
                    data-testid="field-type-select"
                  >
                    {AVAILABLE_CONTROL_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Placeholder */}
                {renderInput(
                  "Placeholder",
                  field.placeholder,
                  (val) =>
                    mutateField((f) => {
                      f.placeholder = val;
                    }),
                  "field-placeholder-input",
                  "Enter placeholder text",
                )}
              </div>,
            )}

            {/* ── Validation ───────────────────────────── */}
            {renderSection(
              "Validation",
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary/50"
                    checked={field.validators?.required ?? false}
                    onChange={(e) =>
                      mutateField((f) => {
                        if (!f.validators) f.validators = {};
                        f.validators.required = e.target.checked;
                      })
                    }
                    data-testid="field-required-checkbox"
                  />
                  <span className="text-sm text-gray-700">Required</span>
                </label>
              </div>,
            )}

            {/* ── AI & Transliteration ─────────────────── */}
            {renderSection(
              "AI & Transliteration",
              <div className="space-y-3">
                {/* Enable Transliteration */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary/50"
                    checked={field.transliteration?.enabled ?? false}
                    onChange={(e) =>
                      mutateField((f) => {
                        if (e.target.checked) {
                          f.transliteration = {
                            enabled: true,
                            defaultLanguage:
                              f.transliteration?.defaultLanguage ?? "Hindi",
                            showControls:
                              f.transliteration?.showControls ?? true,
                          };
                        } else {
                          delete f.transliteration;
                        }
                      })
                    }
                    data-testid="field-transliteration-checkbox"
                  />
                  <span className="text-sm text-gray-700">
                    Enable Transliteration
                  </span>
                </label>

                {/* Language Dropdown (shown when enabled) */}
                {field.transliteration?.enabled && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Target Language
                      </label>
                      <select
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                        value={
                          field.transliteration?.defaultLanguage ?? "Hindi"
                        }
                        onChange={(e) =>
                          mutateField((f) => {
                            if (f.transliteration) {
                              f.transliteration.defaultLanguage =
                                e.target.value;
                            }
                          })
                        }
                        data-testid="field-language-select"
                      >
                        {TRANSLITERATION_LANGUAGES.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Show Controls */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary/50"
                        checked={
                          field.transliteration?.showControls ?? true
                        }
                        onChange={(e) =>
                          mutateField((f) => {
                            if (f.transliteration) {
                              f.transliteration.showControls =
                                e.target.checked;
                            }
                          })
                        }
                        data-testid="field-show-controls-checkbox"
                      />
                      <span className="text-sm text-gray-700">
                        Show Controls
                      </span>
                    </label>
                  </>
                )}
              </div>,
            )}

            {/* ── Keyboard Navigation ──────────────────── */}
            {renderSection(
              "Keyboard Navigation",
              <div className="space-y-3">
                {/* Previous Control Key */}
                {renderInput(
                  "Previous Control Key",
                  field.previousControl,
                  (val) =>
                    mutateField((f) => {
                      f.previousControl = val || undefined;
                    }),
                  "field-prev-control-input",
                  "e.g. field_name",
                )}

                {/* Next Control Key */}
                {renderInput(
                  "Next Control Key",
                  field.nextControl,
                  (val) =>
                    mutateField((f) => {
                      f.nextControl = val || undefined;
                    }),
                  "field-next-control-input",
                  "e.g. field_email",
                )}

                {/* Info Box */}
                <div
                  className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700"
                  data-testid="keyboard-nav-info"
                >
                  Left Arrow &rarr; Prev, Right Arrow &rarr; Next
                </div>
              </div>,
            )}

            {/* ── Shortcut ─────────────────────────────── */}
            {renderSection(
              "Shortcut",
              <div>
                {renderInput(
                  "Keyboard Shortcut",
                  (field.props?.shortcut as string) ?? "",
                  (val) =>
                    mutateField((f) => {
                      if (!f.props) f.props = {};
                      f.props.shortcut = val || undefined;
                    }),
                  "field-shortcut-input",
                  "e.g. ctrl+k",
                )}
              </div>,
            )}
          </div>
        )}
      </div>
    </div>
  );
};

AICFieldEditor.displayName = "AICFieldEditor";
