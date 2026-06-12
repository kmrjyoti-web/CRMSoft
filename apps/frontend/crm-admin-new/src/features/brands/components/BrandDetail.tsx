"use client";

import { useState, useMemo, useCallback } from "react";

import toast from "react-hot-toast";

import { Button, Icon, Badge, Modal, Input, Switch } from "@/components/ui";

import { ContactSelect } from "@/components/common/ContactSelect";
import { OrganizationSelect } from "@/components/common/OrganizationSelect";

import {
  useBrand,
  useBrandOrganizations,
  useBrandContacts,
  useLinkBrandOrganization,
  useUnlinkBrandOrganization,
  useLinkBrandContact,
  useUnlinkBrandContact,
} from "../hooks/useBrands";

import { BrandForm } from "./BrandForm";

import type { BrandOrganization, BrandContact } from "../types/brands.types";

// ── Props ────────────────────────────────────────────────

interface BrandDetailProps {
  brandId: string;
}

// ── Component ────────────────────────────────────────────

export function BrandDetail({ brandId }: BrandDetailProps) {
  const { data: brandData, isLoading: brandLoading } = useBrand(brandId);
  const { data: orgsData, isLoading: orgsLoading } = useBrandOrganizations(brandId);
  const { data: contactsData, isLoading: contactsLoading } = useBrandContacts(brandId);

  const linkOrgMut = useLinkBrandOrganization();
  const unlinkOrgMut = useUnlinkBrandOrganization();
  const linkContactMut = useLinkBrandContact();
  const unlinkContactMut = useUnlinkBrandContact();

  const brand = brandData?.data;
  const organizations = useMemo<BrandOrganization[]>(() => {
    const raw = orgsData?.data;
    return Array.isArray(raw) ? raw : [];
  }, [orgsData]);
  const contacts = useMemo<BrandContact[]>(() => {
    const raw = contactsData?.data;
    return Array.isArray(raw) ? raw : [];
  }, [contactsData]);

  // ── UI State ──────────────────────────────────────────

  const [editFormOpen, setEditFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"organizations" | "contacts">("organizations");

  // Link Organization modal
  const [linkOrgOpen, setLinkOrgOpen] = useState(false);
  const [linkOrgId, setLinkOrgId] = useState<string | null>(null);
  const [linkOrgPrimary, setLinkOrgPrimary] = useState(false);
  const [linkOrgNotes, setLinkOrgNotes] = useState("");

  // Link Contact modal
  const [linkContactOpen, setLinkContactOpen] = useState(false);
  const [linkContactId, setLinkContactId] = useState<string | null>(null);
  const [linkContactPrimary, setLinkContactPrimary] = useState(false);
  const [linkContactNotes, setLinkContactNotes] = useState("");

  // ── Link Org Handlers ─────────────────────────────────

  const handleOpenLinkOrg = useCallback(() => {
    setLinkOrgId(null);
    setLinkOrgPrimary(false);
    setLinkOrgNotes("");
    setLinkOrgOpen(true);
  }, []);

  const handleLinkOrg = useCallback(async () => {
    if (!linkOrgId) {
      toast.error("Please select an organization");
      return;
    }
    try {
      await linkOrgMut.mutateAsync({
        id: brandId,
        dto: {
          organizationId: linkOrgId,
          isPrimary: linkOrgPrimary,
          notes: linkOrgNotes.trim() || undefined,
        },
      });
      toast.success("Organization linked successfully");
      setLinkOrgOpen(false);
    } catch {
      toast.error("Failed to link organization");
    }
  }, [brandId, linkOrgId, linkOrgPrimary, linkOrgNotes, linkOrgMut]);

  const handleUnlinkOrg = useCallback(
    async (orgId: string) => {
      try {
        await unlinkOrgMut.mutateAsync({ id: brandId, orgId });
        toast.success("Organization unlinked");
      } catch {
        toast.error("Failed to unlink organization");
      }
    },
    [brandId, unlinkOrgMut]
  );

  // ── Link Contact Handlers ────────────────────────────

  const handleOpenLinkContact = useCallback(() => {
    setLinkContactId(null);
    setLinkContactPrimary(false);
    setLinkContactNotes("");
    setLinkContactOpen(true);
  }, []);

  const handleLinkContact = useCallback(async () => {
    if (!linkContactId) {
      toast.error("Please select a contact");
      return;
    }
    try {
      await linkContactMut.mutateAsync({
        id: brandId,
        dto: {
          contactId: linkContactId,
          isPrimary: linkContactPrimary,
          notes: linkContactNotes.trim() || undefined,
        },
      });
      toast.success("Contact linked successfully");
      setLinkContactOpen(false);
    } catch {
      toast.error("Failed to link contact");
    }
  }, [brandId, linkContactId, linkContactPrimary, linkContactNotes, linkContactMut]);

  const handleUnlinkContact = useCallback(
    async (contactId: string) => {
      try {
        await unlinkContactMut.mutateAsync({ id: brandId, contactId });
        toast.success("Contact unlinked");
      } catch {
        toast.error("Failed to unlink contact");
      }
    },
    [brandId, unlinkContactMut]
  );

  // ── Render ────────────────────────────────────────────

  if (brandLoading) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>
        Loading brand...
      </div>
    );
  }

  if (!brand) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#ef4444" }}>
        Brand not found
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    border: "1px solid #e5e7eb",
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    cursor: "pointer",
    borderBottom: isActive ? "2px solid #3b82f6" : "2px solid transparent",
    color: isActive ? "#3b82f6" : "#6b7280",
    fontWeight: isActive ? 600 : 400,
    fontSize: 14,
    background: "none",
    border: "none",
    borderBottomStyle: "solid",
    borderBottomWidth: 2,
    borderBottomColor: isActive ? "#3b82f6" : "transparent",
  });

  const listItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
  };

  return (
    <div style={{ padding: 24 }}>
      {/* ── Header Card ────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Icon name="tag" size={24} />
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
                {brand.name}
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <Badge variant="outline">{brand.code}</Badge>
                <Badge variant={brand.isActive ? "success" : "secondary"}>
                  {brand.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => setEditFormOpen(true)}>
            <Icon name="edit-3" size={16} />
            Edit
          </Button>
        </div>

        {brand.description && (
          <p style={{ margin: "12px 0 0 0", color: "#6b7280", fontSize: 14 }}>
            {brand.description}
          </p>
        )}

        {brand.website && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 8,
              fontSize: 14,
              color: "#3b82f6",
            }}
          >
            <Icon name="globe" size={14} />
            <a
              href={brand.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#3b82f6", textDecoration: "none" }}
            >
              {brand.website}
            </a>
          </div>
        )}
      </div>

      {/* ── Tabs ───────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid #e5e7eb",
          marginBottom: 16,
        }}
      >
        <button
          style={tabStyle(activeTab === "organizations")}
          onClick={() => setActiveTab("organizations")}
        >
          Organizations ({organizations.length})
        </button>
        <button
          style={tabStyle(activeTab === "contacts")}
          onClick={() => setActiveTab("contacts")}
        >
          Contacts ({contacts.length})
        </button>
      </div>

      {/* ── Organizations Tab ──────────────────────────── */}
      {activeTab === "organizations" && (
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
              Linked Organizations
            </h3>
            <Button variant="outline" size="sm" onClick={handleOpenLinkOrg}>
              <Icon name="link" size={16} />
              Link Organization
            </Button>
          </div>

          {orgsLoading ? (
            <div style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
              Loading...
            </div>
          ) : organizations.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, color: "#9ca3af" }}>
              No organizations linked yet.
            </div>
          ) : (
            <div>
              {organizations.map((org) => (
                <div key={org.id} style={listItemStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon name="building-2" size={16} />
                    <span style={{ fontWeight: 500 }}>
                      {org.organization?.name ?? org.organizationId}
                    </span>
                    {org.isPrimary && (
                      <Badge variant="primary">Primary</Badge>
                    )}
                    {org.notes && (
                      <span style={{ color: "#9ca3af", fontSize: 13 }}>
                        {org.notes}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnlinkOrg(org.organizationId)}
                    disabled={unlinkOrgMut.isPending}
                  >
                    <Icon name="unlink" size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Contacts Tab ───────────────────────────────── */}
      {activeTab === "contacts" && (
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
              Linked Contacts
            </h3>
            <Button variant="outline" size="sm" onClick={handleOpenLinkContact}>
              <Icon name="link" size={16} />
              Link Contact
            </Button>
          </div>

          {contactsLoading ? (
            <div style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
              Loading...
            </div>
          ) : contacts.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, color: "#9ca3af" }}>
              No contacts linked yet.
            </div>
          ) : (
            <div>
              {contacts.map((c) => (
                <div key={c.id} style={listItemStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon name="user" size={16} />
                    <span style={{ fontWeight: 500 }}>
                      {c.contact
                        ? `${c.contact.firstName} ${c.contact.lastName}`
                        : c.contactId}
                    </span>
                    {c.isPrimary && (
                      <Badge variant="primary">Primary</Badge>
                    )}
                    {c.notes && (
                      <span style={{ color: "#9ca3af", fontSize: 13 }}>
                        {c.notes}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnlinkContact(c.contactId)}
                    disabled={unlinkContactMut.isPending}
                  >
                    <Icon name="unlink" size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Edit Form Modal ────────────────────────────── */}
      <BrandForm
        brand={brand}
        open={editFormOpen}
        onClose={() => setEditFormOpen(false)}
      />

      {/* ── Link Organization Modal ────────────────────── */}
      <Modal
        open={linkOrgOpen}
        onClose={() => setLinkOrgOpen(false)}
        title="Link Organization"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 8 }}>
          <OrganizationSelect
            value={linkOrgId}
            onChange={(v) => setLinkOrgId(v as string | null)}
            label="Organization"
            leftIcon={<Icon name="building-2" size={16} />}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Switch
              checked={linkOrgPrimary}
              onChange={() => setLinkOrgPrimary(!linkOrgPrimary)}
              label="Primary"
            />
          </div>

          <Input
            label="Notes"
            value={linkOrgNotes}
            onChange={setLinkOrgNotes}
            leftIcon={<Icon name="file-text" size={16} />}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Button variant="secondary" onClick={() => setLinkOrgOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleLinkOrg}
              disabled={linkOrgMut.isPending}
            >
              <Icon name="link" size={16} />
              Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Link Contact Modal ─────────────────────────── */}
      <Modal
        open={linkContactOpen}
        onClose={() => setLinkContactOpen(false)}
        title="Link Contact"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 8 }}>
          <ContactSelect
            value={linkContactId}
            onChange={(v) => setLinkContactId(v as string | null)}
            label="Contact"
            leftIcon={<Icon name="user" size={16} />}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Switch
              checked={linkContactPrimary}
              onChange={() => setLinkContactPrimary(!linkContactPrimary)}
              label="Primary"
            />
          </div>

          <Input
            label="Notes"
            value={linkContactNotes}
            onChange={setLinkContactNotes}
            leftIcon={<Icon name="file-text" size={16} />}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Button variant="secondary" onClick={() => setLinkContactOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleLinkContact}
              disabled={linkContactMut.isPending}
            >
              <Icon name="link" size={16} />
              Link
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
