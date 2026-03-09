"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, Icon, Badge, Avatar } from "@/components/ui";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { formatDate } from "@/lib/format-date";
import { HelpButton } from "@/components/common/HelpButton";

import { useLeadDetail } from "../hooks/useLeads";
import { useLeadWorkflowHistory } from "@/features/workflows/hooks/useWorkflowExecution";

import { LeadPipeline } from "./LeadPipeline";
import { LeadWorkflowHelpContent } from "./LeadWorkflowHelp";
import { LeadListDevHelp } from "../help/LeadListDevHelp";

import type { LeadPriority } from "../types/leads.types";

// ── Helpers ──────────────────────────────────────────────

const PRIORITY_VARIANT: Record<LeadPriority, "secondary" | "warning" | "danger"> = {
  LOW: "secondary",
  MEDIUM: "secondary",
  HIGH: "warning",
  URGENT: "danger",
};

// ── Props ────────────────────────────────────────────────

interface LeadDetailProps {
  leadId: string;
}

// ── Component ────────────────────────────────────────────

export function LeadDetail({ leadId }: LeadDetailProps) {
  const router = useRouter();
  const { data, isLoading } = useLeadDetail(leadId);
  const { data: historyData } = useLeadWorkflowHistory(leadId);

  const lead = data?.data;
  const history = historyData?.data ?? [];

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!lead) {
    return (
      <div className="p-6">
        <EmptyState
          icon="file-text"
          title="Lead not found"
          description="The lead you're looking for doesn't exist."
          action={{
            label: "Back to Leads",
            onClick: () => router.push("/leads"),
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title={`${lead.leadNumber} — ${lead.contact.firstName} ${lead.contact.lastName}`}
        actions={
          <div className="flex gap-2">
            <HelpButton
              panelId="lead-detail-help"
              title="Lead Pipeline — Help"
              userContent={<LeadWorkflowHelpContent />}
              devContent={<LeadListDevHelp />}
            />
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
            <Link href={`/leads/${leadId}/edit`}>
              <Button variant="outline">
                <Icon name="edit" size={16} /> Edit
              </Button>
            </Link>
          </div>
        }
      />

      {/* Pipeline stepper */}
      <div className="mt-4">
        <LeadPipeline leadId={leadId} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead details */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Lead Details
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Priority</dt>
                <dd>
                  <Badge
                    variant={PRIORITY_VARIANT[lead.priority] ?? "secondary"}
                  >
                    {lead.priority}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Expected Value</dt>
                <dd className="text-sm">
                  {lead.expectedValue != null
                    ? `₹ ${lead.expectedValue.toLocaleString("en-IN")}`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Expected Close Date</dt>
                <dd className="text-sm">
                  {lead.expectedCloseDate
                    ? formatDate(lead.expectedCloseDate)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Assignee</dt>
                <dd className="flex items-center gap-2 text-sm">
                  {lead.allocatedTo ? (
                    <>
                      <Avatar
                        fallback={`${lead.allocatedTo.firstName[0]}${lead.allocatedTo.lastName[0]}`}
                        size="sm"
                      />
                      {lead.allocatedTo.firstName} {lead.allocatedTo.lastName}
                    </>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Notes
              </h3>
              <p className="whitespace-pre-wrap text-sm text-gray-600">
                {lead.notes}
              </p>
            </div>
          )}

          {/* Contact info */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Contact
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Name</dt>
                <dd className="text-sm">
                  {lead.contact.firstName} {lead.contact.lastName}
                </dd>
              </div>
              {lead.contact.designation && (
                <div>
                  <dt className="text-xs text-gray-400">Designation</dt>
                  <dd className="text-sm">{lead.contact.designation}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Organization */}
          {lead.organization && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Organization
              </h3>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-gray-400">Name</dt>
                  <dd className="text-sm">{lead.organization.name}</dd>
                </div>
                {lead.organization.city && (
                  <div>
                    <dt className="text-xs text-gray-400">City</dt>
                    <dd className="text-sm">{lead.organization.city}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Activities */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Activities
            </h3>
            {lead.activities && lead.activities.length > 0 ? (
              <div className="space-y-2">
                {lead.activities.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{a.subject}</p>
                      <p className="text-xs text-gray-500">{a.type}</p>
                    </div>
                    {a.outcome && (
                      <Badge variant="secondary">{a.outcome}</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No activities yet.</p>
            )}
          </div>

          {/* Workflow History */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              <Icon name="history" size={14} /> Pipeline History
            </h3>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 border-l-2 border-gray-200 pl-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {entry.fromState && entry.toState ? (
                          <span className="text-sm">
                            <span className="font-medium">{entry.fromState.name}</span>
                            {" → "}
                            <span className="font-medium">{entry.toState.name}</span>
                          </span>
                        ) : entry.toState ? (
                          <span className="text-sm">
                            Started at{" "}
                            <span className="font-medium">{entry.toState.name}</span>
                          </span>
                        ) : null}
                        {entry.action === "FAST_FORWARD" && (
                          <Badge variant="outline">Auto</Badge>
                        )}
                        {entry.action === "APPROVAL_REQUESTED" && (
                          <Badge variant="warning">Pending Approval</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {entry.performedByName} — {formatDate(entry.createdAt)}
                      </p>
                      {entry.comment && (
                        <p className="mt-1 text-xs text-gray-500 italic">
                          &ldquo;{entry.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No history yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity counts */}
          {lead._count && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Activities</span>
                  <span className="font-medium">{lead._count.activities}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Demos</span>
                  <span className="font-medium">{lead._count.demos}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Quotations</span>
                  <span className="font-medium">{lead._count.quotations}</span>
                </div>
              </div>
            </div>
          )}

          {/* Filters / Tags */}
          {lead.filters && lead.filters.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {lead.filters.map((f) => (
                  <Badge key={f.id} variant="outline">
                    {f.lookupValue.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Details
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Created</dt>
                <dd>{formatDate(lead.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Updated</dt>
                <dd>{formatDate(lead.updatedAt)}</dd>
              </div>
              {lead.createdBy && (
                <div>
                  <dt className="text-xs text-gray-400">Created by</dt>
                  <dd>
                    {lead.createdBy.firstName} {lead.createdBy.lastName}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

    </div>
  );
}
