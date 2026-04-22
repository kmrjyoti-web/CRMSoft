"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { Input, SelectInput, DatePicker, Button, Icon } from "@/components/ui";
import { UserSelect } from "@/components/common/UserSelect";

import { useDelegateOwnership } from "../hooks/useOwnership";
import type { EntityType } from "../types/ownership.types";

// ── Entity type options (optional — can delegate all) ──────

const ENTITY_TYPE_OPTIONS: { value: EntityType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Entity Types" },
  { value: "LEAD", label: "Leads" },
  { value: "CONTACT", label: "Contacts" },
  { value: "ORGANIZATION", label: "Organizations" },
  { value: "QUOTATION", label: "Quotations" },
  { value: "TICKET", label: "Tickets" },
  { value: "RAW_CONTACT", label: "Raw Contacts" },
  { value: "PRODUCT", label: "Products" },
];

// ── Props ──────────────────────────────────────────────────

interface DelegationFormProps {
  onSuccess?: () => void;
}

// ── Component ──────────────────────────────────────────────

export function DelegationForm({ onSuccess }: DelegationFormProps) {
  const [fromUserId, setFromUserId] = useState<string | null>(null);
  const [toUserId, setToUserId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState("");
  const [entityType, setEntityType] = useState<EntityType | "ALL">("ALL");

  const delegateMut = useDelegateOwnership();

  const resetForm = () => {
    setFromUserId(null);
    setToUserId(null);
    setStartDate("");
    setEndDate("");
    setReason("");
    setEntityType("ALL");
  };

  const handleSubmit = () => {
    if (!fromUserId) {
      toast.error("Please select the user to delegate from");
      return;
    }
    if (!toUserId) {
      toast.error("Please select the user to delegate to");
      return;
    }
    if (fromUserId === toUserId) {
      toast.error("Cannot delegate to the same user");
      return;
    }
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }
    if (!endDate) {
      toast.error("Please select an end date");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please enter a reason for delegation");
      return;
    }

    delegateMut.mutate(
      {
        fromUserId,
        toUserId,
        startDate,
        endDate,
        reason: reason.trim(),
        entityType: entityType === "ALL" ? undefined : entityType,
      },
      {
        onSuccess: () => {
          toast.success("Delegation created successfully");
          resetForm();
          onSuccess?.();
        },
        onError: () => {
          toast.error("Failed to create delegation");
        },
      },
    );
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 24,
        border: "1px solid #e5e7eb",
      }}
    >
      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#111827",
          marginBottom: 20,
        }}
      >
        Create Delegation
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <UserSelect
            value={fromUserId}
            onChange={(v) => setFromUserId(v as string | null)}
            label="Delegate From"
            required
            leftIcon={<Icon name="user-minus" size={16} />}
          />

          <UserSelect
            value={toUserId}
            onChange={(v) => setToUserId(v as string | null)}
            label="Delegate To"
            required
            leftIcon={<Icon name="user-plus" size={16} />}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(v: any) => setStartDate(v ?? "")}
          />

          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(v: any) => setEndDate(v ?? "")}
          />
        </div>

        <Input
          label="Reason"
          leftIcon={<Icon name="message-square" size={16} />}
          value={reason}
          onChange={setReason}
          required
          placeholder="Why is this delegation needed?"
        />

        <SelectInput
          label="Entity Type (optional)"
          leftIcon={<Icon name="layers" size={16} />}
          options={ENTITY_TYPE_OPTIONS}
          value={entityType}
          onChange={(v) => setEntityType(v as EntityType | "ALL")}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="outline" onClick={resetForm}>
            Reset
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={delegateMut.isPending}
          >
            <Icon name="arrow-right-left" size={16} />
            {delegateMut.isPending ? "Creating..." : "Create Delegation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
