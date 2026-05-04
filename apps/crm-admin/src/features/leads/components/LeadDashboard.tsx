"use client";

import { useState, useCallback } from "react";

import toast from "react-hot-toast";

import { Badge, Icon, Button, TextareaInput, SelectInput } from "@/components/ui";
import {
  EntityDashboardLayout,
  type DashboardTab,
} from "@/components/common/EntityDashboardLayout";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { formatDate, relativeTime } from "@/lib/format-date";
import { useLeadWorkflowHistory } from "@/features/workflows/hooks/useWorkflowExecution";
import { useCreateActivity } from "@/features/activities/hooks/useActivities";

import { useLeadDetail } from "../hooks/useLeads";
import { LeadPipeline } from "./LeadPipeline";

import { useQuotationsList } from "@/features/quotations/hooks/useQuotations";
import { useInvoicesList, usePaymentsList } from "@/features/finance/hooks/useFinance";
import { useProformaList } from "@/features/finance/hooks/useProforma";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { QuotationForm } from "@/features/quotations/components/QuotationForm";
import { InvoiceForm } from "@/features/finance/components/InvoiceForm";
import { ProformaForm } from "@/features/finance/components/ProformaForm";

import type { LeadPriority, LeadStatus } from "../types/leads.types";
import type { ActivityType } from "@/features/activities/types/activities.types";

// ── Props ────────────────────────────────────────────────

interface LeadDashboardProps {
  entityId: string;
  onEdit: () => void;
  onClose: () => void;
}

// ── Helpers ──────────────────────────────────────────────

function getPriorityVariant(
  priority: LeadPriority,
): "secondary" | "warning" | "danger" {
  switch (priority) {
    case "LOW":
    case "MEDIUM":
      return "secondary";
    case "HIGH":
      return "warning";
    case "URGENT":
      return "danger";
    default:
      return "secondary";
  }
}

function getStatusVariant(
  status: LeadStatus,
): "success" | "danger" | "warning" | "outline" {
  switch (status) {
    case "WON":
      return "success";
    case "LOST":
      return "danger";
    case "ON_HOLD":
      return "warning";
    default:
      return "outline";
  }
}

// ── Activity type helpers ────────────────────────────────

const ACTIVITY_TYPE_OPTIONS: { value: ActivityType; label: string; icon: string; color: string }[] = [
  { value: "CALL", label: "Call", icon: "phone", color: "#3b82f6" },
  { value: "EMAIL", label: "Email", icon: "mail", color: "#8b5cf6" },
  { value: "MEETING", label: "Meeting", icon: "calendar", color: "#f59e0b" },
  { value: "NOTE", label: "Note", icon: "edit", color: "#64748b" },
  { value: "WHATSAPP", label: "WhatsApp", icon: "phone", color: "#22c55e" },
  { value: "SMS", label: "SMS", icon: "send", color: "#06b6d4" },
  { value: "VISIT", label: "Visit", icon: "map-pin", color: "#ef4444" },
];

function getActivityIcon(type: string): string {
  return ACTIVITY_TYPE_OPTIONS.find((o) => o.value === type)?.icon ?? "activity";
}

function getActivityColor(type: string): string {
  return ACTIVITY_TYPE_OPTIONS.find((o) => o.value === type)?.color ?? "#64748b";
}

const REMINDER_OPTIONS = [
  { value: "at_start", label: "When event starts" },
  { value: "15min", label: "15 minutes before" },
  { value: "30min", label: "30 minutes before" },
  { value: "1hour", label: "1 hour before" },
  { value: "2hours", label: "2 hours before" },
  { value: "1day", label: "1 day before" },
];

const ACTIONS_MENU = [
  { key: "calendar", icon: "calendar", label: "Add to calendar" },
  { key: "address", icon: "map-pin", label: "Enter address" },
  { key: "link", icon: "link", label: "Attach link" },
  { key: "file", icon: "paperclip", label: "Attach file" },
];

// ── Tabs ─────────────────────────────────────────────────

const TABS: DashboardTab[] = [
  { id: "overview", label: "Overview", icon: "layout-dashboard" },
  { id: "activities", label: "Activities", icon: "activity" },
  { id: "quotations", label: "Quotations", icon: "file-text" },
  { id: "proforma", label: "Proforma", icon: "file-check" },
  { id: "invoices", label: "Invoices", icon: "receipt" },
  { id: "payments", label: "Payments", icon: "indian-rupee" },
  { id: "contact", label: "Contact", icon: "user" },
  { id: "organization", label: "Organization", icon: "building-2" },
];

// ── Component ────────────────────────────────────────────

export function LeadDashboard({
  entityId,
  onEdit,
  onClose,
}: LeadDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [actSubject, setActSubject] = useState("");
  const [actDescription, setActDescription] = useState("");
  const [actType, setActType] = useState<ActivityType>("CALL");
  const [actScheduledAt, setActScheduledAt] = useState("");
  const [actLocation, setActLocation] = useState("");
  const [actReminder, setActReminder] = useState("");
  const [showReminderMenu, setShowReminderMenu] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const { data, isLoading, refetch } = useLeadDetail(entityId);
  const { data: historyData } = useLeadWorkflowHistory(entityId);
  const createActivity = useCreateActivity();

  // Quotations, Proformas, Invoices, Payments data
  const { data: quotationsData } = useQuotationsList({ leadId: entityId, limit: 100 });
  const { data: proformasData } = useProformaList({ leadId: entityId, limit: 100 });
  const { data: invoicesData } = useInvoicesList({ leadId: entityId, limit: 100 });
  const { data: paymentsData } = usePaymentsList({ leadId: entityId, limit: 100 });

  const { handleCreate: handleNewQuotation } = useEntityPanel({
    entityKey: "quotation",
    entityLabel: "Quotation",
    FormComponent: QuotationForm,
    idProp: "quotationId",
    editRoute: "/quotations/:id/edit",
    createRoute: "/quotations/new",
  });

  const { handleCreate: handleNewInvoice } = useEntityPanel({
    entityKey: "invoice",
    entityLabel: "Invoice",
    FormComponent: InvoiceForm,
    idProp: "invoiceId",
    editRoute: "/invoices/:id/edit",
    createRoute: "/invoices/new",
  });

  const { handleCreate: handleNewProforma } = useEntityPanel({
    entityKey: "proforma",
    entityLabel: "Proforma Invoice",
    FormComponent: ProformaForm,
    idProp: "proformaId",
    editRoute: "/finance/proforma-invoices/:id/edit",
    createRoute: "/finance/proforma-invoices/new",
  });

  const lead = data?.data;
  const quotations = quotationsData?.data ?? [];
  const proformas = proformasData?.data ?? [];
  const invoices = invoicesData?.data ?? [];
  const payments = paymentsData?.data ?? [];

  const handleAddActivity = useCallback(async () => {
    if (!actSubject.trim()) {
      toast.error("Subject is required");
      return;
    }
    try {
      await createActivity.mutateAsync({
        type: actType,
        subject: actSubject.trim(),
        description: actDescription.trim() || undefined,
        scheduledAt: actScheduledAt || undefined,
        leadId: entityId,
      });
      toast.success("Activity added");
      setActSubject("");
      setActDescription("");
      setActScheduledAt("");
      setActLocation("");
      setActReminder("");
      setShowAddActivity(false);
      refetch();
    } catch {
      toast.error("Failed to add activity");
    }
  }, [actType, actSubject, actDescription, actScheduledAt, entityId, createActivity, refetch]);

  // ── Profile Card ─────────────────────────────────────

  const profileCard = lead ? (
    <div style={{ textAlign: "center" }}>
      {/* Avatar */}
      <div className="sp-dashboard__avatar">
        {lead.contact.firstName[0]}
        {lead.contact.lastName[0]}
      </div>

      {/* Lead Number */}
      <p style={{ fontWeight: 700, fontSize: 16, marginTop: 12 }}>
        {lead.leadNumber}
      </p>

      {/* Contact Name */}
      <p style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}>
        {lead.contact.firstName} {lead.contact.lastName}
      </p>

      {/* Organization */}
      {lead.organization && (
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
          {lead.organization.name}
        </p>
      )}

      {/* Status + Priority Badges */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginTop: 12,
        }}
      >
        <Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
        <Badge variant={getPriorityVariant(lead.priority)}>
          {lead.priority}
        </Badge>
      </div>

      {/* Key Info Table */}
      <dl className="sp-dashboard__info-table" style={{ marginTop: 20 }}>
        <dt>Assignee</dt>
        <dd>
          {lead.allocatedTo
            ? `${lead.allocatedTo.firstName} ${lead.allocatedTo.lastName}`
            : "\u2014"}
        </dd>

        <dt>Expected Value</dt>
        <dd>
          {lead.expectedValue != null
            ? `\u20B9 ${lead.expectedValue.toLocaleString("en-IN")}`
            : "\u2014"}
        </dd>

        <dt>Close Date</dt>
        <dd>
          {lead.expectedCloseDate
            ? formatDate(lead.expectedCloseDate)
            : "\u2014"}
        </dd>

        <dt>Created</dt>
        <dd>{formatDate(lead.createdAt)}</dd>
      </dl>
    </div>
  ) : null;

  // ── Tab Content ──────────────────────────────────────

  function renderTabContent() {
    if (!lead) return null;

    // Build timeline entries from activities only
    const activities = lead.activities ?? [];

    switch (activeTab) {
      // ── Overview ──────────────────────────────────────
      case "overview":
        return (
          <div>
            {/* KPI Row */}
            <div className="sp-dashboard__kpi-row">
              <KpiCard
                title="Activities"
                value={lead._count?.activities ?? 0}
                icon="activity"
                color="#3b82f6"
                variant="clean"
              />
              <KpiCard
                title="Demos"
                value={lead._count?.demos ?? 0}
                icon="monitor"
                color="#f59e0b"
                variant="clean"
              />
              <KpiCard
                title="Quotations"
                value={lead._count?.quotations ?? 0}
                icon="file-text"
                color="#10b981"
                variant="clean"
              />
              <KpiCard
                title="Expected Value"
                value={`\u20B9 ${lead.expectedValue?.toLocaleString("en-IN") ?? "0"}`}
                icon="indian-rupee"
                color="#8b5cf6"
                variant="clean"
              />
            </div>

            {/* Notes */}
            {lead.notes && (
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
                  <Icon name="sticky-note" size={14} /> Notes
                </h4>
                <p style={{ fontSize: 14, color: "#1e293b", whiteSpace: "pre-wrap" }}>
                  {lead.notes}
                </p>
              </div>
            )}

            {/* ── Activities Timeline ── */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                  <Icon name="activity" size={14} /> Recent Activities
                </h4>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  {activities.length} total
                </span>
              </div>
              {activities.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6" style={{ textAlign: "center" }}>
                  <Icon name="activity" size={32} color="#cbd5e1" />
                  <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
                    No activities yet.
                  </p>
                </div>
              ) : (
                <div className="activity-timeline">
                  {activities.map((a) => {
                    const iconColor = getActivityColor(a.type);
                    return (
                      <div key={a.id} className="activity-timeline__item">
                        <div
                          className="activity-timeline__icon"
                          style={{ background: `${iconColor}15`, color: iconColor }}
                        >
                          <Icon name={getActivityIcon(a.type)} size={14} color={iconColor} />
                        </div>
                        <div className="activity-timeline__body">
                          <div className="activity-timeline__header">
                            <span className="activity-timeline__subject">{a.subject}</span>
                            <Badge variant="outline" style={{ fontSize: 10 }}>{a.type}</Badge>
                          </div>
                          {a.outcome && (
                            <p className="activity-timeline__outcome">
                              <Icon name="check" size={12} color="#16a34a" /> {a.outcome}
                            </p>
                          )}
                          <div className="activity-timeline__meta">
                            {a.scheduledAt && (
                              <span><Icon name="calendar" size={11} /> {formatDate(a.scheduledAt, "dd MMM, hh:mm a")}</span>
                            )}
                            {a.completedAt && (
                              <span style={{ color: "#16a34a" }}><Icon name="check" size={11} /> Completed {relativeTime(a.completedAt)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      // ── Activities ────────────────────────────────────
      case "activities":
        return (
          <div>
            {/* ── Quick Add Activity ─────────────────── */}
            {!showAddActivity ? (
              <button
                type="button"
                className="quick-add-trigger"
                onClick={() => setShowAddActivity(true)}
              >
                <Icon name="plus" size={16} color="#3b82f6" />
                <span>Add a new activity</span>
                <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>Plan your next action</span>
              </button>
            ) : (
              <div className="quick-add-card">
                {/* ── Header with colored type badge ──── */}
                <div className="quick-add-card__header">
                  <input
                    type="text"
                    className="quick-add-card__subject"
                    placeholder="Activity subject..."
                    value={actSubject}
                    onChange={(e) => setActSubject(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddActivity(); }}
                    autoFocus
                  />
                  <div className="quick-add-card__header-icons">
                    {/* Activity type color dot */}
                    <span
                      className="quick-add-card__type-dot"
                      style={{ background: getActivityColor(actType) }}
                      title={actType}
                    />
                    {/* Activity type icon */}
                    <span className="quick-add-card__icon-btn" title="Activity type">
                      <Icon name={getActivityIcon(actType)} size={15} color={getActivityColor(actType)} />
                    </span>
                  </div>
                </div>

                {/* ── Description ───────────────────── */}
                <TextareaInput
                  label="Description"
                  value={actDescription}
                  onChange={(e) => setActDescription(e.target.value)}
                  rows={2}
                />

                {/* ── Chip Row: date, reminder, actions */}
                <div className="quick-add-card__row">
                  <div className="quick-add-card__chips">
                    {/* Date/time chip */}
                    <div className="quick-add-card__chip quick-add-card__chip--date">
                      <Icon name="calendar" size={13} color="#3b82f6" />
                      <input
                        type="datetime-local"
                        value={actScheduledAt}
                        onChange={(e) => setActScheduledAt(e.target.value)}
                        style={{ border: "none", background: "none", fontSize: 13, color: "#1e40af", fontWeight: 600, outline: "none", width: 160 }}
                      />
                    </div>

                    {/* Reminder bell */}
                    <div className="quick-add-card__dropdown-wrap">
                      <button
                        type="button"
                        className={`quick-add-card__icon-btn${actReminder ? " quick-add-card__icon-btn--active" : ""}`}
                        title="Set reminder"
                        onClick={() => { setShowReminderMenu(!showReminderMenu); setShowActionsMenu(false); }}
                      >
                        <Icon name="bell" size={15} color={actReminder ? "#3b82f6" : "#94a3b8"} />
                      </button>
                      {showReminderMenu && (
                        <div className="quick-add-card__dropdown">
                          <div className="quick-add-card__dropdown-title">Reminder</div>
                          {REMINDER_OPTIONS.map((r) => (
                            <button
                              key={r.value}
                              type="button"
                              className={`quick-add-card__dropdown-item${actReminder === r.value ? " active" : ""}`}
                              onClick={() => { setActReminder(actReminder === r.value ? "" : r.value); setShowReminderMenu(false); }}
                            >
                              {actReminder === r.value && <Icon name="check" size={14} color="#3b82f6" />}
                              {r.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions dropdown */}
                    <div className="quick-add-card__dropdown-wrap" style={{ marginLeft: "auto" }}>
                      <button
                        type="button"
                        className="quick-add-card__actions-btn"
                        onClick={() => { setShowActionsMenu(!showActionsMenu); setShowReminderMenu(false); }}
                      >
                        actions <Icon name="chevron-down" size={12} />
                      </button>
                      {showActionsMenu && (
                        <div className="quick-add-card__dropdown quick-add-card__dropdown--right">
                          {ACTIONS_MENU.map((a) => (
                            <button
                              key={a.key}
                              type="button"
                              className="quick-add-card__dropdown-item"
                              onClick={() => {
                                if (a.key === "address") {
                                  setShowActionsMenu(false);
                                  // Focus location — just close menu, field is visible below
                                }
                                setShowActionsMenu(false);
                              }}
                            >
                              <Icon name={a.icon} size={15} color="#64748b" />
                              {a.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Activity Type Row ─────────────── */}
                <div className="quick-add-card__type-row">
                  <Icon name={getActivityIcon(actType)} size={14} color={getActivityColor(actType)} />
                  <span className="quick-add-card__type-label">Type:</span>
                  <div style={{ flex: 1 }}>
                    <SelectInput
                      value={actType}
                      onChange={(v) => setActType((v as ActivityType) ?? "CALL")}
                      options={ACTIVITY_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                    />
                  </div>
                </div>

                {/* ── Customer (Contact) Row ──────── */}
                <div className="quick-add-card__field-row">
                  <Icon name="user" size={14} color="#94a3b8" />
                  <span className="quick-add-card__field-label">Customer:</span>
                  <span className="quick-add-card__field-value">
                    {lead.contact.firstName} {lead.contact.lastName}
                  </span>
                </div>

                {/* ── Location Row ────────────────── */}
                <div className="quick-add-card__field-row">
                  <Icon name="map-pin" size={14} color="#94a3b8" />
                  <span className="quick-add-card__field-label">Location:</span>
                  <input
                    type="text"
                    className="quick-add-card__field-input"
                    placeholder="add"
                    value={actLocation}
                    onChange={(e) => setActLocation(e.target.value)}
                  />
                </div>

                {/* ── Save / Cancel ───────────────── */}
                <div className="quick-add-card__footer">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleAddActivity}
                    disabled={createActivity.isPending}
                  >
                    SAVE
                  </Button>
                  <button
                    type="button"
                    className="quick-add-card__cancel"
                    onClick={() => {
                      setShowAddActivity(false);
                      setActSubject("");
                      setActDescription("");
                      setActScheduledAt("");
                      setActLocation("");
                      setActReminder("");
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {/* ── Recent Activities Header ───────────── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0 10px" }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                Recent Activities
              </h4>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                {lead.activities?.length ?? 0} total
              </span>
            </div>

            {/* ── Activity Timeline ──────────────────── */}
            {lead.activities && lead.activities.length > 0 ? (
              <div className="activity-timeline">
                {lead.activities.map((activity) => {
                  const iconColor = getActivityColor(activity.type);
                  return (
                    <div key={activity.id} className="activity-timeline__item">
                      <div
                        className="activity-timeline__icon"
                        style={{ background: `${iconColor}15`, color: iconColor }}
                      >
                        <Icon name={getActivityIcon(activity.type)} size={14} color={iconColor} />
                      </div>
                      <div className="activity-timeline__body">
                        <div className="activity-timeline__header">
                          <span className="activity-timeline__subject">{activity.subject}</span>
                          <Badge variant="outline" style={{ fontSize: 10 }}>{activity.type}</Badge>
                        </div>
                        {activity.outcome && (
                          <p className="activity-timeline__outcome">
                            <Icon name="check" size={12} color="#16a34a" /> {activity.outcome}
                          </p>
                        )}
                        <div className="activity-timeline__meta">
                          {activity.scheduledAt && (
                            <span><Icon name="calendar" size={11} /> {formatDate(activity.scheduledAt, "dd MMM, hh:mm a")}</span>
                          )}
                          {activity.completedAt && (
                            <span style={{ color: "#16a34a" }}><Icon name="check" size={11} /> Completed {relativeTime(activity.completedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6" style={{ textAlign: "center" }}>
                <Icon name="activity" size={32} color="#cbd5e1" />
                <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
                  No activities yet. Add your first activity above.
                </p>
              </div>
            )}
          </div>
        );

      // ── Quotations ────────────────────────────────────
      case "quotations":
        return (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                <Icon name="file-text" size={14} /> Quotations
              </h4>
              <Button size="sm" variant="primary" onClick={handleNewQuotation}>
                <Icon name="plus" size={14} /> New Quotation
              </Button>
            </div>
            {quotations.length > 0 ? (
              <div className="space-y-2">
                {quotations.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.open(`/quotations/${q.id}`, "_blank")}
                  >
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                        {q.quotationNo}
                      </p>
                      {q.title && (
                        <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{q.title}</p>
                      )}
                      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        {formatDate(q.createdAt)}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                        {"\u20B9"} {q.totalAmount?.toLocaleString("en-IN") ?? "0"}
                      </span>
                      <Badge
                        variant={
                          q.status === "ACCEPTED" ? "success"
                          : q.status === "REJECTED" || q.status === "CANCELLED" ? "danger"
                          : q.status === "SENT" || q.status === "VIEWED" ? "primary"
                          : q.status === "EXPIRED" ? "warning"
                          : "secondary"
                        }
                      >
                        {q.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6" style={{ textAlign: "center" }}>
                <Icon name="file-text" size={32} color="#cbd5e1" />
                <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
                  No quotations yet.
                </p>
              </div>
            )}
          </div>
        );

      // ── Proforma Invoices ─────────────────────────────
      case "proforma":
        return (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                <Icon name="file-check" size={14} /> Proforma Invoices
              </h4>
              <Button size="sm" variant="primary" onClick={handleNewProforma}>
                <Icon name="plus" size={14} /> New Proforma
              </Button>
            </div>
            {(proformas as any[]).length > 0 ? (
              <div className="space-y-2">
                {(proformas as any[]).map((pi: any) => (
                  <div
                    key={pi.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.open(`/finance/proforma-invoices/${pi.id}`, "_blank")}
                  >
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                        {pi.proformaNo}
                      </p>
                      <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        {pi.billingName}
                      </p>
                      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        {pi.proformaDate ? formatDate(pi.proformaDate) : formatDate(pi.createdAt)}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                        {"\u20B9"} {pi.totalAmount?.toLocaleString("en-IN") ?? "0"}
                      </span>
                      <Badge
                        variant={
                          pi.status === "PI_CONVERTED" ? "success"
                          : pi.status === "PI_CANCELLED" || pi.status === "PI_REJECTED" ? "danger"
                          : pi.status === "PI_SENT" ? "primary"
                          : pi.status === "PI_ACCEPTED" ? "success"
                          : "secondary"
                        }
                      >
                        {pi.status?.replace("PI_", "")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6" style={{ textAlign: "center" }}>
                <Icon name="file-check" size={32} color="#cbd5e1" />
                <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
                  No proforma invoices yet.
                </p>
              </div>
            )}
          </div>
        );

      // ── Invoices ───────────────────────────────────────
      case "invoices":
        return (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                <Icon name="receipt" size={14} /> Invoices
              </h4>
              <Button size="sm" variant="primary" onClick={handleNewInvoice}>
                <Icon name="plus" size={14} /> New Invoice
              </Button>
            </div>
            {invoices.length > 0 ? (
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.open(`/invoices/${inv.id}`, "_blank")}
                  >
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                        {inv.invoiceNo}
                      </p>
                      <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        {inv.billingName}
                      </p>
                      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        Due: {formatDate(inv.dueDate)}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                          {"\u20B9"} {inv.totalAmount?.toLocaleString("en-IN") ?? "0"}
                        </span>
                        {inv.balanceAmount > 0 && (
                          <p style={{ fontSize: 11, color: "#ef4444", marginTop: 2 }}>
                            Balance: {"\u20B9"} {inv.balanceAmount.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          inv.status === "PAID" ? "success"
                          : inv.status === "OVERDUE" ? "danger"
                          : inv.status === "PARTIALLY_PAID" ? "warning"
                          : inv.status === "SENT" ? "primary"
                          : inv.status === "CANCELLED" || inv.status === "VOID" ? "danger"
                          : "secondary"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6" style={{ textAlign: "center" }}>
                <Icon name="receipt" size={32} color="#cbd5e1" />
                <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
                  No invoices yet.
                </p>
              </div>
            )}
          </div>
        );

      // ── Payments ───────────────────────────────────────
      case "payments":
        return (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                <Icon name="indian-rupee" size={14} /> Payments
              </h4>
            </div>
            {payments.length > 0 ? (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
                  >
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                        {p.paymentNo}
                      </p>
                      <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        {p.method} {p.gateway !== "MANUAL" ? `via ${p.gateway}` : ""}
                      </p>
                      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        {p.paidAt ? formatDate(p.paidAt) : formatDate(p.createdAt)}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#16a34a" }}>
                        {"\u20B9"} {p.amount?.toLocaleString("en-IN") ?? "0"}
                      </span>
                      <Badge
                        variant={
                          p.status === "PAID" || p.status === "CAPTURED" ? "success"
                          : p.status === "FAILED" ? "danger"
                          : p.status === "REFUNDED" || p.status === "PARTIALLY_REFUNDED" ? "warning"
                          : "secondary"
                        }
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6" style={{ textAlign: "center" }}>
                <Icon name="indian-rupee" size={32} color="#cbd5e1" />
                <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
                  No payments yet.
                </p>
              </div>
            )}
          </div>
        );

      // ── Contact ───────────────────────────────────────
      case "contact":
        return (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <dl className="sp-dashboard__info-table">
              <dt>First Name</dt>
              <dd>{lead.contact.firstName}</dd>

              <dt>Last Name</dt>
              <dd>{lead.contact.lastName}</dd>

              <dt>Designation</dt>
              <dd>{lead.contact.designation ?? "\u2014"}</dd>
            </dl>
          </div>
        );

      // ── Organization ──────────────────────────────────
      case "organization":
        return lead.organization ? (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <dl className="sp-dashboard__info-table">
              <dt>Name</dt>
              <dd>{lead.organization.name}</dd>

              <dt>City</dt>
              <dd>{lead.organization.city ?? "\u2014"}</dd>
            </dl>
          </div>
        ) : (
          <div
            className="rounded-lg border border-gray-200 bg-white p-6"
            style={{ textAlign: "center" }}
          >
            <Icon name="building-2" size={32} color="#cbd5e1" />
            <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
              No organization linked
            </p>
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
      topContent={<LeadPipeline leadId={entityId} />}
    >
      {renderTabContent()}
    </EntityDashboardLayout>
  );
}
