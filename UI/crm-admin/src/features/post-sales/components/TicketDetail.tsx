"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { Button, Input, Modal, Badge } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/format-date";

import {
  useTicketDetail,
  useAssignTicket,
  useResolveTicket,
  useCloseTicket,
  useReopenTicket,
  useAddComment,
} from "../hooks/usePostSales";

import type {
  TicketDetail as TicketDetailType,
  TicketStatus,
  TicketPriority,
  TicketComment,
} from "../types/post-sales.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLOR_MAP: Record<string, string> = {
  open: "primary",
  in_progress: "warning",
  on_hold: "secondary",
  resolved: "success",
  closed: "outline",
  reopened: "danger",
};

const PRIORITY_VARIANT_MAP: Record<
  TicketPriority,
  "outline" | "secondary" | "warning" | "danger"
> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "warning",
  URGENT: "danger",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TicketDetailProps {
  ticketId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TicketDetail({ ticketId }: TicketDetailProps) {
  const router = useRouter();

  const { data, isLoading } = useTicketDetail(ticketId);
  const assignTicket = useAssignTicket();
  const resolveTicket = useResolveTicket();
  const closeTicket = useCloseTicket();
  const reopenTicket = useReopenTicket();
  const addComment = useAddComment();

  const ticket = data?.data as TicketDetailType | undefined;

  // -- Modal states --
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [assignToId, setAssignToId] = useState("");
  const [resolution, setResolution] = useState("");
  const [commentText, setCommentText] = useState("");

  // -- Handlers --

  const handleAssign = useCallback(async () => {
    if (!assignToId.trim()) {
      toast.error("Please enter an assignee ID");
      return;
    }
    try {
      await assignTicket.mutateAsync({
        id: ticketId,
        data: { assignedToId: assignToId },
      });
      toast.success("Ticket assigned successfully");
      setShowAssignModal(false);
      setAssignToId("");
    } catch {
      toast.error("Failed to assign ticket");
    }
  }, [ticketId, assignToId, assignTicket]);

  const handleResolve = useCallback(async () => {
    if (!resolution.trim()) {
      toast.error("Please provide a resolution");
      return;
    }
    try {
      await resolveTicket.mutateAsync({
        id: ticketId,
        data: { resolution },
      });
      toast.success("Ticket resolved successfully");
      setShowResolveModal(false);
      setResolution("");
    } catch {
      toast.error("Failed to resolve ticket");
    }
  }, [ticketId, resolution, resolveTicket]);

  const handleClose = useCallback(async () => {
    try {
      await closeTicket.mutateAsync(ticketId);
      toast.success("Ticket closed successfully");
    } catch {
      toast.error("Failed to close ticket");
    }
  }, [ticketId, closeTicket]);

  const handleReopen = useCallback(async () => {
    try {
      await reopenTicket.mutateAsync(ticketId);
      toast.success("Ticket reopened successfully");
    } catch {
      toast.error("Failed to reopen ticket");
    }
  }, [ticketId, reopenTicket]);

  const handleAddComment = useCallback(async () => {
    if (!commentText.trim()) return;
    try {
      await addComment.mutateAsync({
        id: ticketId,
        data: { content: commentText },
      });
      setCommentText("");
      toast.success("Comment added successfully");
    } catch {
      toast.error("Failed to add comment");
    }
  }, [ticketId, commentText, addComment]);

  // -- Loading / Not found --

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!ticket) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">Ticket not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/post-sales/tickets")}
            className="mt-4"
          >
            Back to Tickets
          </Button>
        </div>
      </div>
    );
  }

  // -- Derived values --

  const comments: TicketComment[] = ticket.comments ?? [];
  const hasNotes = ticket.notes || ticket.internalNotes;

  // -- Render --

  return (
    <div className="p-6">
      {/* Page Header */}
      <PageHeader
        title={`Ticket ${ticket.ticketNo}`}
        subtitle={ticket.subject}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        }
      />

      {/* Status bar */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <span className="text-sm text-gray-500">Status:</span>
        <StatusBadge
          status={ticket.status}
          colorMap={STATUS_COLOR_MAP}
        />

        {ticket.status === "OPEN" && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAssignModal(true)}
            >
              Assign
            </Button>
            <Link href={`/post-sales/tickets/${ticketId}/edit`}>
              <Button size="sm" variant="outline">
                Edit
              </Button>
            </Link>
          </>
        )}

        {(ticket.status === "IN_PROGRESS" || ticket.status === "ON_HOLD") && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowResolveModal(true)}
          >
            Resolve
          </Button>
        )}

        {ticket.status === "RESOLVED" && (
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={handleClose}
              loading={closeTicket.isPending}
            >
              Close
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReopen}
              loading={reopenTicket.isPending}
            >
              Reopen
            </Button>
          </>
        )}

        {ticket.status === "CLOSED" && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleReopen}
            loading={reopenTicket.isPending}
          >
            Reopen
          </Button>
        )}

        {ticket.status === "REOPENED" && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowResolveModal(true)}
          >
            Resolve
          </Button>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Ticket Details
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Ticket No</dt>
                <dd className="text-sm font-medium">{ticket.ticketNo}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Subject</dt>
                <dd className="text-sm font-medium">{ticket.subject}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-400">Description</dt>
                <dd className="text-sm">
                  {ticket.description || "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Priority</dt>
                <dd className="text-sm">
                  <Badge
                    variant={
                      PRIORITY_VARIANT_MAP[ticket.priority] ?? "outline"
                    }
                  >
                    {ticket.priority}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Category</dt>
                <dd className="text-sm">
                  <Badge variant="default">{ticket.category}</Badge>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-400">Tags</dt>
                <dd className="text-sm">{ticket.tags || "\u2014"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Contact</dt>
                <dd className="text-sm">
                  {ticket.contact
                    ? `${ticket.contact.firstName} ${ticket.contact.lastName}`
                    : "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Organization</dt>
                <dd className="text-sm">
                  {ticket.organization?.name ?? "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Lead</dt>
                <dd className="text-sm">{ticket.leadId || "\u2014"}</dd>
              </div>
            </dl>
          </div>

          {/* Resolution card */}
          {ticket.resolvedAt && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Resolution
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-gray-400">Resolution</dt>
                  <dd>
                    <pre className="whitespace-pre-wrap text-sm">
                      {ticket.resolution || "\u2014"}
                    </pre>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Resolved At</dt>
                  <dd className="text-sm">{formatDate(ticket.resolvedAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Resolved By</dt>
                  <dd className="text-sm">
                    {ticket.resolvedById || "\u2014"}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Comments card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Comments
            </h3>

            {comments.length === 0 ? (
              <p className="text-sm text-gray-400">No comments yet</p>
            ) : (
              <div className="space-y-0">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b border-gray-200 py-3 last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {comment.author
                          ? `${comment.author.firstName} ${comment.author.lastName}`
                          : "Unknown"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment form */}
            <div className="mt-4 space-y-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                rows={3}
                placeholder="Add a comment..."
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddComment}
                disabled={!commentText.trim()}
              >
                Add Comment
              </Button>
            </div>
          </div>

          {/* Notes card */}
          {hasNotes && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Notes
              </h3>
              <dl className="space-y-3">
                {ticket.notes && (
                  <div>
                    <dt className="text-xs text-gray-400">Notes</dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {ticket.notes}
                      </pre>
                    </dd>
                  </div>
                )}
                {ticket.internalNotes && (
                  <div>
                    <dt className="text-xs text-gray-400">Internal Notes</dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {ticket.internalNotes}
                      </pre>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Status
            </h3>
            <div className="space-y-2">
              <StatusBadge
                status={ticket.status}
                colorMap={STATUS_COLOR_MAP}
              />
              <div className="mt-2">
                <Badge
                  variant={
                    PRIORITY_VARIANT_MAP[ticket.priority] ?? "outline"
                  }
                >
                  {ticket.priority}
                </Badge>
              </div>
            </div>
          </div>

          {/* Assignment card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Assignment
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Assigned To</dt>
                <dd>
                  {ticket.assignedTo
                    ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                    : "Unassigned"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Metadata card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Metadata
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Created At</dt>
                <dd>{formatDate(ticket.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Updated At</dt>
                <dd>{formatDate(ticket.updatedAt)}</dd>
              </div>
              {ticket.closedAt && (
                <div>
                  <dt className="text-xs text-gray-400">Closed At</dt>
                  <dd>{formatDate(ticket.closedAt)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* ── Assign Modal ── */}
      <Modal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Ticket"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAssignModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssign}
              loading={assignTicket.isPending}
              disabled={!assignToId.trim()}
            >
              Assign
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To *
            </label>
            <Input
              value={assignToId}
              onChange={(v: string) => setAssignToId(v)}
            />
          </div>
        </div>
      </Modal>

      {/* ── Resolve Modal ── */}
      <Modal
        open={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Resolve Ticket"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowResolveModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleResolve}
              loading={resolveTicket.isPending}
              disabled={!resolution.trim()}
            >
              Resolve
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resolution *
            </label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              rows={4}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
