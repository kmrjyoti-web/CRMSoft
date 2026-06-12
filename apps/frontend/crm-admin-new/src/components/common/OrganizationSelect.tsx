"use client";

import { useMemo, useCallback } from "react";

import { SelectInput, Icon } from "@/components/ui";

import { useOrganizationsList } from "@/features/organizations/hooks/useOrganizations";
import { useSidePanelStore } from "@/stores/side-panel.store";

import { OrganizationForm } from "@/features/organizations/components/OrganizationForm";

interface OrganizationSelectProps {
  value?: string | null;
  onChange?: (value: string | number | boolean | null) => void;
  /** Called when user clicks "Quick Add" — parent handles showing inline fields. */
  onQuickAdd?: () => void;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: React.ReactNode;
}

export function OrganizationSelect({
  value,
  onChange,
  onQuickAdd,
  label = "Organization",
  error,
  errorMessage,
  disabled,
  required,
  leftIcon,
}: OrganizationSelectProps) {
  const { data, isLoading } = useOrganizationsList();
  const openPanel = useSidePanelStore((s) => s.openPanel);
  const closePanel = useSidePanelStore((s) => s.closePanel);

  const options = useMemo(() => {
    const raw = data?.data;
    const list = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
    return list.map((org: { id: string; name: string }) => ({
      label: org.name,
      value: org.id,
    }));
  }, [data]);

  const handleCreateOrg = useCallback(() => {
    const panelId = "org-new-from-contact";
    const formId = `sp-form-${panelId}`;
    openPanel({
      id: panelId,
      title: "New Organization",
      newTabUrl: "/organizations/new",
      footerButtons: [
        {
          id: "cancel",
          label: "Cancel",
          showAs: "text" as const,
          variant: "secondary" as const,
          onClick: () => closePanel(panelId),
        },
        {
          id: "save",
          label: "Save",
          icon: "check",
          showAs: "both" as const,
          variant: "primary" as const,
          onClick: () => {
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
      content: (
        <OrganizationForm
          mode="panel"
          panelId={panelId}
          onSuccess={() => closePanel(panelId)}
          onCancel={() => closePanel(panelId)}
        />
      ),
    });
  }, [openPanel, closePanel]);

  const actionFooter = (
    <p className="mt-1 text-xs text-gray-400">
      Not found?{" "}
      {onQuickAdd && (
        <>
          <button
            type="button"
            className="text-blue-500 hover:underline"
            onClick={onQuickAdd}
          >
            Quick Add
          </button>
          {" | "}
        </>
      )}
      <button
        type="button"
        className="text-blue-500 hover:underline"
        onClick={() => onChange?.(null)}
      >
        Select as Individual
      </button>
      {" or "}
      <button
        type="button"
        className="text-blue-500 hover:underline"
        onClick={handleCreateOrg}
      >
        Create New Organization
      </button>
    </p>
  );

  return (
    <SelectInput
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Select organization..."
      label={label}
      loading={isLoading}
      error={error}
      errorMessage={errorMessage}
      disabled={disabled}
      required={required}
      leftIcon={leftIcon}
      footer={actionFooter}
      searchable
      clearable
    />
  );
}
