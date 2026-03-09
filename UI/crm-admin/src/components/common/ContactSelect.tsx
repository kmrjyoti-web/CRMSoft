"use client";

import { useMemo, useCallback } from "react";

import { SelectInput, Icon } from "@/components/ui";

import { useContactsList } from "@/features/contacts/hooks/useContacts";
import { useSidePanelStore } from "@/stores/side-panel.store";

import { ContactForm } from "@/features/contacts/components/ContactForm";

interface ContactSelectProps {
  value?: string | null;
  onChange?: (value: string | number | boolean | null) => void;
  /** Called with full contact data when a contact is selected (for auto-populate). */
  onContactSelected?: (contact: { id: string; firstName: string; lastName: string; organizationId?: string | null }) => void;
  /** Called when user clicks "Quick Add" — parent handles showing inline fields. */
  onQuickAdd?: () => void;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: React.ReactNode;
}

export function ContactSelect({
  value,
  onChange,
  onContactSelected,
  onQuickAdd,
  label = "Contact",
  error,
  errorMessage,
  disabled,
  required,
  leftIcon,
}: ContactSelectProps) {
  const { data, isLoading } = useContactsList();
  const openPanel = useSidePanelStore((s) => s.openPanel);
  const closePanel = useSidePanelStore((s) => s.closePanel);

  const contactList = useMemo(() => {
    const raw = data?.data;
    const list = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
    return list as { id: string; firstName: string; lastName: string; organizationId?: string | null }[];
  }, [data]);

  const options = useMemo(() => {
    return contactList.map((c) => ({
      label: `${c.firstName} ${c.lastName}`,
      value: c.id,
    }));
  }, [contactList]);

  const handleChange = useCallback(
    (val: string | number | boolean | null) => {
      onChange?.(val);
      if (onContactSelected && val) {
        const contact = contactList.find((c) => c.id === val);
        if (contact) onContactSelected(contact);
      }
    },
    [onChange, onContactSelected, contactList],
  );

  const handleCreateContact = useCallback(() => {
    const panelId = "contact-new-from-lead";
    const formId = `sp-form-${panelId}`;
    openPanel({
      id: panelId,
      title: "New Contact",
      newTabUrl: "/contacts/new",
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
        <ContactForm
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
        onClick={handleCreateContact}
      >
        Create New Contact
      </button>
    </p>
  );

  return (
    <SelectInput
      options={options}
      value={value}
      onChange={handleChange}
      placeholder="Select contact..."
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
