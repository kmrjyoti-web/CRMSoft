"use client";

import { useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { Button, Icon, Badge } from "@/components/ui";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useConfirmDialog } from "@/components/common/useConfirmDialog";
import { formatDate } from "@/lib/format-date";

import { VerifyButton } from "@/features/entity-verification";

import {
  useContactDetail,
  useDeactivateContact,
  useReactivateContact,
} from "../hooks/useContacts";

import type { ContactCommunication } from "../types/contacts.types";

// ── Props ────────────────────────────────────────────────

interface ContactDetailProps {
  contactId: string;
}

// ── Helpers ──────────────────────────────────────────────

const COMM_ICONS: Record<string, string> = {
  EMAIL: "mail",
  PHONE: "phone",
  MOBILE: "smartphone",
  WHATSAPP: "message-circle",
  ADDRESS: "map-pin",
};

function commIcon(comm: ContactCommunication) {
  return COMM_ICONS[comm.type] ?? "circle";
}

// ── Component ────────────────────────────────────────────

export function ContactDetail({ contactId }: ContactDetailProps) {
  const router = useRouter();
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const { data, isLoading } = useContactDetail(contactId);
  const deactivateMutation = useDeactivateContact();
  const reactivateMutation = useReactivateContact();

  const contact = data?.data;

  const handleDeactivate = useCallback(async () => {
    if (!contact) return;
    const ok = await confirm({
      title: "Deactivate Contact",
      message: `Are you sure you want to deactivate ${contact.firstName} ${contact.lastName}?`,
      type: "warning",
      confirmText: "Deactivate",
    });
    if (!ok) return;
    try {
      await deactivateMutation.mutateAsync(contactId);
      toast.success("Contact deactivated");
    } catch {
      toast.error("Failed to deactivate contact");
    }
  }, [contact, confirm, deactivateMutation, contactId]);

  const handleReactivate = useCallback(async () => {
    try {
      await reactivateMutation.mutateAsync(contactId);
      toast.success("Contact reactivated");
    } catch {
      toast.error("Failed to reactivate contact");
    }
  }, [reactivateMutation, contactId]);

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!contact) {
    return (
      <div className="p-6">
        <EmptyState
          icon="user"
          title="Contact not found"
          description="The contact you're looking for doesn't exist."
          action={{ label: "Back to Contacts", onClick: () => router.push("/contacts") }}
        />
      </div>
    );
  }

  const primaryEmail = contact.communications?.find(
    (c: ContactCommunication) => c.type === "EMAIL" && c.isPrimary
  )?.value ?? contact.communications?.find((c: ContactCommunication) => c.type === "EMAIL")?.value;
  const primaryPhone = contact.communications?.find(
    (c: ContactCommunication) => (c.type === "PHONE" || c.type === "MOBILE") && c.isPrimary
  )?.value ?? contact.communications?.find((c: ContactCommunication) => c.type === "PHONE" || c.type === "MOBILE")?.value;

  return (
    <div className="p-6">
      <PageHeader
        title={`${contact.firstName} ${contact.lastName}`}
        subtitle={contact.designation ?? undefined}
        actions={
          <div className="flex gap-2 items-center">
            <VerifyButton
              entityType="CONTACT"
              entityId={contactId}
              entityName={`${contact.firstName} ${contact.lastName}`}
              entityEmail={primaryEmail}
              entityPhone={primaryPhone}
              initialStatus={contact.entityVerificationStatus ?? "UNVERIFIED"}
            />
            <Button variant="outline" onClick={() => router.push("/contacts")}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
            <Link href={`/contacts/${contactId}/edit`}>
              <Button variant="outline">
                <Icon name="edit" size={16} /> Edit
              </Button>
            </Link>
            {contact.isActive ? (
              <Button variant="danger" onClick={handleDeactivate}>
                <Icon name="trash" size={16} /> Deactivate
              </Button>
            ) : (
              <Button variant="primary" onClick={handleReactivate}>
                <Icon name="refresh-cw" size={16} /> Reactivate
              </Button>
            )}
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Contact info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name</span>
                <p className="font-medium">
                  {contact.firstName} {contact.lastName}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Status</span>
                <p>
                  <StatusBadge
                    status={contact.isActive ? "active" : "inactive"}
                  />
                </p>
              </div>
              {contact.designation && (
                <div>
                  <span className="text-gray-500">Designation</span>
                  <p className="font-medium">{contact.designation}</p>
                </div>
              )}
              {contact.department && (
                <div>
                  <span className="text-gray-500">Department</span>
                  <p className="font-medium">{contact.department}</p>
                </div>
              )}
              <div>
                <span className="text-gray-500">Created</span>
                <p>{formatDate(contact.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-500">Updated</span>
                <p>{formatDate(contact.updatedAt)}</p>
              </div>
            </div>
            {contact.notes && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-500">Notes</span>
                <p className="mt-1 text-sm whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}
          </div>

          {/* Communications */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Communications ({contact.counts?.communications ?? contact.communications?.length ?? 0})
            </h3>
            {contact.communications?.length > 0 ? (
              <div className="space-y-3">
                {contact.communications.map((comm) => (
                  <div
                    key={comm.id}
                    className="flex items-center gap-3 rounded-md border border-gray-100 px-3 py-2"
                  >
                    <Icon name={commIcon(comm)} size={16} className="text-gray-400" />
                    <span className="flex-1 text-sm">{comm.value}</span>
                    <Badge variant="secondary">{comm.type}</Badge>
                    {comm.isPrimary && <Badge variant="success">Primary</Badge>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No communications recorded.</p>
            )}
          </div>

          {/* Organizations */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Organizations
            </h3>
            {contact.contactOrganizations?.length > 0 ? (
              <div className="space-y-3">
                {contact.contactOrganizations.map((co) => (
                  <div
                    key={co.id}
                    className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{co.organization.name}</p>
                      {co.organization.industry && (
                        <p className="text-xs text-gray-500">{co.organization.industry}</p>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {co.relationType.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No organizations linked.</p>
            )}
          </div>
        </div>

        {/* Right column: Sidebar */}
        <div className="space-y-6">
          {/* Counts */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Activity Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  <Icon name="target" size={14} className="mr-2 inline" />
                  Leads
                </span>
                <span className="font-semibold">{contact.counts?.leads ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  <Icon name="mail" size={14} className="mr-2 inline" />
                  Communications
                </span>
                <span className="font-semibold">
                  {contact.counts?.communications ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  <Icon name="activity" size={14} className="mr-2 inline" />
                  Activities
                </span>
                <span className="font-semibold">
                  {contact.counts?.activities ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Filters */}
          {contact.filters?.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {contact.filters.map((f) => (
                  <Badge key={f.id} variant="default">
                    {f.lookupValue.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Leads */}
          {contact.leads?.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Recent Leads
              </h3>
              <div className="space-y-2">
                {contact.leads.slice(0, 5).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{lead.leadNumber}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(lead.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={lead.status.toLowerCase()} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialogPortal />
    </div>
  );
}
