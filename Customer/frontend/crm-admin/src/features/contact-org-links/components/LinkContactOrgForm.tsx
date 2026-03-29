"use client";

import { useState } from "react";

import toast from "react-hot-toast";

import { Button, Card, Input, SelectInput, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { useLinkContactOrg } from "../hooks/useContactOrgLinks";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LinkContactOrgFormProps {
  contactId?: string;
  organizationId?: string;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Relation type options
// ---------------------------------------------------------------------------

const RELATION_OPTIONS = [
  { label: "Employee", value: "EMPLOYEE" },
  { label: "Owner", value: "OWNER" },
  { label: "Partner", value: "PARTNER" },
  { label: "Consultant", value: "CONSULTANT" },
  { label: "Vendor", value: "VENDOR" },
  { label: "Other", value: "OTHER" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LinkContactOrgForm({ contactId, organizationId, onClose }: LinkContactOrgFormProps) {
  const linkMut = useLinkContactOrg();

  const [formContactId, setFormContactId] = useState(contactId ?? "");
  const [formOrgId, setFormOrgId] = useState(organizationId ?? "");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [relationType, setRelationType] = useState("EMPLOYEE");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formContactId.trim()) {
      toast.error("Contact ID is required");
      return;
    }
    if (!formOrgId.trim()) {
      toast.error("Organization ID is required");
      return;
    }

    linkMut.mutate(
      {
        contactId: formContactId.trim(),
        organizationId: formOrgId.trim(),
        designation: designation.trim() || undefined,
        department: department.trim() || undefined,
        relationType: relationType || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Contact linked to organization");
          onClose();
        },
        onError: () => toast.error("Failed to link contact and organization"),
      }
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "500px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>Link Contact to Organization</h2>
        <Button variant="ghost" onClick={onClose}>
          <Icon name="x" size={16} />
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Contact ID (only if not provided) */}
            {!contactId && (
              <Input
                label="Contact ID"
                leftIcon={<Icon name="user" size={16} />}
                value={formContactId}
                onChange={(v: string) => setFormContactId(v)}
              />
            )}

            {/* Organization ID (only if not provided) */}
            {!organizationId && (
              <Input
                label="Organization ID"
                leftIcon={<Icon name="building-2" size={16} />}
                value={formOrgId}
                onChange={(v: string) => setFormOrgId(v)}
              />
            )}

            {/* Designation */}
            <Input
              label="Designation"
              leftIcon={<Icon name="badge-check" size={16} />}
              value={designation}
              onChange={(v: string) => setDesignation(v)}
            />

            {/* Department */}
            <Input
              label="Department"
              leftIcon={<Icon name="layers" size={16} />}
              value={department}
              onChange={(v: string) => setDepartment(v)}
            />

            {/* Relation Type */}
            <SelectInput
              label="Relation Type"
              leftIcon={<Icon name="link" size={16} />}
              value={relationType}
              onChange={(v) => setRelationType(String(v ?? "EMPLOYEE"))}
              options={RELATION_OPTIONS}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={linkMut.isPending}>
              {linkMut.isPending ? <LoadingSpinner /> : "Link"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
