"use client";

import { useCallback, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { Button, Icon, Badge } from "@/components/ui";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { useConfirmDialog } from "@/components/common/useConfirmDialog";
import { formatDate } from "@/lib/format-date";

import { VerifyButton } from "@/features/entity-verification";

import {
  useRawContactDetail,
  useVerifyRawContact,
  useRejectRawContact,
  useMarkDuplicate,
  useReopenRawContact,
} from "../hooks/useRawContacts";

import type { RawContactCommunication, RawContactStatus } from "../types/raw-contacts.types";

// ── Props ────────────────────────────────────────────────

interface RawContactDetailProps {
  rawContactId: string;
}

// ── Helpers ──────────────────────────────────────────────

const COMM_ICONS: Record<string, string> = {
  EMAIL: "mail",
  PHONE: "phone",
  MOBILE: "smartphone",
  WHATSAPP: "message-circle",
  ADDRESS: "map-pin",
};

function commIcon(comm: RawContactCommunication) {
  return COMM_ICONS[comm.type] ?? "circle";
}

const STATUS_BADGE_VARIANT: Record<RawContactStatus, "warning" | "success" | "danger" | "secondary"> = {
  RAW: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
  DUPLICATE: "secondary",
};

// ── Component ────────────────────────────────────────────

export function RawContactDetail({ rawContactId }: RawContactDetailProps) {
  const router = useRouter();
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const { data, isLoading } = useRawContactDetail(rawContactId);
  const verifyMutation = useVerifyRawContact();
  const rejectMutation = useRejectRawContact();
  const markDuplicateMutation = useMarkDuplicate();
  const reopenMutation = useReopenRawContact();

  const [rejectReason, setRejectReason] = useState("");

  const contact = data?.data;

  const handleVerify = useCallback(async () => {
    if (!contact) return;
    const ok = await confirm({
      title: "Verify Raw Contact",
      message: `Are you sure you want to verify ${contact.firstName} ${contact.lastName}? This will create a new Contact record.`,
      type: "warning",
      confirmText: "Verify",
    });
    if (!ok) return;
    try {
      await verifyMutation.mutateAsync({ id: rawContactId });
      toast.success("Raw contact verified — Contact created");
    } catch {
      toast.error("Failed to verify raw contact");
    }
  }, [contact, confirm, verifyMutation, rawContactId]);

  const handleReject = useCallback(async () => {
    if (!contact) return;
    const ok = await confirm({
      title: "Reject Raw Contact",
      message: `Are you sure you want to reject ${contact.firstName} ${contact.lastName}?`,
      type: "warning",
      confirmText: "Reject",
    });
    if (!ok) return;
    try {
      await rejectMutation.mutateAsync({
        id: rawContactId,
        data: rejectReason ? { reason: rejectReason } : undefined,
      });
      toast.success("Raw contact rejected");
    } catch {
      toast.error("Failed to reject raw contact");
    }
  }, [contact, confirm, rejectMutation, rawContactId, rejectReason]);

  const handleMarkDuplicate = useCallback(async () => {
    if (!contact) return;
    const ok = await confirm({
      title: "Mark as Duplicate",
      message: `Are you sure you want to mark ${contact.firstName} ${contact.lastName} as a duplicate?`,
      type: "warning",
      confirmText: "Mark Duplicate",
    });
    if (!ok) return;
    try {
      await markDuplicateMutation.mutateAsync(rawContactId);
      toast.success("Raw contact marked as duplicate");
    } catch {
      toast.error("Failed to mark as duplicate");
    }
  }, [contact, confirm, markDuplicateMutation, rawContactId]);

  const handleReopen = useCallback(async () => {
    try {
      await reopenMutation.mutateAsync(rawContactId);
      toast.success("Raw contact reopened");
    } catch {
      toast.error("Failed to reopen raw contact");
    }
  }, [reopenMutation, rawContactId]);

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!contact) {
    return (
      <div className="p-6">
        <EmptyState
          icon="user"
          title="Raw contact not found"
          description="The raw contact you're looking for doesn't exist."
          action={{ label: "Back to Raw Contacts", onClick: () => router.push("/raw-contacts") }}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title={`${contact.firstName} ${contact.lastName}`}
        subtitle={contact.designation ?? undefined}
        actions={
          <div className="flex flex-wrap gap-2 items-center">
            <VerifyButton
              entityType="RAW_CONTACT"
              entityId={rawContactId}
              entityName={`${contact.firstName} ${contact.lastName}`}
              entityEmail={contact.communications?.find((c: RawContactCommunication) => c.type === "EMAIL")?.value}
              entityPhone={contact.communications?.find((c: RawContactCommunication) => c.type === "PHONE" || c.type === "MOBILE")?.value}
              initialStatus={contact.entityVerificationStatus ?? "UNVERIFIED"}
            />
            <Button variant="outline" onClick={() => router.push("/raw-contacts")}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
            {contact.status === "RAW" && (
              <>
                <Link href={`/raw-contacts/${rawContactId}/edit`}>
                  <Button variant="outline">
                    <Icon name="edit" size={16} /> Edit
                  </Button>
                </Link>
                <Button variant="primary" onClick={handleVerify}>
                  <Icon name="check-circle" size={16} /> Verify
                </Button>
                <Button variant="danger" onClick={handleReject}>
                  <Icon name="x-circle" size={16} /> Reject
                </Button>
                <Button variant="outline" onClick={handleMarkDuplicate}>
                  <Icon name="copy" size={16} /> Duplicate
                </Button>
              </>
            )}
            {contact.status === "REJECTED" && (
              <Button variant="primary" onClick={handleReopen}>
                <Icon name="refresh-cw" size={16} /> Reopen
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
              Raw Contact Information
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
                  <Badge variant={STATUS_BADGE_VARIANT[contact.status]}>
                    {contact.status}
                  </Badge>
                </p>
              </div>
              {contact.source && (
                <div>
                  <span className="text-gray-500">Source</span>
                  <p>
                    <Badge variant="outline">{contact.source.replace(/_/g, " ")}</Badge>
                  </p>
                </div>
              )}
              {contact.companyName && (
                <div>
                  <span className="text-gray-500">Company</span>
                  <p className="font-medium">{contact.companyName}</p>
                </div>
              )}
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
              Communications ({contact.communications?.length ?? 0})
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

          {/* Reject reason input (only when RAW) */}
          {contact.status === "RAW" && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Rejection Reason (optional)
              </h3>
              <textarea
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                rows={2}
                placeholder="Enter reason if rejecting..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Right column: Sidebar */}
        <div className="space-y-6">
          {/* Created By */}
          {contact.createdBy && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Created By
              </h3>
              <p className="text-sm font-medium">
                {contact.createdBy.firstName} {contact.createdBy.lastName}
              </p>
              <p className="text-xs text-gray-500">{formatDate(contact.createdAt)}</p>
            </div>
          )}

          {/* Verified Info */}
          {contact.status === "VERIFIED" && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-green-700">
                Verification
              </h3>
              <div className="space-y-2 text-sm">
                {contact.verifiedAt && (
                  <div>
                    <span className="text-green-600">Verified At</span>
                    <p className="font-medium">{formatDate(contact.verifiedAt)}</p>
                  </div>
                )}
                {contact.verifiedBy && (
                  <div>
                    <span className="text-green-600">Verified By</span>
                    <p className="font-medium">
                      {contact.verifiedBy.firstName} {contact.verifiedBy.lastName}
                    </p>
                  </div>
                )}
                {contact.contact && (
                  <div>
                    <span className="text-green-600">Linked Contact</span>
                    <p>
                      <Link
                        href={`/contacts/${contact.contactId}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {contact.contact.firstName} {contact.contact.lastName}
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filters / Tags */}
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
        </div>
      </div>

      <ConfirmDialogPortal />
    </div>
  );
}
