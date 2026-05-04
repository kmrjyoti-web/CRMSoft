/**
 * React AICDynamicField component.
 * Dispatcher that routes 30+ field types to appropriate input components.
 * Renders form fields dynamically based on FormFieldConfig.
 */

import React, { useCallback, useState } from "react";
import {
  cn,
  GLOBAL_UI_CONFIG,
  getFieldCategory,
  isFieldRequired,
  getFieldError,
  resolveDefaultValue,
} from "@coreui/ui";
import type {
  DynamicFieldProps,
  DynamicFieldFieldsetProps as DynamicFieldsetProps,
  FormFieldConfig,
  RowConfig,
  ColumnConfig,
  Option,
} from "@coreui/ui";

// ── AICFieldset Sub-Component ──────────────────
interface FieldsetInternalProps {
  field: FormFieldConfig;
  value?: Record<string, unknown>;
  onChange?: (key: string, value: unknown) => void;
  onAction?: (key: string, action: string) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  className?: string;
}

const DynamicFieldset: React.FC<FieldsetInternalProps> = ({
  field,
  value = {},
  onChange,
  onAction,
  errors,
  disabled,
  className,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const rows = (field.props?.["rows"] as RowConfig[]) ?? [];
  const appearance = (field.props?.["appearance"] as string) ?? "legend";
  const toggleable = (field.props?.["toggleable"] as boolean) ?? false;

  const handleToggle = useCallback(() => {
    if (toggleable) {
      setCollapsed((prev) => !prev);
    }
  }, [toggleable]);

  const containerClass =
    appearance === "panel"
      ? GLOBAL_UI_CONFIG.fieldsetContainer
      : "relative border border-gray-300 rounded-lg bg-white mt-4";

  return (
    <div
      className={cn(containerClass, className)}
      data-testid={`fieldset-${field.key}`}
    >
      {/* Header */}
      {appearance === "panel" ? (
        <div
          className={cn(
            GLOBAL_UI_CONFIG.fieldsetHeader,
            toggleable && "cursor-pointer",
          )}
          onClick={handleToggle}
          data-testid={`fieldset-header-${field.key}`}
        >
          <span
            className={GLOBAL_UI_CONFIG.fieldsetLegend}
            data-testid={`fieldset-legend-${field.key}`}
          >
            {field.label}
          </span>
          {toggleable && (
            <button
              type="button"
              className="focus:outline-none"
              data-testid={`fieldset-toggle-${field.key}`}
            >
              <svg
                className={cn(
                  GLOBAL_UI_CONFIG.fieldsetToggleIcon,
                  "w-5 h-5 transition-transform duration-200",
                  !collapsed && "rotate-180",
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "absolute -top-3 left-4 px-2 bg-white flex items-center gap-2 select-none z-10",
            toggleable && "cursor-pointer",
          )}
          onClick={handleToggle}
          data-testid={`fieldset-header-${field.key}`}
        >
          <span
            className="font-bold text-sm leading-none"
            data-testid={`fieldset-legend-${field.key}`}
          >
            {field.label}
          </span>
        </div>
      )}

      {/* Content */}
      {!collapsed && (
        <div
          className={cn(
            GLOBAL_UI_CONFIG.fieldsetContent,
            appearance === "legend" && "pt-6",
          )}
          data-testid={`fieldset-content-${field.key}`}
        >
          {rows.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className="grid grid-cols-12 gap-4"
              data-testid="dynamic-row"
            >
              {row.columns.map((col: ColumnConfig, colIdx: number) => (
                <div
                  key={colIdx}
                  className={`col-span-${col.span}`}
                  style={{ gridColumn: `span ${col.span} / span ${col.span}` }}
                  data-testid="dynamic-column"
                >
                  {col.field && (
                    <AICDynamicField
                      field={col.field}
                      value={value[col.field.key]}
                      onChange={onChange}
                      onAction={onAction}
                      errors={errors}
                      disabled={disabled}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

DynamicFieldset.displayName = "DynamicFieldset";

// ── Helper: Render Label ────────────────────
const FieldLabel: React.FC<{
  field: FormFieldConfig;
  htmlFor: string;
}> = ({ field, htmlFor }) => {
  const required = isFieldRequired(field);
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 mb-1"
      data-testid={`label-${field.key}`}
    >
      {field.label}
      {required && (
        <span className="text-red-500 ml-1" data-testid={`required-${field.key}`}>
          *
        </span>
      )}
    </label>
  );
};

// ── Helper: Render Error ────────────────────
const FieldError: React.FC<{
  field: FormFieldConfig;
  errors?: Record<string, string>;
}> = ({ field, errors }) => {
  const error = getFieldError(field, errors);
  if (!error) return null;
  return (
    <p
      className={GLOBAL_UI_CONFIG.error}
      data-testid={`error-${field.key}`}
    >
      {error}
    </p>
  );
};

// ── Main AICDynamicField Component ─────────────
export const AICDynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  onAction,
  errors,
  disabled = false,
  className,
}) => {
  if (field.hidden) return null;

  const fieldId = `field-${field.key}`;
  const fieldError = getFieldError(field, errors);
  const hasError = !!fieldError;

  const handleChange = useCallback(
    (newValue: unknown) => {
      onChange?.(field.key, newValue);
    },
    [field.key, onChange],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target;
      if (target instanceof HTMLInputElement && target.type === "checkbox") {
        handleChange(target.checked);
      } else if (target instanceof HTMLInputElement && target.type === "number") {
        handleChange(target.value === "" ? "" : Number(target.value));
      } else {
        handleChange(target.value);
      }
    },
    [handleChange],
  );

  const handleActionClick = useCallback(() => {
    onAction?.(field.key, "click");
  }, [field.key, onAction]);

  const renderField = () => {
    switch (field.type) {
      // ── Text-like Inputs ────────────────────
      case "text":
      case "number":
      case "email":
      case "password":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <input
              id={fieldId}
              type={field.type}
              value={value != null ? String(value) : ""}
              placeholder={field.placeholder}
              disabled={disabled}
              onChange={handleInputChange}
              className={cn(
                GLOBAL_UI_CONFIG.input,
                "h-10 text-base",
                hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              )}
              data-testid={`input-${field.key}`}
            />
            <FieldError field={field} errors={errors} />
          </div>
        );

      case "textarea":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <textarea
              id={fieldId}
              value={value != null ? String(value) : ""}
              placeholder={field.placeholder}
              disabled={disabled}
              rows={(field.props?.["rows"] as number) ?? 3}
              onChange={handleInputChange}
              className={cn(
                GLOBAL_UI_CONFIG.input,
                "py-2 resize-y",
                hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              )}
              data-testid={`textarea-${field.key}`}
            />
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── Editor ──────────────────────────────
      case "editor":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <div
              className={GLOBAL_UI_CONFIG.editorContainer}
              data-testid={`editor-${field.key}`}
            >
              <div
                className={cn(GLOBAL_UI_CONFIG.editorContent, "min-h-[120px]")}
                contentEditable={!disabled}
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: value != null ? String(value) : "" }}
                onBlur={(e) => handleChange(e.currentTarget.innerHTML)}
                data-testid={`editor-content-${field.key}`}
              />
            </div>
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── Date ────────────────────────────────
      case "date":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <input
              id={fieldId}
              type="date"
              value={value != null ? String(value) : ""}
              disabled={disabled}
              onChange={handleInputChange}
              className={cn(
                GLOBAL_UI_CONFIG.input,
                "h-10 text-base",
                hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              )}
              data-testid={`date-${field.key}`}
            />
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── Mobile ──────────────────────────────
      case "mobile":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <input
              id={fieldId}
              type="tel"
              value={value != null ? String(value) : ""}
              placeholder={field.placeholder ?? "Enter mobile number"}
              disabled={disabled}
              onChange={handleInputChange}
              className={cn(
                GLOBAL_UI_CONFIG.input,
                "h-10 text-base",
                hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              )}
              data-testid={`mobile-${field.key}`}
            />
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── Currency ────────────────────────────
      case "currency":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <input
              id={fieldId}
              type="number"
              value={value != null ? String(value) : ""}
              placeholder={field.placeholder ?? "0.00"}
              disabled={disabled}
              onChange={handleInputChange}
              className={cn(
                GLOBAL_UI_CONFIG.input,
                "h-10 text-base",
                hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              )}
              data-testid={`currency-${field.key}`}
            />
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── Color ───────────────────────────────
      case "color":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <div className="flex items-center gap-2">
              <input
                id={fieldId}
                type="color"
                value={value != null ? String(value) : "#000000"}
                disabled={disabled}
                onChange={handleInputChange}
                className={cn(GLOBAL_UI_CONFIG.colorPreview)}
                data-testid={`color-${field.key}`}
              />
              <span className="text-sm text-gray-500">
                {value != null ? String(value) : "#000000"}
              </span>
            </div>
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── OTP ─────────────────────────────────
      case "otp":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <input
              id={fieldId}
              type="text"
              value={value != null ? String(value) : ""}
              placeholder={field.placeholder ?? "Enter OTP"}
              disabled={disabled}
              maxLength={(field.props?.["length"] as number) ?? 6}
              onChange={handleInputChange}
              className={cn(
                GLOBAL_UI_CONFIG.input,
                "h-10 text-base text-center tracking-[0.5em]",
                hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              )}
              data-testid={`otp-${field.key}`}
            />
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── AICSelect ──────────────────────────────
      case "select":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <select
              id={fieldId}
              value={value != null ? String(value) : ""}
              disabled={disabled}
              onChange={handleInputChange}
              className={cn(
                GLOBAL_UI_CONFIG.input,
                "h-10 text-base",
                hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              )}
              data-testid={`select-${field.key}`}
            >
              <option value="">{field.placeholder ?? "AICSelect..."}</option>
              {field.options?.map((opt: Option) => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── Multi-AICSelect ────────────────────────
      case "multi-select":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <select
              id={fieldId}
              multiple
              value={Array.isArray(value) ? value.map(String) : []}
              disabled={disabled}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                handleChange(selected);
              }}
              className={cn(
                GLOBAL_UI_CONFIG.input,
                "min-h-[80px]",
                hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              )}
              data-testid={`multi-select-${field.key}`}
            >
              {field.options?.map((opt: Option) => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── AICAutocomplete ────────────────────────
      case "autocomplete":
      case "aic-autocomplete":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <input
              id={fieldId}
              type="text"
              value={value != null ? String(value) : ""}
              placeholder={field.placeholder ?? "Search..."}
              disabled={disabled}
              onChange={handleInputChange}
              list={`datalist-${field.key}`}
              className={cn(
                GLOBAL_UI_CONFIG.input,
                "h-10 text-base",
                hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              )}
              data-testid={`autocomplete-${field.key}`}
            />
            <datalist id={`datalist-${field.key}`}>
              {field.options?.map((opt: Option) => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </datalist>
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── Tags ────────────────────────────────
      case "tags":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <input
              id={fieldId}
              type="text"
              placeholder={field.placeholder ?? "Type and press Enter"}
              disabled={disabled}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const target = e.target as HTMLInputElement;
                  const newTag = target.value.trim();
                  if (newTag) {
                    const current = Array.isArray(value) ? value : [];
                    handleChange([...current, newTag]);
                    target.value = "";
                  }
                }
              }}
              className={cn(
                GLOBAL_UI_CONFIG.input,
                "h-10 text-base",
                hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              )}
              data-testid={`tags-${field.key}`}
            />
            {Array.isArray(value) && value.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {value.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs"
                  >
                    {String(tag)}
                    <button
                      type="button"
                      onClick={() => handleChange(value.filter((_: unknown, i: number) => i !== idx))}
                      className="text-blue-500 hover:text-blue-700"
                      disabled={disabled}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── AICRadio Group ─────────────────────────
      case "radio-group":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <div
              className={GLOBAL_UI_CONFIG.optionGroupContainer}
              role="radiogroup"
              data-testid={`radio-group-${field.key}`}
            >
              {field.options?.map((opt: Option) => (
                <label
                  key={String(opt.value)}
                  className={cn(
                    GLOBAL_UI_CONFIG.optionCard,
                    value === opt.value && GLOBAL_UI_CONFIG.optionCardSelected,
                    GLOBAL_UI_CONFIG.optionCardHover,
                  )}
                >
                  <input
                    type="radio"
                    name={field.key}
                    value={String(opt.value)}
                    checked={value === opt.value}
                    disabled={disabled}
                    onChange={() => handleChange(opt.value)}
                    className="sr-only"
                  />
                  <div className={GLOBAL_UI_CONFIG.optionContent}>
                    <span className={GLOBAL_UI_CONFIG.optionLabel}>{opt.label}</span>
                    {opt.description && (
                      <span className={GLOBAL_UI_CONFIG.optionDescription}>
                        {opt.description}
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── AICCheckbox Group ──────────────────────
      case "checkbox-group":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <div
              className={GLOBAL_UI_CONFIG.optionGroupContainer}
              data-testid={`checkbox-group-${field.key}`}
            >
              {field.options?.map((opt) => {
                const selected = Array.isArray(value) ? value : [];
                const isChecked = selected.includes(opt.value);
                return (
                  <label
                    key={String(opt.value)}
                    className={cn(
                      GLOBAL_UI_CONFIG.optionCard,
                      isChecked && GLOBAL_UI_CONFIG.optionCardSelected,
                      GLOBAL_UI_CONFIG.optionCardHover,
                    )}
                  >
                    <input
                      type="checkbox"
                      value={String(opt.value)}
                      checked={isChecked}
                      disabled={disabled}
                      onChange={() => {
                        const newVal = isChecked
                          ? selected.filter((v: unknown) => v !== opt.value)
                          : [...selected, opt.value];
                        handleChange(newVal);
                      }}
                      className="sr-only"
                    />
                    <div className={GLOBAL_UI_CONFIG.optionContent}>
                      <span className={GLOBAL_UI_CONFIG.optionLabel}>{opt.label}</span>
                      {opt.description && (
                        <span className={GLOBAL_UI_CONFIG.optionDescription}>
                          {opt.description}
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── List AICCheckbox ───────────────────────
      case "list-checkbox":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <div data-testid={`list-checkbox-${field.key}`}>
              {field.options?.map((opt) => {
                const selected = Array.isArray(value) ? value : [];
                const isChecked = selected.includes(opt.value);
                return (
                  <label
                    key={String(opt.value)}
                    className={cn(GLOBAL_UI_CONFIG.checkboxWrapper)}
                  >
                    <input
                      type="checkbox"
                      value={String(opt.value)}
                      checked={isChecked}
                      disabled={disabled}
                      onChange={() => {
                        const newVal = isChecked
                          ? selected.filter((v: unknown) => v !== opt.value)
                          : [...selected, opt.value];
                        handleChange(newVal);
                      }}
                      className={GLOBAL_UI_CONFIG.checkboxInput}
                    />
                    <span className={GLOBAL_UI_CONFIG.checkboxLabel}>{opt.label}</span>
                  </label>
                );
              })}
            </div>
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── Segment ─────────────────────────────
      case "segment":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <div
              className={GLOBAL_UI_CONFIG.segmentContainer}
              data-testid={`segment-${field.key}`}
            >
              {field.options?.map((opt: Option) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  disabled={disabled}
                  className={cn(
                    GLOBAL_UI_CONFIG.segmentButton,
                    value === opt.value
                      ? GLOBAL_UI_CONFIG.segmentButtonActive
                      : GLOBAL_UI_CONFIG.segmentButtonIdle,
                  )}
                  onClick={() => handleChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── AICRating ──────────────────────────────
      case "rating": {
        const max = (field.props?.["max"] as number) ?? 5;
        const currentRating = typeof value === "number" ? value : 0;
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <div className="flex gap-1" data-testid={`rating-${field.key}`}>
              {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={disabled}
                  className={cn(
                    "text-2xl transition-colors",
                    star <= currentRating ? "text-yellow-400" : "text-gray-300",
                  )}
                  onClick={() => handleChange(star)}
                  data-testid={`rating-star-${field.key}-${star}`}
                >
                  &#9733;
                </button>
              ))}
            </div>
            <FieldError field={field} errors={errors} />
          </div>
        );
      }

      // ── AICSlider ──────────────────────────────
      case "slider": {
        const min = (field.props?.["min"] as number) ?? 0;
        const max = (field.props?.["max"] as number) ?? 100;
        const step = (field.props?.["step"] as number) ?? 1;
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <div className="flex items-center gap-3">
              <input
                id={fieldId}
                type="range"
                min={min}
                max={max}
                step={step}
                value={typeof value === "number" ? value : min}
                disabled={disabled}
                onChange={(e) => handleChange(Number(e.target.value))}
                className="flex-1"
                data-testid={`slider-${field.key}`}
              />
              <span className="text-sm text-gray-600 min-w-[3ch] text-right">
                {typeof value === "number" ? value : min}
              </span>
            </div>
            <FieldError field={field} errors={errors} />
          </div>
        );
      }

      // ── File Upload ─────────────────────────
      case "file-upload":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <div className={GLOBAL_UI_CONFIG.fileUploadDropzone}>
              <input
                id={fieldId}
                type="file"
                disabled={disabled}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleChange(files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                data-testid={`file-upload-${field.key}`}
              />
              <p className="text-sm text-gray-500">
                {field.placeholder ?? "Click or drag to upload"}
              </p>
            </div>
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── AICSignature ───────────────────────────
      case "signature":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <FieldLabel field={field} htmlFor={fieldId} />
            <div className="relative">
              <canvas
                className={GLOBAL_UI_CONFIG.signaturePad}
                style={{ height: "150px" }}
                data-testid={`signature-${field.key}`}
              />
              <button
                type="button"
                className={GLOBAL_UI_CONFIG.signatureClearBtn}
                onClick={() => handleChange("")}
                disabled={disabled}
              >
                Clear
              </button>
            </div>
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── AICCheckbox ────────────────────────────
      case "checkbox":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <label className={cn(GLOBAL_UI_CONFIG.checkboxWrapper)}>
              <input
                id={fieldId}
                type="checkbox"
                checked={!!value}
                disabled={disabled}
                onChange={handleInputChange}
                className={cn(GLOBAL_UI_CONFIG.checkboxInput, "h-5 w-5")}
                data-testid={`checkbox-${field.key}`}
              />
              <span className={GLOBAL_UI_CONFIG.checkboxLabel}>{field.label}</span>
              {isFieldRequired(field) && (
                <span className="text-red-500 ml-1" data-testid={`required-${field.key}`}>
                  *
                </span>
              )}
            </label>
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── AICSwitch ──────────────────────────────
      case "switch":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <label className={cn(GLOBAL_UI_CONFIG.switchWrapper)}>
              <input
                id={fieldId}
                type="checkbox"
                checked={!!value}
                disabled={disabled}
                onChange={handleInputChange}
                className="sr-only peer"
                data-testid={`switch-${field.key}`}
              />
              <div className={GLOBAL_UI_CONFIG.switchTrack} />
              <span className="ml-3 text-sm font-medium text-gray-700">{field.label}</span>
            </label>
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── Toggle AICButton ───────────────────────
      case "toggle-button":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "px-4 py-2 rounded-lg font-medium text-sm transition-all border",
                value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
              )}
              onClick={() => handleChange(!value)}
              data-testid={`toggle-button-${field.key}`}
            >
              {field.label}
            </button>
            <FieldError field={field} errors={errors} />
          </div>
        );

      // ── AICFieldset (recursive container) ──────
      case "fieldset":
        return (
          <DynamicFieldset
            field={field}
            value={typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {}}
            onChange={onChange}
            onAction={onAction}
            errors={errors}
            disabled={disabled}
            className={className}
          />
        );

      // ── AICButton ──────────────────────────────
      case "button":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                GLOBAL_UI_CONFIG.actionButton,
                "px-4 py-2 bg-blue-600 text-white hover:bg-blue-700",
              )}
              onClick={handleActionClick}
              data-testid={`button-${field.key}`}
            >
              {field.label}
            </button>
          </div>
        );

      // ── AIC Toolbar ───────────────────────
      case "aic-toolbar":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <div
              className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50"
              data-testid={`aic-toolbar-${field.key}`}
            >
              <span className="text-sm text-gray-500">{field.label}</span>
            </div>
          </div>
        );

      // ── Dialog Buttons ──────────────────────
      case "confirm-dialog":
      case "alert-dialog":
        return (
          <div className={cn("mb-3", className)} data-testid={`dynamic-field-${field.key}`}>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                GLOBAL_UI_CONFIG.actionButton,
                "px-4 py-2",
                field.type === "confirm-dialog"
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-red-500 text-white hover:bg-red-600",
              )}
              onClick={handleActionClick}
              data-testid={`dialog-button-${field.key}`}
            >
              {field.label}
            </button>
          </div>
        );

      // ── Unknown ─────────────────────────────
      default:
        return (
          <div
            className={cn(
              "mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm",
              className,
            )}
            data-testid={`unknown-field-${field.key}`}
          >
            Unknown control type: {field.type}
          </div>
        );
    }
  };

  return <>{renderField()}</>;
};

AICDynamicField.displayName = "AICDynamicField";
