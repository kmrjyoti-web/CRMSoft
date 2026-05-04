"use client";

import { useState, useMemo } from "react";

import toast from "react-hot-toast";

import { Button, Card, Badge, Icon, SelectInput, Modal } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  useContactOrganizations,
  useOrganizationContacts,
  useSetPrimaryContact,
  useChangeRelation,
  useUnlinkContactOrg,
} from "../hooks/useContactOrgLinks";
import type { ContactOrgMapping } from "../types/contact-org-links.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ContactOrgManagerProps {
  contactId?: string;
  organizationId?: string;
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

export function ContactOrgManager({ contactId, organizationId }: ContactOrgManagerProps) {
  const isContactMode = !!contactId;

  const { data: contactOrgsData, isLoading: contactOrgsLoading } = useContactOrganizations(contactId ?? "");
  const { data: orgContactsData, isLoading: orgContactsLoading } = useOrganizationContacts(organizationId ?? "");
  const setPrimaryMut = useSetPrimaryContact();
  const changeRelMut = useChangeRelation();
  const unlinkMut = useUnlinkContactOrg();

  const [changeRelId, setChangeRelId] = useState<string | null>(null);
  const [newRelation, setNewRelation] = useState("");

  const isLoading = isContactMode ? contactOrgsLoading : orgContactsLoading;
  const rawData = isContactMode ? contactOrgsData : orgContactsData;

  const mappings: ContactOrgMapping[] = useMemo(() => {
    const raw = rawData?.data ?? rawData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [rawData]);

  // ── Handlers ────────────────────────────────────────────
  function handleSetPrimary(mapping: ContactOrgMapping) {
    setPrimaryMut.mutate(mapping.id, {
      onSuccess: () => toast.success("Set as primary"),
      onError: () => toast.error("Failed to set primary"),
    });
  }

  function handleOpenChangeRelation(mapping: ContactOrgMapping) {
    setChangeRelId(mapping.id);
    setNewRelation(mapping.relationType);
  }

  function handleSaveRelation() {
    if (!changeRelId || !newRelation) return;
    changeRelMut.mutate(
      { id: changeRelId, dto: { relationType: newRelation } },
      {
        onSuccess: () => {
          toast.success("Relation updated");
          setChangeRelId(null);
          setNewRelation("");
        },
        onError: () => toast.error("Failed to update relation"),
      }
    );
  }

  function handleUnlink(mapping: ContactOrgMapping) {
    const name = isContactMode ? mapping.organizationName : mapping.contactName;
    if (!confirm(`Unlink "${name}"?`)) return;
    unlinkMut.mutate(mapping.id, {
      onSuccess: () => toast.success("Unlinked successfully"),
      onError: () => toast.error("Failed to unlink"),
    });
  }

  // ── Loading ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 600 }}>
        {isContactMode ? "Linked Organizations" : "Linked Contacts"}
      </h3>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Name</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Designation</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Department</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Relation Type</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Primary</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappings.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "24px 16px", textAlign: "center", color: "#6b7280" }}>
                    No linked {isContactMode ? "organizations" : "contacts"} found
                  </td>
                </tr>
              )}
              {mappings.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                    {isContactMode ? m.organizationName : m.contactName}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>{m.designation || "\u2014"}</td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>{m.department || "\u2014"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="secondary">{m.relationType}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {m.isPrimary ? (
                      <Badge variant="primary">Primary</Badge>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>\u2014</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {!m.isPrimary && (
                        <Button
                          variant="ghost"
                          onClick={() => handleSetPrimary(m)}
                          disabled={setPrimaryMut.isPending}
                        >
                          <Icon name="star" size={14} />
                        </Button>
                      )}
                      <Button variant="ghost" onClick={() => handleOpenChangeRelation(m)}>
                        <Icon name="repeat" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleUnlink(m)}
                        disabled={unlinkMut.isPending}
                      >
                        <Icon name="unlink" size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Change Relation Modal */}
      <Modal
        open={!!changeRelId}
        onClose={() => setChangeRelId(null)}
        title="Change Relation Type"
      >
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <SelectInput
            label="Relation Type"
            leftIcon={<Icon name="link" size={16} />}
            value={newRelation}
            onChange={(v) => setNewRelation(String(v ?? ""))}
            options={RELATION_OPTIONS}
          />
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setChangeRelId(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveRelation} disabled={changeRelMut.isPending}>
              {changeRelMut.isPending ? <LoadingSpinner /> : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
