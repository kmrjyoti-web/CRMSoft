"use client";

import { useMemo, useCallback } from "react";

import { SmartSearch } from "./SmartSearch";
import type { SmartSearchField } from "./SmartSearch";

import { useContactsList } from "@/features/contacts/hooks/useContacts";
import { useSidePanelStore } from "@/stores/side-panel.store";

import { ContactForm } from "@/features/contacts/components/ContactForm";

// ── Types ────────────────────────────────────────────────

interface ContactRow {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  designation?: string;
  department?: string;
  organizationId?: string | null;
  organizationName?: string;
}

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

// ── Field definitions for SmartSearch ────────────────────

const CONTACT_FIELDS: SmartSearchField[] = [
  { key: "NM", label: "Full Name", accessor: "fullName", isDefault: true },
  { key: "FN", label: "First Name", accessor: "firstName" },
  { key: "LN", label: "Last Name", accessor: "lastName" },
  { key: "DG", label: "Designation", accessor: "designation" },
  { key: "DP", label: "Department", accessor: "department" },
  { key: "CM", label: "Company", accessor: "organizationName" },
];

// ── Component ────────────────────────────────────────────

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
}: ContactSelectProps) {
  const { data, isLoading } = useContactsList();
  const openPanel = useSidePanelStore((s) => s.openPanel);
  const closePanel = useSidePanelStore((s) => s.closePanel);

  const contactList = useMemo<ContactRow[]>(() => {
    const raw = data?.data;
    const list = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
    return (list as any[]).map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      fullName: `${c.firstName} ${c.lastName}`,
      designation: c.designation,
      department: c.department,
      organizationId: c.organizationId,
      organizationName: c.contactOrganizations?.[0]?.organization?.name ?? "",
    }));
  }, [data]);

  const handleChange = useCallback(
    (id: string | null) => {
      onChange?.(id);
      if (onContactSelected && id) {
        const contact = contactList.find((c) => c.id === id);
        if (contact) {
          onContactSelected({
            id: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            organizationId: contact.organizationId,
          });
        }
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
    <SmartSearch<ContactRow>
      items={contactList}
      fields={CONTACT_FIELDS}
      idAccessor="id"
      value={value}
      onChange={handleChange}
      formatSelected={(c) => c.fullName}
      label={label}
      placeholder="Search by name, company, designation..."
      error={error}
      errorMessage={errorMessage}
      disabled={disabled}
      required={required}
      loading={isLoading}
      footer={actionFooter}
      minDropdownWidth={300}
    />
  );
}
