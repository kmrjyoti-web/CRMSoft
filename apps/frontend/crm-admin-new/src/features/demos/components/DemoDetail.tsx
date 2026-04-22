"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import {
  Button,
  Icon,
  Badge,
  Modal,
  SelectInput,
  DatePicker,
  NumberInput,
  TextareaInput,
} from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/format-date";

import {
  useDemoDetail,
  useRescheduleDemo,
  useCompleteDemo,
  useCancelDemo,
} from "../hooks/useDemos";
import type { DemoResult } from "../types/demos.types";

// ── Helpers ──────────────────────────────────────────────

const RESULT_VARIANT: Record<DemoResult, "success" | "danger" | "warning" | "secondary"> = {
  INTERESTED: "success",
  NOT_INTERESTED: "danger",
  FOLLOW_UP: "warning",
  NO_SHOW: "secondary",
};

const STATUS_COLOR_MAP: Record<string, string> = {
  scheduled: "blue",
  rescheduled: "yellow",
  completed: "green",
  cancelled: "gray",
  "no-show": "red",
};

const RESULT_OPTIONS: { label: string; value: string }[] = [
  { label: "Interested", value: "INTERESTED" },
  { label: "Not Interested", value: "NOT_INTERESTED" },
  { label: "Follow Up", value: "FOLLOW_UP" },
  { label: "No Show", value: "NO_SHOW" },
];

// ── Props ────────────────────────────────────────────────

interface DemoDetailProps {
  demoId: string;
}

// ── Component ────────────────────────────────────────────

export function DemoDetail({ demoId }: DemoDetailProps) {
  const router = useRouter();

  const { data, isLoading } = useDemoDetail(demoId);
  const rescheduleMutation = useRescheduleDemo();
  const completeMutation = useCompleteDemo();
  const cancelMutation = useCancelDemo();

  const demo = data?.data;

  // ── Reschedule Modal state ──
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  // ── Complete Modal state ──
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeResult, setCompleteResult] = useState("");
  const [completeOutcome, setCompleteOutcome] = useState("");
  const [completeDuration, setCompleteDuration] = useState<number | null>(null);

  // ── Cancel Modal state ──
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // ── Handlers ──

  const handleReschedule = useCallback(async () => {
    if (!rescheduleDate) {
      toast.error("Please select a new date");
      return;
    }
    try {
      await rescheduleMutation.mutateAsync({
        id: demoId,
        data: {
          scheduledAt: rescheduleDate,
          reason: rescheduleReason || undefined,
        },
      });
      toast.success("Demo rescheduled");
      setShowRescheduleModal(false);
      setRescheduleDate("");
      setRescheduleReason("");
    } catch {
      toast.error("Failed to reschedule demo");
    }
  }, [demoId, rescheduleDate, rescheduleReason, rescheduleMutation]);

  const handleComplete = useCallback(async () => {
    if (!completeResult) {
      toast.error("Please select a result");
      return;
    }
    try {
      await completeMutation.mutateAsync({
        id: demoId,
        data: {
          result: completeResult as DemoResult,
          outcome: completeOutcome || undefined,
        },
      });
      toast.success("Demo completed");
      setShowCompleteModal(false);
      setCompleteResult("");
      setCompleteOutcome("");
      setCompleteDuration(null);
    } catch {
      toast.error("Failed to complete demo");
    }
  }, [demoId, completeResult, completeOutcome, completeMutation]);

  const handleCancel = useCallback(async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancel reason");
      return;
    }
    try {
      await cancelMutation.mutateAsync({
        id: demoId,
        data: { cancelReason: cancelReason.trim() },
      });
      toast.success("Demo cancelled");
      setShowCancelModal(false);
      setCancelReason("");
    } catch {
      toast.error("Failed to cancel demo");
    }
  }, [demoId, cancelReason, cancelMutation]);

  // ── Loading / Not found ──

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!demo) {
    return (
      <div className="p-6">
        <EmptyState
          icon="monitor"
          title="Demo not found"
          description="The demo you're looking for doesn't exist."
          action={{
            label: "Back to Demos",
            onClick: () => router.push("/demos"),
          }}
        />
      </div>
    );
  }

  const isActionable = demo.status === "SCHEDULED" || demo.status === "RESCHEDULED";

  return (
    <div className="p-6">
      <PageHeader
        title={`Demo — ${demo.lead?.leadNumber ?? demoId}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
            <Link href={`/demos/${demoId}/edit`}>
              <Button variant="outline">
                <Icon name="edit" size={16} /> Edit
              </Button>
            </Link>
          </div>
        }
      />

      {/* Status bar */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <span className="text-sm text-gray-500">Status:</span>
        <StatusBadge
          status={demo.status.toLowerCase().replace(/_/g, "-")}
          colorMap={STATUS_COLOR_MAP}
        />

        {isActionable && (
          <div className="ml-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRescheduleModal(true)}
            >
              <Icon name="calendar" size={14} /> Reschedule
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowCompleteModal(true)}
            >
              <Icon name="check-circle" size={14} /> Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCancelModal(true)}
            >
              <Icon name="x-circle" size={14} /> Cancel
            </Button>
          </div>
        )}

        {demo.status === "COMPLETED" && demo.result && (
          <div className="ml-4 flex items-center gap-2">
            <Badge variant={RESULT_VARIANT[demo.result]}>
              {demo.result.replace(/_/g, " ")}
            </Badge>
            {demo.outcome && (
              <span className="text-sm text-gray-500">{demo.outcome}</span>
            )}
          </div>
        )}

        {demo.status === "CANCELLED" && demo.cancelReason && (
          <div className="ml-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Reason:</span>
            <span className="text-sm text-gray-700">{demo.cancelReason}</span>
          </div>
        )}
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Demo Details card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Demo Details
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Mode</dt>
                <dd>
                  <Badge variant={demo.mode === "ONLINE" ? "primary" : "secondary"}>
                    {demo.mode}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Status</dt>
                <dd>
                  <StatusBadge
                    status={demo.status.toLowerCase().replace(/_/g, "-")}
                    colorMap={STATUS_COLOR_MAP}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Scheduled At</dt>
                <dd className="text-sm">{formatDate(demo.scheduledAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Duration</dt>
                <dd className="text-sm">
                  {demo.duration != null ? `${demo.duration} mins` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Completed At</dt>
                <dd className="text-sm">
                  {demo.completedAt ? formatDate(demo.completedAt) : "—"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Meeting Info card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Meeting Info
            </h3>
            <dl className="space-y-3">
              {demo.mode === "ONLINE" && (
                <div>
                  <dt className="text-xs text-gray-400">Meeting Link</dt>
                  <dd className="text-sm">
                    {demo.meetingLink ? (
                      <a
                        href={demo.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {demo.meetingLink}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
              )}
              {demo.mode === "OFFLINE" && (
                <div>
                  <dt className="text-xs text-gray-400">Location</dt>
                  <dd className="text-sm">{demo.location ?? "—"}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Notes card */}
          {demo.notes && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Notes
              </h3>
              <p className="whitespace-pre-wrap text-sm text-gray-600">
                {demo.notes}
              </p>
            </div>
          )}

          {/* Lead card */}
          {demo.lead && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Lead
              </h3>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-gray-400">Lead Number</dt>
                  <dd className="text-sm font-medium">{demo.lead.leadNumber}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Contact</dt>
                  <dd className="text-sm">
                    {demo.lead.contact.firstName} {demo.lead.contact.lastName}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Reschedule Count</span>
                <span className="font-medium">{demo.rescheduleCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Result</span>
                <span>
                  {demo.result ? (
                    <Badge variant={RESULT_VARIANT[demo.result]}>
                      {demo.result.replace(/_/g, " ")}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Outcome</span>
                <span className="font-medium text-right max-w-[60%] truncate">
                  {demo.outcome ?? "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Conducted By card */}
          {demo.conductedBy && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Conducted By
              </h3>
              <p className="text-sm">
                {demo.conductedBy.firstName} {demo.conductedBy.lastName}
              </p>
            </div>
          )}

          {/* Metadata card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Metadata
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Created At</dt>
                <dd>{formatDate(demo.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Updated At</dt>
                <dd>{formatDate(demo.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* ── Reschedule Modal ── */}
      <Modal
        open={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Reschedule Demo"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRescheduleModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleReschedule}
              loading={rescheduleMutation.isPending}
            >
              Reschedule
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <DatePicker
            label="New Date"
            value={rescheduleDate}
            onChange={(v) => setRescheduleDate(String(v ?? ""))}
          />
          <TextareaInput
            label="Reason"
            value={rescheduleReason}
            onChange={(e) => setRescheduleReason(e.target.value)}
            rows={3}
          />
        </div>
      </Modal>

      {/* ── Complete Modal ── */}
      <Modal
        open={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Demo"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCompleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              loading={completeMutation.isPending}
            >
              Complete
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <SelectInput
            label="Result"
            options={RESULT_OPTIONS}
            value={completeResult}
            onChange={(v) => setCompleteResult(String(v ?? ""))}
          />
          <TextareaInput
            label="Outcome"
            value={completeOutcome}
            onChange={(e) => setCompleteOutcome(e.target.value)}
            rows={3}
          />
          <NumberInput
            label="Duration (mins)"
            value={completeDuration}
            onChange={(v: number | null) => setCompleteDuration(v)}
            min={1}
            max={480}
          />
        </div>
      </Modal>

      {/* ── Cancel Modal ── */}
      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Demo"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              loading={cancelMutation.isPending}
            >
              Confirm Cancel
            </Button>
          </div>
        }
      >
        <TextareaInput
          label="Cancel Reason"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          rows={3}
        />
      </Modal>
    </div>
  );
}
