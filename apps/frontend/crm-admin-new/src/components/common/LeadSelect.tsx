"use client";

import { useMemo, useState, useCallback } from "react";

import { SelectInput, Icon } from "@/components/ui";

import { useLeadsList } from "@/features/leads/hooks/useLeads";
import type { LeadListItem } from "@/features/leads/types/leads.types";

// ── Types ────────────────────────────────────────────────

export interface LeadSelectOption {
  id: string;
  leadNumber: string;
  contactId: string;
  contactFirstName: string;
  contactLastName: string;
  organizationId?: string | null;
  organizationName?: string | null;
  status: string;
}

interface LeadSelectProps {
  value?: string | null;
  onChange?: (value: string | number | boolean | null) => void;
  /** Called when a lead is selected — receives full lead data for auto-fill */
  onLeadSelect?: (lead: LeadSelectOption | null) => void;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  required?: boolean;
}

// ── Component ────────────────────────────────────────────

export function LeadSelect({
  value,
  onChange,
  onLeadSelect,
  label = "Lead",
  error,
  errorMessage,
  disabled,
  required,
}: LeadSelectProps) {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useLeadsList({
    limit: 30,
    search: search.length >= 2 ? search : undefined,
  });

  const leads = useMemo<LeadSelectOption[]>(() => {
    const raw = data?.data;
    const list: LeadListItem[] = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
    return list.map((l) => ({
      id: l.id,
      leadNumber: l.leadNumber,
      contactId: l.contactId,
      contactFirstName: l.contact.firstName,
      contactLastName: l.contact.lastName,
      organizationId: l.organization?.id ?? null,
      organizationName: l.organization?.name ?? null,
      status: l.status,
    }));
  }, [data]);

  const options = useMemo(
    () =>
      leads.map((l) => ({
        label: `${l.leadNumber} – ${l.contactFirstName} ${l.contactLastName}`,
        value: l.id,
      })),
    [leads],
  );

  const handleChange = (val: string | number | boolean | null) => {
    onChange?.(val);
    if (onLeadSelect) {
      if (val) {
        const lead = leads.find((l) => l.id === val) ?? null;
        onLeadSelect(lead);
      } else {
        onLeadSelect(null);
      }
    }
  };

  const handleSearch = useCallback((term: string) => {
    setSearch(term);
  }, []);

  return (
    <SelectInput
      options={options}
      value={value}
      onChange={handleChange}
      placeholder="Type 2+ chars to search leads..."
      label={label}
      loading={isLoading}
      error={error}
      errorMessage={errorMessage}
      disabled={disabled}
      required={required}
      leftIcon={<Icon name="target" size={16} />}
      searchable
      clearable
    />
  );
}
