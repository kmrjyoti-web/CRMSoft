"use client";

import { useState, useCallback, useEffect, useMemo } from "react";

import { Drawer, Button, Icon, Switch, Input } from "@/components/ui";

import { useFormConfig } from "../hooks/useFormConfig";

import type { FormFieldConfig } from "../utils/form-registry";

interface FormConfigDrawerProps {
  formKey: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FormConfigDrawer({ formKey, isOpen, onClose }: FormConfigDrawerProps) {
  const {
    fields: savedFields,
    saveConfig,
    resetToDefault,
    isSaving,
  } = useFormConfig(formKey);

  const [localFields, setLocalFields] = useState<FormFieldConfig[]>([]);
  const [applyToAll, setApplyToAll] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  // Sync local state when drawer opens or saved config changes
  useEffect(() => {
    if (isOpen) {
      setLocalFields([...savedFields]);
      setApplyToAll(false);
      setEditingId(null);
    }
  }, [isOpen, savedFields]);

  // Group fields by section
  const sections = useMemo(() => {
    const map = new Map<string, FormFieldConfig[]>();
    for (const f of localFields) {
      const arr = map.get(f.section) ?? [];
      arr.push(f);
      map.set(f.section, arr);
    }
    return Array.from(map.entries());
  }, [localFields]);

  const handleToggleField = useCallback((fieldId: string) => {
    setLocalFields((prev) =>
      prev.map((f) =>
        f.id === fieldId && !f.required ? { ...f, visible: !f.visible } : f,
      ),
    );
  }, []);

  const startEditing = useCallback((field: FormFieldConfig) => {
    setEditingId(field.id);
    setEditLabel(field.label);
  }, []);

  const commitLabel = useCallback(() => {
    if (!editingId) return;
    const trimmed = editLabel.trim();
    if (trimmed) {
      setLocalFields((prev) =>
        prev.map((f) => (f.id === editingId ? { ...f, label: trimmed } : f)),
      );
    }
    setEditingId(null);
  }, [editingId, editLabel]);

  const handleSave = useCallback(async () => {
    await saveConfig(localFields, applyToAll);
    onClose();
  }, [localFields, applyToAll, saveConfig, onClose]);

  const handleReset = useCallback(async () => {
    await resetToDefault();
    onClose();
  }, [resetToDefault, onClose]);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      position="right"
      title="Form Configuration"
      showCloseButton
    >
      <div className="flex flex-col h-full">
        {/* Description */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <p className="text-xs text-gray-500">
            Toggle field visibility and click labels to rename. Required fields cannot be hidden.
          </p>
        </div>

        {/* Field List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {sections.map(([sectionName, sectionFields]) => (
            <div key={sectionName} className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {sectionName}
              </h4>
              <div className="space-y-1">
                {sectionFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 py-2 px-2 rounded hover:bg-gray-50"
                  >
                    {/* Visibility toggle */}
                    {field.required ? (
                      <div className="flex items-center justify-center w-8">
                        <Icon name="lock" size={14} className="text-gray-300" />
                      </div>
                    ) : (
                      <Switch
                        size="sm"
                        checked={field.visible}
                        onChange={() => handleToggleField(field.id)}
                      />
                    )}

                    {/* Label (click to edit) */}
                    {editingId === field.id ? (
                      <Input
                        value={editLabel}
                        onChange={(v) => setEditLabel(v)}
                        onBlur={commitLabel}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === "Enter") commitLabel();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="flex-1 text-sm"
                      />
                    ) : (
                      <button
                        type="button"
                        className={`flex-1 text-left text-sm truncate ${
                          field.visible ? "text-gray-700" : "text-gray-400 line-through"
                        }`}
                        onClick={() => startEditing(field)}
                        title="Click to rename"
                      >
                        {field.label}
                        {field.required && (
                          <span className="ml-1 text-xs text-red-400">*</span>
                        )}
                      </button>
                    )}

                    {/* Edit icon hint */}
                    {editingId !== field.id && (
                      <Icon
                        name="edit-2"
                        size={12}
                        className="text-gray-300 shrink-0 opacity-0 group-hover:opacity-100"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-4 py-3 space-y-3 shrink-0">
          {/* Save Scope */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="form-scope"
                checked={!applyToAll}
                onChange={() => setApplyToAll(false)}
                className="text-blue-600"
              />
              Save for me
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="form-scope"
                checked={applyToAll}
                onChange={() => setApplyToAll(true)}
                className="text-blue-600"
              />
              Save for all users
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset to Default
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
