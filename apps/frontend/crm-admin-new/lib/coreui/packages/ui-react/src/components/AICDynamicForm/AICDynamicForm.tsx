/**
 * React AICDynamicForm component.
 * Renders a complete form from a FormSchema configuration.
 * Supports standard and tab layouts, grid rows, validation, and submit/reset.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  cn,
  buildInitialValues,
  validateForm,
  getVisibleRows,
  getFirstTabId,
  isTabLayout,
} from "@coreui/ui";
import type {
  DynamicFormProps,
  FormSchema,
  RowConfig,
  TabConfig,
  ColumnConfig,
} from "@coreui/ui";
import { AICDynamicField } from "../AICDynamicField";

// ── Tab Navigation Sub-Component ────────────
interface TabNavProps {
  tabs: TabConfig[];
  activeTabId: string | null;
  onTabChange: (tabId: string) => void;
}

const TabNav: React.FC<TabNavProps> = ({ tabs, activeTabId, onTabChange }) => {
  return (
    <div
      className="flex border-b border-gray-200 mb-4 overflow-x-auto"
      role="tablist"
      data-testid="form-tab-nav"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === activeTabId}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            tab.id === activeTabId
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
          )}
          onClick={() => onTabChange(tab.id)}
          data-testid={`form-tab-${tab.id}`}
        >
          {tab.icon && (
            <span className="flex-shrink-0" data-testid={`tab-icon-${tab.id}`}>
              {tab.icon}
            </span>
          )}
          {tab.image && (
            <img
              src={tab.image}
              alt=""
              className="w-5 h-5 rounded-full object-cover flex-shrink-0"
              data-testid={`tab-image-${tab.id}`}
            />
          )}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

TabNav.displayName = "TabNav";

// ── Row Renderer Sub-Component ──────────────
interface RowRendererProps {
  rows: RowConfig[];
  values: Record<string, unknown>;
  errors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
  onAction?: (key: string, action: string) => void;
  disabled?: boolean;
}

const RowRenderer: React.FC<RowRendererProps> = ({
  rows,
  values,
  errors,
  onChange,
  onAction,
  disabled,
}) => {
  return (
    <>
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="grid grid-cols-12 gap-4"
          data-testid="form-row"
        >
          {row.columns.map((col: ColumnConfig, colIdx: number) => (
            <div
              key={colIdx}
              className={`col-span-${col.span}`}
              style={{ gridColumn: `span ${col.span} / span ${col.span}` }}
              data-testid="form-column"
            >
              {col.field && (
                <AICDynamicField
                  field={col.field}
                  value={values[col.field.key]}
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
    </>
  );
};

RowRenderer.displayName = "RowRenderer";

// ── Main AICDynamicForm Component ──────────────
export const AICDynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  values: externalValues,
  errors: externalErrors,
  onChange: externalOnChange,
  onSubmit,
  onReset,
  onAction,
  disabled = false,
  className,
}) => {
  // Compute initial values from schema
  const initialValues = useMemo(() => buildInitialValues(schema), [schema]);

  // Internal state management
  const [internalValues, setInternalValues] = useState<Record<string, unknown>>(initialValues);
  const [internalErrors, setInternalErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [activeTabId, setActiveTabId] = useState<string | null>(() => getFirstTabId(schema));

  // Determine if controlled or uncontrolled
  const isControlled = externalValues !== undefined;
  const values = isControlled ? externalValues : internalValues;
  const errors = externalErrors ?? internalErrors;

  // Reset internal values when schema changes
  useEffect(() => {
    if (!isControlled) {
      setInternalValues(initialValues);
    }
    setActiveTabId(getFirstTabId(schema));
  }, [schema, initialValues, isControlled]);

  // Handle field change
  const handleChange = useCallback(
    (key: string, value: unknown) => {
      if (externalOnChange) {
        externalOnChange(key, value);
      }
      if (!isControlled) {
        setInternalValues((prev) => ({ ...prev, [key]: value }));
      }
      setTouched((prev) => ({ ...prev, [key]: true }));
    },
    [externalOnChange, isControlled],
  );

  // Handle submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Validate
      const validationErrors = validateForm(schema, values);
      setInternalErrors(validationErrors);

      // Mark all fields as touched
      const allTouched: Record<string, boolean> = {};
      for (const key of Object.keys(values)) {
        allTouched[key] = true;
      }
      setTouched(allTouched);

      // Only submit if no errors
      if (Object.keys(validationErrors).length === 0) {
        onSubmit?.(values);
      }
    },
    [schema, values, onSubmit],
  );

  // Handle reset
  const handleReset = useCallback(() => {
    if (!isControlled) {
      setInternalValues(initialValues);
    }
    setInternalErrors({});
    setTouched({});
    onReset?.();
  }, [initialValues, isControlled, onReset]);

  // Handle tab change
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  // Get visible rows based on current tab
  const visibleRows = useMemo(
    () => getVisibleRows(schema, activeTabId),
    [schema, activeTabId],
  );

  const isTabbed = isTabLayout(schema);

  return (
    <form
      className={cn("w-full", className)}
      onSubmit={handleSubmit}
      noValidate
      data-testid="dynamic-form"
    >
      {/* Title and Description */}
      {schema.title && (
        <h2
          className="text-xl font-bold text-gray-900 mb-1"
          data-testid="form-title"
        >
          {schema.title}
        </h2>
      )}
      {schema.description && (
        <p
          className="text-sm text-gray-500 mb-4"
          data-testid="form-description"
        >
          {schema.description}
        </p>
      )}

      {/* Header rows (for tabbed layout, rendered above tabs) */}
      {isTabbed && schema.rows && schema.rows.length > 0 && (
        <div data-testid="form-header-rows" className="mb-4">
          <RowRenderer
            rows={schema.rows}
            values={values}
            errors={errors}
            onChange={handleChange}
            onAction={onAction}
            disabled={disabled}
          />
        </div>
      )}

      {/* Tab Navigation */}
      {isTabbed && schema.tabs && (
        <TabNav
          tabs={schema.tabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
        />
      )}

      {/* Form Content (Grid Rows) */}
      <div data-testid="form-content">
        <RowRenderer
          rows={visibleRows}
          values={values}
          errors={errors}
          onChange={handleChange}
          onAction={onAction}
          disabled={disabled}
        />
      </div>

      {/* Submit / Reset Buttons */}
      <div className="flex items-center gap-3 mt-6" data-testid="form-actions">
        <button
          type="submit"
          disabled={disabled}
          className={cn(
            "px-6 py-2 rounded-lg font-medium text-sm transition-colors",
            "bg-blue-600 text-white hover:bg-blue-700",
            "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          data-testid="form-submit"
        >
          Submit
        </button>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "px-6 py-2 rounded-lg font-medium text-sm transition-colors",
            "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
            "focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          onClick={handleReset}
          data-testid="form-reset"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

AICDynamicForm.displayName = "AICDynamicForm";
