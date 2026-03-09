"use client";

import { useState } from "react";

import { Badge, Icon } from "@/components/ui";
import {
  EntityDashboardLayout,
  type DashboardTab,
} from "@/components/common/EntityDashboardLayout";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/format-date";

import { useContactDetail } from "../hooks/useContacts";

import type { CommunicationType } from "../types/contacts.types";

// ── Props ────────────────────────────────────────────────

interface ContactDashboardProps {
  entityId: string;
  onEdit: () => void;
  onClose: () => void;
}

// ── Helpers ──────────────────────────────────────────────

const COMM_TYPE_ICON: Record<CommunicationType, string> = {
  EMAIL: "mail",
  PHONE: "phone",
  MOBILE: "smartphone",
  WHATSAPP: "message-circle",
  ADDRESS: "map-pin",
};

// ── Tabs ─────────────────────────────────────────────────

const TABS: DashboardTab[] = [
  { id: "overview", label: "Overview", icon: "layout-grid" },
  { id: "leads", label: "Leads", icon: "target" },
  { id: "organizations", label: "Organizations", icon: "building" },
  { id: "communications", label: "Communications", icon: "mail" },
];

// ── Component ────────────────────────────────────────────

export function ContactDashboard({
  entityId,
  onEdit,
  onClose,
}: ContactDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading } = useContactDetail(entityId);
  const contact = data?.data;

  // ── Profile Card ─────────────────────────────────────

  const primaryEmail =
    contact?.communications?.find(
      (c) => c.type === "EMAIL" && c.isPrimary,
    )?.value ??
    contact?.communications?.find((c) => c.type === "EMAIL")?.value ??
    "\u2014";

  const primaryPhone =
    contact?.communications?.find(
      (c) => c.type === "MOBILE" && c.isPrimary,
    )?.value ??
    contact?.communications?.find(
      (c) => c.type === "PHONE" && c.isPrimary,
    )?.value ??
    contact?.communications?.find(
      (c) => c.type === "MOBILE" || c.type === "PHONE",
    )?.value ??
    "\u2014";

  const primaryOrg =
    contact?.contactOrganizations?.[0]?.organization?.name ?? "\u2014";

  const profileCard = contact ? (
    <div style={{ textAlign: "center" }}>
      {/* Avatar */}
      <div className="sp-dashboard__avatar">
        {contact.firstName[0]}
        {contact.lastName[0]}
      </div>

      {/* Full Name */}
      <p style={{ fontWeight: 700, fontSize: 16, marginTop: 12 }}>
        {contact.firstName} {contact.lastName}
      </p>

      {/* Designation + Department */}
      {(contact.designation || contact.department) && (
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
          {[contact.designation, contact.department]
            .filter(Boolean)
            .join(" \u2022 ")}
        </p>
      )}

      {/* Status Badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginTop: 12,
        }}
      >
        <Badge variant={contact.isActive ? "success" : "secondary"}>
          {contact.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Key Info Table */}
      <dl className="sp-dashboard__info-table" style={{ marginTop: 20 }}>
        <dt>Email</dt>
        <dd>{primaryEmail}</dd>

        <dt>Phone</dt>
        <dd>{primaryPhone}</dd>

        <dt>Company</dt>
        <dd>{primaryOrg}</dd>

        <dt>Created</dt>
        <dd>{formatDate(contact.createdAt)}</dd>
      </dl>
    </div>
  ) : null;

  // ── Tab Content ──────────────────────────────────────

  function renderTabContent() {
    if (!contact) return null;

    switch (activeTab) {
      // ── Overview ──────────────────────────────────────
      case "overview":
        return (
          <div>
            {/* KPI Row */}
            <div className="sp-dashboard__kpi-row">
              <KpiCard
                title="Leads"
                value={contact.counts?.leads ?? 0}
                icon="target"
                color="#3b82f6"
              />
              <KpiCard
                title="Communications"
                value={contact.counts?.communications ?? 0}
                icon="mail"
                color="#8b5cf6"
              />
              <KpiCard
                title="Activities"
                value={contact.counts?.activities ?? 0}
                icon="activity"
                color="#f59e0b"
              />
              <KpiCard
                title="Organizations"
                value={contact.contactOrganizations?.length ?? 0}
                icon="building"
                color="#10b981"
              />
            </div>

            {/* Recent Communications */}
            <div style={{ marginTop: 20 }}>
              <h4
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#64748b",
                  marginBottom: 10,
                }}
              >
                Recent Communications
              </h4>

              {contact.communications && contact.communications.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {contact.communications.slice(0, 5).map((comm) => (
                    <div
                      key={comm.id}
                      className="rounded-md border border-gray-100 px-3 py-2"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Icon
                        name={COMM_TYPE_ICON[comm.type] ?? "mail"}
                        size={14}
                        color="#64748b"
                      />
                      <span style={{ fontSize: 14, flex: 1 }}>
                        {comm.value}
                      </span>
                      {comm.isPrimary && (
                        <Badge variant="primary">Primary</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="rounded-lg border border-gray-200 bg-white p-6"
                  style={{ textAlign: "center" }}
                >
                  <Icon name="mail" size={32} color="#cbd5e1" />
                  <p
                    style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}
                  >
                    No communications recorded.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      // ── Leads ─────────────────────────────────────────
      case "leads":
        return (
          <div>
            {contact.leads && contact.leads.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {contact.leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-md border border-gray-100 px-3 py-2"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Icon name="target" size={14} color="#3b82f6" />
                    <span
                      style={{ fontSize: 14, fontWeight: 600, flex: 1 }}
                    >
                      {lead.leadNumber}
                    </span>
                    <StatusBadge status={lead.status} />
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      {formatDate(lead.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-lg border border-gray-200 bg-white p-6"
                style={{ textAlign: "center" }}
              >
                <Icon name="target" size={32} color="#cbd5e1" />
                <p
                  style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}
                >
                  No leads found.
                </p>
              </div>
            )}
          </div>
        );

      // ── Organizations ─────────────────────────────────
      case "organizations":
        return (
          <div>
            {contact.contactOrganizations &&
            contact.contactOrganizations.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {contact.contactOrganizations.map((co) => (
                  <div
                    key={co.id}
                    className="rounded-md border border-gray-100 px-3 py-2"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Icon name="building" size={14} color="#10b981" />
                    <span
                      style={{ fontSize: 14, fontWeight: 600, flex: 1 }}
                    >
                      {co.organization.name}
                    </span>
                    {co.organization.industry && (
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>
                        {co.organization.industry}
                      </span>
                    )}
                    <Badge variant="outline">{co.relationType}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-lg border border-gray-200 bg-white p-6"
                style={{ textAlign: "center" }}
              >
                <Icon name="building" size={32} color="#cbd5e1" />
                <p
                  style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}
                >
                  No organizations linked.
                </p>
              </div>
            )}
          </div>
        );

      // ── Communications ────────────────────────────────
      case "communications":
        return (
          <div>
            {contact.communications && contact.communications.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {contact.communications.map((comm) => (
                  <div
                    key={comm.id}
                    className="rounded-md border border-gray-100 px-3 py-2"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Icon
                      name={COMM_TYPE_ICON[comm.type] ?? "mail"}
                      size={14}
                      color="#64748b"
                    />
                    <Badge variant="outline">{comm.type}</Badge>
                    <span style={{ fontSize: 14, flex: 1 }}>
                      {comm.value}
                    </span>
                    {comm.isPrimary && (
                      <Badge variant="primary">Primary</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-lg border border-gray-200 bg-white p-6"
                style={{ textAlign: "center" }}
              >
                <Icon name="mail" size={32} color="#cbd5e1" />
                <p
                  style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}
                >
                  No communications recorded.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  }

  // ── Render ───────────────────────────────────────────

  return (
    <EntityDashboardLayout
      profileCard={profileCard}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={isLoading}
    >
      {renderTabContent()}
    </EntityDashboardLayout>
  );
}
