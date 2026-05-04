"use client";

import { useState } from "react";

import { Badge, Icon } from "@/components/ui";
import {
  EntityDashboardLayout,
  type DashboardTab,
} from "@/components/common/EntityDashboardLayout";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { formatDate } from "@/lib/format-date";

import { useOrganizationDetail } from "../hooks/useOrganizations";

// ── Props ────────────────────────────────────────────────

interface OrganizationDashboardProps {
  entityId: string;
  onEdit: () => void;
  onClose: () => void;
}

// ── Helpers ──────────────────────────────────────────────

function getLeadStatusVariant(
  status: string,
): "success" | "danger" | "outline" {
  switch (status) {
    case "WON":
      return "success";
    case "LOST":
      return "danger";
    default:
      return "outline";
  }
}

function getLeadPriorityVariant(
  priority: string,
): "secondary" | "warning" | "danger" {
  switch (priority) {
    case "HIGH":
      return "warning";
    case "URGENT":
      return "danger";
    case "LOW":
    case "MEDIUM":
    default:
      return "secondary";
  }
}

// ── Tabs ─────────────────────────────────────────────────

const TABS: DashboardTab[] = [
  { id: "overview", label: "Overview", icon: "layout-grid" },
  { id: "contacts", label: "Contacts", icon: "users" },
  { id: "leads", label: "Leads", icon: "target" },
];

// ── Component ────────────────────────────────────────────

export function OrganizationDashboard({
  entityId,
  onEdit,
  onClose,
}: OrganizationDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading } = useOrganizationDetail(entityId);

  const org = data?.data;

  // ── Profile Card ─────────────────────────────────────

  const profileCard = org ? (
    <div style={{ textAlign: "center" }}>
      {/* Avatar */}
      <div className="sp-dashboard__avatar">{org.name[0]}</div>

      {/* Org Name */}
      <p style={{ fontWeight: 700, fontSize: 16, marginTop: 12 }}>
        {org.name}
      </p>

      {/* Industry Badge */}
      {org.industry && (
        <div style={{ marginTop: 8 }}>
          <Badge variant="outline">{org.industry}</Badge>
        </div>
      )}

      {/* Status Badge */}
      <div style={{ marginTop: 8 }}>
        <Badge variant={org.isActive ? "success" : "danger"}>
          {org.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Key Info Table */}
      <dl className="sp-dashboard__info-table" style={{ marginTop: 20 }}>
        <dt>Phone</dt>
        <dd>{org.phone || "\u2014"}</dd>

        <dt>Email</dt>
        <dd>{org.email || "\u2014"}</dd>

        <dt>Website</dt>
        <dd>{org.website || "\u2014"}</dd>

        <dt>City</dt>
        <dd>
          {org.city || org.state
            ? `${org.city ?? ""}${org.state ? `, ${org.state}` : ""}`
            : "\u2014"}
        </dd>

        <dt>GST No</dt>
        <dd>{org.gstNumber || "\u2014"}</dd>

        <dt>Revenue</dt>
        <dd>
          {org.annualRevenue != null
            ? `\u20B9 ${org.annualRevenue.toLocaleString("en-IN")}`
            : "\u2014"}
        </dd>
      </dl>
    </div>
  ) : null;

  // ── Tab Content ──────────────────────────────────────

  function renderTabContent() {
    if (!org) return null;

    switch (activeTab) {
      // ── Overview ──────────────────────────────────────
      case "overview":
        return (
          <div>
            {/* KPI Row */}
            <div className="sp-dashboard__kpi-row">
              <KpiCard
                title="Contacts"
                value={org._count?.contacts ?? 0}
                icon="users"
                color="#3b82f6"
              />
              <KpiCard
                title="Leads"
                value={org._count?.leads ?? 0}
                icon="target"
                color="#f59e0b"
              />
              <KpiCard
                title="Revenue"
                value={`\u20B9 ${org.annualRevenue?.toLocaleString("en-IN") ?? "0"}`}
                icon="indian-rupee"
                color="#10b981"
              />
              <KpiCard
                title="Employees"
                value={org.numberOfEmployees ?? 0}
                icon="building"
                color="#8b5cf6"
              />
            </div>

            {/* Address Card */}
            {(org.address || org.city) && (
              <div
                className="rounded-lg border border-gray-200 bg-white p-4"
                style={{ marginTop: 20 }}
              >
                <h4
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#64748b",
                    marginBottom: 8,
                  }}
                >
                  <Icon name="map-pin" size={14} /> Address
                </h4>
                <p style={{ fontSize: 14, color: "#1e293b" }}>
                  {[org.address, org.city, org.state, org.country, org.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}

            {/* Notes */}
            {org.notes && (
              <div
                className="rounded-lg border border-gray-200 bg-white p-4"
                style={{ marginTop: 20 }}
              >
                <h4
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#64748b",
                    marginBottom: 8,
                  }}
                >
                  <Icon name="file-text" size={14} /> Notes
                </h4>
                <p
                  style={{
                    fontSize: 14,
                    color: "#1e293b",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {org.notes}
                </p>
              </div>
            )}
          </div>
        );

      // ── Contacts ──────────────────────────────────────
      case "contacts":
        return (
          <div>
            {org.contacts && org.contacts.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {org.contacts.map((oc) => (
                  <div
                    key={oc.id}
                    className="rounded-md border border-gray-100 px-3 py-2"
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <span
                          style={{ fontSize: 14, fontWeight: 600 }}
                        >
                          {oc.contact.firstName} {oc.contact.lastName}
                        </span>
                        {oc.designation && (
                          <span
                            style={{
                              fontSize: 12,
                              color: "#64748b",
                              marginLeft: 8,
                            }}
                          >
                            {oc.designation}
                          </span>
                        )}
                      </div>
                      <Badge variant="outline">{oc.relationType}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-lg border border-gray-200 bg-white p-6"
                style={{ textAlign: "center" }}
              >
                <Icon name="users" size={32} color="#cbd5e1" />
                <p
                  style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}
                >
                  No contacts linked.
                </p>
              </div>
            )}
          </div>
        );

      // ── Leads ─────────────────────────────────────────
      case "leads":
        return (
          <div>
            {org.leads && org.leads.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {org.leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-md border border-gray-100 px-3 py-2"
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 600 }}>
                        {lead.leadNumber}
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Badge variant={getLeadStatusVariant(lead.status)}>
                          {lead.status}
                        </Badge>
                        <Badge variant={getLeadPriorityVariant(lead.priority)}>
                          {lead.priority}
                        </Badge>
                      </div>
                    </div>
                    {lead.createdAt && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          marginTop: 4,
                        }}
                      >
                        Created: {formatDate(lead.createdAt)}
                      </p>
                    )}
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
